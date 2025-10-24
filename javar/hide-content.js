  // Modal script
  const modal = document.getElementById("termsModal");
  const link = document.getElementById("termsLink");
  const span = document.getElementsByClassName("close")[0];

  link.onclick = function(e) {
    e.preventDefault();
    modal.style.display = "block";
  }
  span.onclick = function() {
    modal.style.display = "none";
  }
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }