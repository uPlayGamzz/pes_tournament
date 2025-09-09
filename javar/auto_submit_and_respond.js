/* ====== CONFIG: set your deployed web app URL here ====== */
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwKkqcfNdJ9j9GOti3K3lNAqU2KP87_gbPaeS5lRFIV6caBUq-QgXlm7OLu6WpsKG9g/exec";

let isSubmitting = false;

// Helper: find select elements (support multiple ID/name variants)
function getSelects() {
  const playerSel =
    document.querySelector("#playerCode") ||
    document.querySelector("#playercode") ||
    document.querySelector("select[name='playerCode']") ||
    document.querySelector("select[name='playercode']");
  const oppSel =
    document.querySelector("#opponentCode") ||
    document.querySelector("#opponentcode") ||
    document.querySelector("select[name='opponentCode']") ||
    document.querySelector("select[name='opponentcode']");
  return { playerSel, oppSel };
}

function clearSelect(sel) {
  while (sel && sel.options && sel.options.length > 0) sel.remove(0);
}

// Populate selects but preserve current selection if still valid
function populateSelects(players) {
  const { playerSel, oppSel } = getSelects();
  if (!playerSel || !oppSel) return;

  const prevPlayer = playerSel.value || "";
  const prevOpp = oppSel.value || "";

  clearSelect(playerSel);
  clearSelect(oppSel);

  const blank = new Option("-- Select --", "");
  playerSel.add(blank.cloneNode(true));
  oppSel.add(blank.cloneNode(true));

  players.forEach(p => {
    const code = p.code || "";

    // ----- PLAYER SELECT -----
    const opt1 = new Option(code, code);
    if (!p.availableSelf) {
      opt1.disabled = true; // code already taken as player
      opt1.text = code + " (taken)";
    }
    playerSel.add(opt1);

    // ----- OPPONENT SELECT -----
    let opt2;
    if (p.matchedWith) {
      // This player is already matched
      if (p.matchedWith === prevPlayer) {
        // Allow only if it's the proper opponent
        opt2 = new Option(code + " (locked to you)", code);
      } else {
        // Already matched with someone else → disable
        opt2 = new Option(code + " (already matched)", code);
        opt2.disabled = true;
      }
    } else {
      // Normal availability
      opt2 = new Option(code, code);
      if (!p.availableOpponent) {
        opt2.disabled = true;
        opt2.text = code + " (taken)";
      }
    }
    oppSel.add(opt2);
  });

  // restore previous selections if still valid
  if (prevPlayer) {
    const found = Array.from(playerSel.options).find(o => o.value === prevPlayer);
    playerSel.value = (found && !found.disabled) ? prevPlayer : "";
  }
  if (prevOpp) {
    const found = Array.from(oppSel.options).find(o => o.value === prevOpp);
    oppSel.value = (found && !found.disabled) ? prevOpp : "";
  }

  syncSelectionToOpponent();
}

// If player selects a code, disable that option in the opponent select
function syncSelectionToOpponent() {
  const { playerSel, oppSel } = getSelects();
  if (!playerSel || !oppSel) return;
  const chosen = playerSel.value;

  for (let i = 0; i < oppSel.options.length; i++) {
    const opt = oppSel.options[i];
    if (opt.value === chosen) {
      opt.disabled = true;
      if (oppSel.value === chosen) oppSel.value = ""; // clear if it was selected
    }
  }
}

// Load available codes from Apps Script
async function loadAvailableCodes() {
  if (isSubmitting) return;

  const { playerSel, oppSel } = getSelects();
  if (document.activeElement === playerSel || document.activeElement === oppSel) {
    return;
  }

  try {
    const res = await fetch(WEBAPP_URL + "?action=availableCodes");
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed fetching codes");

    // Now backend must return players with "matchedWith" info
    // Example:
    // { code: "Player_02", availableSelf: false, availableOpponent: false, matchedWith: "Player_01" }

    populateSelects(json.players || []);
  } catch (err) {
    console.error("Could not load codes", err);
    const { playerSel: p, oppSel: o } = getSelects();
    if (p && o && (!p.options.length || !o.options.length)) {
      alert("Could not load player codes. Try refresh or contact admin.");
    }
  }
}

// Robustly read form values
function readFormValues(form) {
  const get = (names) => {
    for (const n of names) {
      if (form.elements[n] && form.elements[n].value !== undefined) return form.elements[n].value;
      if (form[n] && form[n].value !== undefined) return form[n].value;
    }
    return "";
  };

  return {
    name: get(["name", "Name"]),
    email: get(["email", "Email"]),
    playerCode: get(["playerCode", "playercode"]),
    opponentCode: get(["opponentCode", "opponentcode"]),
    ticketAmount: get(["ticketAmount", "ticketamount", "amount"]),
    receiptURL: get(["receiptURL", "receipturl", "receipt"])
  };
}

document.addEventListener("DOMContentLoaded", () => {
  loadAvailableCodes();

  const { playerSel, oppSel } = getSelects();
  if (playerSel) playerSel.addEventListener("change", () => syncSelectionToOpponent());
  if (oppSel) oppSel.addEventListener("change", () => syncSelectionToOpponent());

  const form = document.getElementById("regForm") || document.querySelector("form[id='regForm']") || document.querySelector("form");
  if (!form) {
    console.warn("Registration form not found (id=regForm).");
    return;
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const vals = readFormValues(form);
    const name = (vals.name || "").trim();
    const email = (vals.email || "").trim();
    const playerCode = (vals.playerCode || "").trim();
    const opponentCode = (vals.opponentCode || "").trim();

    if (!name || !email || !playerCode || !opponentCode) {
      alert("Please complete all fields.");
      return;
    }

    try {
      const checkRes = await fetch(WEBAPP_URL + "?action=availableCodes");
      const j = await checkRes.json();
      if (!j.success) throw new Error(j.error || "Could not re-check availability");

      const map = {};
      (j.players || []).forEach(p => map[p.code] = p);

      if (!map[playerCode] || !map[playerCode].availableSelf) {
        alert("Selected Player Code is no longer available. Please choose another.");
        loadAvailableCodes();
        return;
      }
      if (!map[opponentCode] || !map[opponentCode].availableOpponent) {
        alert("Selected Opponent Code is no longer available. Please choose another.");
        loadAvailableCodes();
        return;
      }

      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("playercode", playerCode);
      fd.append("opponentcode", opponentCode);
      if (vals.ticketAmount) fd.append("ticketAmount", vals.ticketAmount.trim());
      if (vals.receiptURL) fd.append("receiptURL", vals.receiptURL.trim());
      if (form.redirect && form.redirect.value) fd.append("redirect", form.redirect.value);

      isSubmitting = true;
      const submitBtn = form.querySelector("[type='submit']");
      if (submitBtn) submitBtn.disabled = true;

      const submitRes = await fetch(WEBAPP_URL, { method: "POST", body: fd });
      const submitJson = await submitRes.json();

      if (submitJson.success) {
        alert("Registration successful! Your ticket: " + (submitJson.ticket || ""));
        if (form.redirect && form.redirect.value) window.location = form.redirect.value;
        await loadAvailableCodes();
      } else {
        alert("Registration failed: " + (submitJson.error || "Unknown error"));
        await loadAvailableCodes();
      }
    } catch (err) {
      console.error(err);
      alert("Submission failed. Try again or contact admin.");
    } finally {
      isSubmitting = false;
      const submitBtn = form.querySelector("[type='submit']");
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});