/* ====== CONFIG: set your deployed web app URL here ====== */
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwKWCAtGrr8N5ew6TDVI5Xr7ra8ZHa-Vz3pK7M5z-cml1UgQxrJyNo_kHMh6JdDr5Hv/exec";

let isSubmitting = false;

// Helper to create <option>
function newOption(text, value, disabled = false) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = text;
  if (disabled) {
    opt.disabled = true;
    opt.style.color = "gray";
  }
  return opt;
}

// Helper: find select elements
function getSelects() {
  const playerSel = document.getElementById("playerCode");
  const oppSel = document.getElementById("opponentCode");
  return { playerSel, oppSel };
}

// Populate selects dynamically from Google Sheet data
let playerMap = {}; // global cache

async function populateSelects(players = []) {
  const { playerSel, oppSel } = getSelects();
  if (!playerSel || !oppSel) return;

  playerSel.innerHTML = "";
  oppSel.innerHTML = "";

  playerSel.appendChild(newOption("-- Select Self --", ""));
  oppSel.appendChild(newOption("-- Select Opponent --", ""));

  if (!players.length) return;

  console.log("Players from backend:", players);
  playerMap = {}; // reset cache

  players.forEach(p => {
    const { code, availableSelf, availableOpponent, matchedWith } = p;
    playerMap[code] = p;

    // Player dropdown (self availability)
    const optSelf = newOption(
      availableSelf ? code : code + " (unavailable)",
      code,
      !availableSelf
    );
    playerSel.appendChild(optSelf);

    // Opponent dropdown (normal availability for now)
    const optOpp = newOption(
      availableOpponent ? code : code + " (unavailable)",
      code,
      !availableOpponent
    );
    oppSel.appendChild(optOpp);
  });
}

// Prevent selecting yourself as opponent
function syncSelectionToOpponent() {
  const { playerSel, oppSel } = getSelects();
  if (!playerSel || !oppSel) return;

  const chosenSelf = playerSel.value;
  if (!chosenSelf) return;

  // Clear opponent dropdown rules
  for (let i = 0; i < oppSel.options.length; i++) {
    const opt = oppSel.options[i];
    if (opt.value === "") continue;
    opt.disabled = false;
    opt.style.color = "";
    opt.textContent = opt.value; // reset labels
  }

  const selfPlayer = playerMap[chosenSelf];
  if (!selfPlayer) return;

  // ✅ Special rule: if this player has a matchedWith, force them to pick only that opponent
  if (selfPlayer.matchedWith) {
    for (let i = 0; i < oppSel.options.length; i++) {
      const opt = oppSel.options[i];
      if (opt.value === "") continue;

      if (opt.value !== selfPlayer.matchedWith) {
        opt.disabled = true;
        opt.style.color = "gray";
        opt.textContent = opt.value + " (not your match)";
      }
    }
    oppSel.value = selfPlayer.matchedWith; // auto-select
    return;
  }

  // ✅ Normal rules: block self-pick + keep unavailable
  for (let i = 0; i < oppSel.options.length; i++) {
    const opt = oppSel.options[i];
    if (opt.value === "") continue;

    if (opt.value === chosenSelf) {
      opt.disabled = true;
      opt.textContent = opt.value + " (cannot pick self)";
      opt.style.color = "gray";
      if (oppSel.value === chosenSelf) oppSel.value = "";
    } else if (playerMap[opt.value] && !playerMap[opt.value].availableOpponent) {
      opt.disabled = true;
      opt.style.color = "gray";
      opt.textContent = opt.value + " (unavailable)";
    }
  }
}

// Load available codes from Apps Script
async function loadAvailableCodes() {
  if (isSubmitting) return;
  try {
    const res = await fetch(WEBAPP_URL + "?action=availableCodes");
    const json = await res.json();

    console.log("=== Available Codes Response ===");
    console.log(JSON.stringify(json, null, 2));

    if (!json.success) throw new Error(json.error || "Failed fetching codes");
    populateSelects(json.players || []);
  } catch (err) {
    console.error("Could not load codes", err);
    const { playerSel, oppSel } = getSelects();
    if (playerSel && oppSel && (!playerSel.options.length || !oppSel.options.length)) {
      alert("Could not load player codes. Try refresh or contact admin.");
    }
  }
}

// Read form values
function readFormValues(form) {
  return {
    name: form.querySelector("[name='name']")?.value || "",
    email: form.querySelector("[name='email']")?.value || "",
    playerCode: form.querySelector("[name='playerCode']")?.value || "",
    opponentCode: form.querySelector("[name='opponentCode']")?.value || "",
    ticketAmount: form.querySelector("[name='ticketAmount']")?.value || "",
    receiptURL: form.querySelector("[name='receiptURL']")?.value || ""
  };
}

document.addEventListener("DOMContentLoaded", () => {
  loadAvailableCodes();

  const { playerSel, oppSel } = getSelects();
  if (playerSel) playerSel.addEventListener("change", syncSelectionToOpponent);
  if (oppSel) oppSel.addEventListener("change", syncSelectionToOpponent);

  const form = document.getElementById("regForm");
  if (!form) {
    console.warn("Registration form not found (id=regForm).");
    return;
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const vals = readFormValues(form);
    if (!vals.name || !vals.email || !vals.playerCode || !vals.opponentCode) {
      alert("Please complete all fields.");
      return;
    }

    try {
      // Re-check availability before submitting
      const checkRes = await fetch(WEBAPP_URL + "?action=availableCodes");
      const j = await checkRes.json();
      if (!j.success) throw new Error(j.error || "Could not re-check availability");

      const map = {};
      (j.players || []).forEach(p => map[p.code] = p);

      // if (!map[vals.playerCode] || !map[vals.playerCode].availableSelf) {
      //   alert("Selected Player Code is no longer available. Please choose another.");
      //   loadAvailableCodes();
      //   return;
      // }
      // if (!map[vals.opponentCode] || !map[vals.opponentCode].availableOpponent) {
      //   alert("Selected Opponent Code is no longer available. Please choose another.");
      //   loadAvailableCodes();
      //   return;
      // }

      const fd = new FormData(form);

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