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

  const response = await fetch("https://script.google.com/macros/s/AKfycbwMf9ND9XjlMLuBlUQPeWaeQrC5klHAsp2Jk7zpgjI4siHy4GOKGFJU1mBpd5S7I0Ku/exec", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  alert(result.message || "Something went wrong!");
});

//Redirect to Thank You Page
if (result.status === "success") {
  window.location.href = form.querySelector('input[name="redirect"]').value;
} else {
  alert(result.message || "Something went wrong!");
}

