document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("main-content");

  // fade-in al cargar
  setTimeout(() => {
    content.classList.add("loaded");
  }, 50);

  // fade-out al cambiar de página
  document.querySelectorAll("a.link").forEach(link => {
    link.addEventListener("click", function(e){
      e.preventDefault();
      content.classList.remove("loaded");
      content.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = this.href;
      }, 600);
    });
  });
});
