    // ===== Admin lock (local test) =====
    const ADMIN_PW = 'admin'; // change for your local test
    const adminToggle = document.getElementById('adminToggle');
    const adminStatus = document.getElementById('adminStatus');
    const saveBtn = document.getElementById('saveBracket');
    const clearBtn = document.getElementById('clearBracket');

    function setAdminMode(on) {
      const inputs = document.querySelectorAll('.score');
      const names = document.querySelectorAll('.name');
      inputs.forEach(i => i.disabled = !on);
      names.forEach(n => n.setAttribute('contenteditable', on ? 'true' : 'false'));
      adminStatus.textContent = on ? 'Admin' : 'Viewer';
      adminStatus.classList.toggle('active', on);
      saveBtn.disabled = !on;
      clearBtn.disabled = !on;
      localStorage.setItem('uplay_is_admin', on ? '1' : '0');
    }
    // restore admin state
    setAdminMode(localStorage.getItem('uplay_is_admin') === '1');

    adminToggle.addEventListener('click', () => {
      const isAdmin = adminStatus.textContent === 'Admin';
      if (isAdmin) {
        setAdminMode(false);
      } else {
        const pw = prompt('Enter admin password (local test):');
        if (pw === ADMIN_PW) setAdminMode(true);
        else alert('Incorrect password.');
      }
    });

    // ===== Bracket auto-advance =====
    // Map: child match -> next match + slot
    const forwarding = {};
    document.querySelectorAll('.match[data-next]').forEach(m => {
      const id = m.dataset.match;
      forwarding[id] = { next: m.dataset.next, slot: m.dataset.slot };
    });

    function getRows(matchEl) {
      const rows = matchEl.querySelectorAll('.row');
      return [rows[0], rows[1]];
    }
    function extractTeam(row) {
      return {
        nameEl: row.querySelector('.name'),
        scoreEl: row.querySelector('.score'),
        rowEl: row
      };
    }

    function setWinnerStyles(r1, r2, winnerRow) {
      [r1.rowEl, r2.rowEl].forEach(r => r.classList.remove('winner'));
      if (winnerRow) winnerRow.rowEl.classList.add('winner');
    }

    function pushToNext(childMatchId, winnerName) {
      const map = forwarding[childMatchId];
      if (!map) return;
      const nextMatch = document.querySelector(`.match[data-match="${map.next}"]`);
      if (!nextMatch) return;

      const rows = getRows(nextMatch).map(extractTeam);
      const target = map.slot === 'away' ? rows[1] : rows[0];
      target.nameEl.textContent = winnerName || (map.slot === 'away' ? 'TBD' : 'TBD');
      target.scoreEl.value = '';
      setWinnerStyles(rows[0], rows[1], null);

      // If next is final and both names are set, clear champion until re-evaluated
      if (map.next === 'final') {
        document.getElementById('championName').textContent = 'Champion';
      }
    }

    function recalcMatch(matchEl) {
      const [rowA, rowB] = getRows(matchEl).map(extractTeam);

      const a = parseInt(rowA.scoreEl.value, 10);
      const b = parseInt(rowB.scoreEl.value, 10);

      // No decision until both filled
      if (Number.isNaN(a) || Number.isNaN(b)) {
        setWinnerStyles(rowA, rowB, null);
        return;
      }

      if (a === b) {
        // tie: admin decides later; do not advance
        setWinnerStyles(rowA, rowB, null);
        return;
      }

      const winner = (a > b) ? rowA : rowB;
      setWinnerStyles(rowA, rowB, winner);
      pushToNext(matchEl.dataset.match, winner.nameEl.textContent);

      // If we just decided the final, set champion
      if (matchEl.dataset.match === 'final') {
        document.getElementById('championName').textContent = winner.nameEl.textContent;
      }
    }

    // Hook change events (only fire when admin unlocked)
    document.querySelectorAll('.score').forEach(inp => {
      inp.addEventListener('input', e => {
        if (inp.disabled) return; // viewer
        const match = inp.closest('.match');
        recalcMatch(match);
      });
    });

    // Also update names propagation if admin edits names of initial R16
    document.querySelectorAll('.name').forEach(nameEl => {
      nameEl.addEventListener('blur', () => {
        if (nameEl.getAttribute('contenteditable') !== 'true') return;
        // If the edited name already advanced somewhere, keep manual control as scores push forward later
        // (no immediate propagation needed here).
      });
    });

    // ===== Persistence (localStorage) =====
    function serialize() {
      const data = {};
      document.querySelectorAll('.match').forEach(m => {
        const id = m.dataset.match;
        const rows = getRows(m).map(extractTeam);
        data[id] = rows.map(r => ({
          name: r.nameEl.textContent,
          score: r.scoreEl.value || ''
        }));
      });
      data['champion'] = document.getElementById('championName').textContent;
      return data;
    }
    function deserialize(data) {
      if (!data) return;
      Object.keys(data).forEach(key => {
        if (key === 'champion') {
          document.getElementById('championName').textContent = data[key] || 'Champion';
          return;
        }
        const m = document.querySelector(`.match[data-match="${key}"]`);
        if (!m) return;
        const rows = getRows(m).map(extractTeam);
        (data[key] || []).forEach((r, i) => {
          if (rows[i]) {
            rows[i].nameEl.textContent = r.name ?? rows[i].nameEl.textContent;
            rows[i].scoreEl.value = r.score ?? '';
          }
        });
        // Recalc to restore winner styles/advances
        recalcMatch(m);
      });
    }

    const STORAGE_KEY = 'uplay_bracket_v1';
    // Load
    try { deserialize(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch(e){}

    saveBtn.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize()));
      saveBtn.textContent = 'Saved';
      setTimeout(() => saveBtn.textContent = 'Save', 1200);
    });

    clearBtn.addEventListener('click', () => {
      if (!confirm('Clear all scores and names (keeps structure)?')) return;
      localStorage.removeItem(STORAGE_KEY);
      // reset all matches
      document.querySelectorAll('.match').forEach(m => {
        const rows = m.querySelectorAll('.row');
        rows.forEach(r => {
          r.classList.remove('winner');
          const score = r.querySelector('.score');
          if (score) score.value = '';
        });
      });
      // reset display names to defaults for R16; others to placeholders
      const defaults = {
        m1:['Joshd_maverick','Player_05'], m2:['Bambi','Player_04'],
        m3:['Player_03','Player_06'], m4:['Player_07','Player_08'],
        m5:['Player_09','Player_10'], m6:['Player_11','Player_12'],
        m7:['Player_13','Player_14'], m8:['Player_15','Player_16'],
        qf1:['Winner M1','Winner M2'], qf2:['Winner M3','Winner M4'],
        qf3:['Winner M5','Winner M6'], qf4:['Winner M7','Winner M8'],
        sf1:['Winner QF1','Winner QF2'], sf2:['Winner QF3','Winner QF4'],
        final:['Winner SF1','Winner SF2']
      };
      Object.keys(defaults).forEach(id => {
        const m = document.querySelector(`.match[data-match="${id}"]`);
        if (!m) return;
        const names = m.querySelectorAll('.name');
        names.forEach((n,i)=> n.textContent = defaults[id][i]);
      });
      document.getElementById('championName').textContent = 'Champion';
    });


    function placeConnectors() {
    // For every parent, figure out where its two children sit
    const parents = new Set(
        Array.from(document.querySelectorAll('.match[data-next]'))
            .map(m => m.getAttribute('data-next'))
    );

    parents.forEach(parentId => {
        const parent = document.querySelector(`.match[data-match="${parentId}"]`);
        if (!parent) return;

        const kids = Array.from(document.querySelectorAll(`.match[data-next="${parentId}"]`));
        if (kids.length !== 2) return;

        const pRect = parent.getBoundingClientRect();
        const kRect = kids.map(k => k.getBoundingClientRect());

        // Tag each child with flow direction so its short line points the right way
        kids.forEach((kid, i) => {
        const toLeft = kRect[i].left > pRect.left;  // child is to the RIGHT of parent → needs line to the LEFT
        kid.classList.toggle('to-left',  toLeft);
        kid.classList.toggle('to-right', !toLeft);
        });

        // Prepare the parent's connector and set its side (left/right)
        const parentConnector = parent.querySelector('.connector');
        if (!parentConnector) return;

        const childrenAreLeft  = kRect.every(r => r.left < pRect.left);
        const childrenAreRight = kRect.every(r => r.left > pRect.left);
        parentConnector.classList.toggle('left',  childrenAreLeft);
        parentConnector.classList.toggle('right', childrenAreRight);
        parentConnector.style.top = (pRect.height/2) + 'px';

        // Compute vertical span between child midpoints
        const mids = kRect.map(r => r.top + r.height/2);
        const topY = Math.min(...mids);
        const botY = Math.max(...mids);
        const height = botY - topY;
        const parentMidY = pRect.top + pRect.height/2;

        // Ensure helper nodes exist
        let v1 = parentConnector.querySelector('.v1');
        let s1 = parentConnector.querySelector('.s1');
        let s2 = parentConnector.querySelector('.s2');
        if (!v1){ v1=document.createElement('div'); v1.className='v1'; parentConnector.appendChild(v1); }
        if (!s1){ s1=document.createElement('div'); s1.className='s1'; parentConnector.appendChild(s1); }
        if (!s2){ s2=document.createElement('div'); s2.className='s2'; parentConnector.appendChild(s2); }

        // Place the long vertical and the small horizontal stubs toward each child
        const stubLen = 16;
        const verticalX = parentConnector.classList.contains('left') ? -2 : 28;
        const stubStartX = parentConnector.classList.contains('left') ? -stubLen : 28;

        v1.style.left = verticalX + 'px';
        v1.style.top  = -(parentMidY - topY) + 'px';
        v1.style.height = height + 'px';

        s1.style.left = stubStartX + 'px';
        s2.style.left = stubStartX + 'px';
        s1.style.top  = -(parentMidY - mids[0]) + 'px';
        s2.style.top  = -(parentMidY - mids[1]) + 'px';
        s1.style.width = stubLen + 'px';
        s2.style.width = stubLen + 'px';
    });
    }

    window.addEventListener('load', placeConnectors);
    window.addEventListener('resize', placeConnectors);



document.addEventListener('keydown', function(e) {
  // Check if Ctrl + Shift + e is pressed
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
    const panel = document.getElementById('admin-panel');
    panel.style.display = (panel.style.display === 'none') ? 'block' : 'none';
  }
});