// shared.js

// Log to confirm shared.js is loaded
console.log("shared.js loaded");

// Add dynamic behavior for "Coming Soon" buttons
document.addEventListener("DOMContentLoaded", () => {
  const comingSoonButtons = document.querySelectorAll(".coming-soon-btn");

  comingSoonButtons.forEach((button) => {
    button.addEventListener("click", () => {
      alert("This game is coming soon! Stay tuned!");
    });
  });
});

// Add navigation functionality (if needed)
const navigateTo = (url) => {
  window.location.href = url;
};

// Example: Dynamic footer year
const footer = document.querySelector("footer p");
if (footer) {
  const year = new Date().getFullYear();
  footer.innerHTML = `&copy; ${year} cloudy.fun`;
}