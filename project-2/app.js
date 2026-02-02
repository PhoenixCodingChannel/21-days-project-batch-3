const toggleBtn = document.getElementById("themeToggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light-theme") ? "light" : "dark",
  );
  const isLightTheme = document.body.classList.contains("light-theme");
  toggleBtn.textContent = isLightTheme ? "🌙" : "🌞";
});
