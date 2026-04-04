document.addEventListener("DOMContentLoaded", function () {
  const authArea = document.getElementById("auth-area");
  const currentUser = localStorage.getItem("currentUser");


  if (authArea) {
    authArea.innerHTML = `
      <span id="userProfile" style="margin-right:10px; cursor:pointer;">Hi, ${currentUser}</span>
      <button id="logoutBtn">Logout</button>
    `;

    const userProfile = document.getElementById("userProfile");
    if (userProfile) {
      userProfile.addEventListener("click", () => {
        window.location.href = "../../dashboard/dashboard.html";
      });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }
  }

  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav-links");

  if (toggle && nav) {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      nav.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (
        nav.classList.contains("active") &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        nav.classList.remove("active");
      }
    });
  }

  updateGrowthStats();
  updateLadder();
});
const reveals = document.querySelectorAll(".reveal");

  function revealOnScroll() {
    const trigger = window.innerHeight - 80;

    reveals.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      if (top < trigger) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();

  animateCounters();


function animateCounters() {
  const counters = document.querySelectorAll(".counter");
  let started = false;

  function runCounters() {
    const statsSection = document.getElementById("impact-stats");
    if (!statsSection || started) return;

    const top = statsSection.getBoundingClientRect().top;
    const trigger = window.innerHeight - 100;

    if (top < trigger) {
      started = true;

      counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        let count = 0;
        const increment = Math.max(1, Math.ceil(target / 60));

        const updateCounter = () => {
          count += increment;

          if (count >= target) {
            counter.textContent = target;
          } else {
            counter.textContent = count;
            requestAnimationFrame(updateCounter);
          }
        };

        updateCounter();
      });
    }
  }

  window.addEventListener("scroll", runCounters);
  runCounters();
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    window.location.href = "../index.html";
  }
}