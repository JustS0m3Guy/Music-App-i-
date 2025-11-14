// --- Grid/List View Toggle ---
document.addEventListener("DOMContentLoaded", () => {
  const viewButtons = document.querySelectorAll('.view-btn');
  const gamesGrid = document.querySelector('.games-grid');

  if (viewButtons && gamesGrid) {
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const view = btn.dataset.view;
        if (view === 'list') {
          gamesGrid.classList.add('list-view');
        } else {
          gamesGrid.classList.remove('list-view');
        }
      });
    });
  }
});
