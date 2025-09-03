  (function () {
    const form = document.querySelector('#register form');
    const zapierURL = 'https://hooks.zapier.com/hooks/catch/24431614/uha7orx/';

    if (!form) return;

    form.addEventListener('submit', function () {
      try {
        const fd = new FormData(form);
        const payload = {
          name: fd.get('name') || '',
          email: fd.get('email') || '',
          platform: fd.get('platform') || '',
          submitted_at: new Date().toISOString(),
          source: 'uplay-pes-registration'
        };
        // Send in parallel; keepalive helps if the page redirects fast
        fetch(zapierURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        });
      } catch (e) {
        // silent fail—don’t block Web3Forms
        console.warn('Zapier mirror failed', e);
      }
    });
  })();
