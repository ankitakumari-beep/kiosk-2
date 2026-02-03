export function initCardToggle() {
  const buttons = document.querySelectorAll(".toggle-btn");
  const cards = document.querySelectorAll(".card-view");

  buttons.forEach(btn => {
    btn.onclick = () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const card = btn.dataset.card;
      cards.forEach(c =>
        c.classList.toggle("active", c.classList.contains(`${card}-card`))
      );
    };
  });
}
