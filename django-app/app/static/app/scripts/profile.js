document.addEventListener("DOMContentLoaded", async() => {
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(b => b.classList.remove("active"));
  const profileButton = document.getElementById("profile-link");
  profileButton.classList.add("active");
});
