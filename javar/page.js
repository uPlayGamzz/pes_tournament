  AOS.init();

  document.addEventListener('DOMContentLoaded', () => {
    // Fade-in on scroll
    const faders = document.querySelectorAll('.fade-in');
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    });
    faders.forEach(el => appearOnScroll.observe(el));

    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    const profileToggle = document.querySelector('.profile-toggle');
    const profileList = document.querySelector('.profile-list');
    const loadingCover = document.querySelector('.loading-cover');
    const loginBtn = document.querySelector('.loginBtn');
    navToggle.addEventListener('click', () => {
      navList.classList.toggle('show');
      navToggle.classList.toggle('active');
      profileToggle.classList.toggle('hide');
    });

    profileToggle.addEventListener('click', () => {
      profileList.classList.toggle('show');
      profileToggle.classList.toggle('active');
      navToggle.classList.toggle('hide');
    });
    
   

    // Scroll to top button
    const scrollToTopBtn = document.getElementById('scrollToTop');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });
    scrollToTopBtn.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Countdown timer
    function countdownTimer() {
      const countdownEl = document.getElementById('countdown');
      const tournamentDate = new Date('oct 25, 2025 18:00:00').getTime();
      const now = new Date().getTime();
      const distance = tournamentDate - now;

      if (distance < 0) {
        countdownEl.textContent = 'Tournament Started!';
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      countdown.innerHTML = `
      <h3 style="margin-bottom: 3px; color: rgb(0, 130, 255);">Game Starts In</h3>
      <p style="margin-top: 3px; color: #ffb300;">${days}d : ${hours}h : ${minutes}m : ${seconds}s</p>
      `;
    }
    
    countdownTimer();
    setInterval(countdownTimer, 1000);
  });