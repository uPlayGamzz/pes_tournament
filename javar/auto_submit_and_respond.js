// (function () {
//   const form = document.querySelector('#register form');
//   const zapierURL = 'https://hooks.zapier.com/hooks/catch/24431614/uha7orx/';

//   if (!form) return;

//   form.addEventListener('submit', function () {
//     try {
//       const fd = new FormData(form);
//       fd.append('submitted_at', new Date().toISOString());
//       fd.append('source', 'uplay-pes-registration');
//       const payload = {
//         name: fd.get('name') || '',
//         email: fd.get('email') || '',
//         platform: fd.get('platform') || '',
//         submitted_at: new Date().toISOString(),
//         source: 'uplay-pes-registration'
//       };

//       // Fire-and-forget JSON POST to Zapier
//       fetch(zapierURL, {
//         method: 'POST',
//         body: JSON.stringify(payload),
//         headers: { 'Content-Type': 'application/json' },
//         keepalive: true // ensures it sends even with redirects
//       }).catch(err => console.warn('Zapier mirror failed', err));

//       // Fire-and-forget to Zapier
//       navigator.sendBeacon(zapierURL, fd);
//     } catch (e) {
//       console.warn('Zapier mirror failed', e);
//     }
//   });
// })();


document.getElementById("regForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx4UdMvyyZnaPMp3qyptA-Zozn1jKR9NAG7EVZDZU1bVaXcAnFnCYIcs9Epc078hshh/exec"; // ← replace with your deployed web app /exec URL

  try {
    const resp = await fetch(WEB_APP_URL, {
      method: "POST",
      body: formData
    });

    // get raw text so we can debug non-JSON responses
    const text = await resp.text();
    console.log("Response status:", resp.status);
    console.log("Response content-type:", resp.headers.get("content-type"));
    console.log("Response body:", text);

    // try parse JSON, but handle gracefully if it's not JSON
    let result;
    try {
      result = JSON.parse(text);
    } catch (parseErr) {
      alert("Server returned non-JSON response. Check browser console (Network & Console) for details.");
      return;
    }

    if (result && result.success) {
      // success -> redirect if a redirect hidden input exists
      alert(result.message || "Registration successful!");
      const redirectInput = form.querySelector('input[name="redirect"]');
      if (redirectInput && redirectInput.value) {
        window.location.href = redirectInput.value;
      }
    } else {
      alert("Server error: " + (result.error || result.message || JSON.stringify(result)));
    }
  } catch (err) {
    console.error("Network / Fetch error:", err);
    alert("Network error: " + err.message);
  }
});