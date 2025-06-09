/*! AOS v2.3.4 (https://github.com/michalsnik/aos) */
(function() {
  function initAOS() {
    var elements = document.querySelectorAll('[data-aos]');
    elements.forEach(function(el) {
      el.classList.add('aos-animate');
    });
  }
  window.AOS = {
    init: function() {
      document.addEventListener('DOMContentLoaded', initAOS);
    }
  };
})();