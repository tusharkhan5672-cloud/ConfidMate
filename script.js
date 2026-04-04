document.addEventListener("DOMContentLoaded", function () {
  // AUTH SYSTEM
  const authArea = document.getElementById("auth-area");
  const currentUser = localStorage.getItem("currentUser");

  if (authArea) {
    if (currentUser) {
      authArea.innerHTML = `
        <span id="userProfile" style="margin-right:10px; cursor:pointer;">Hi, ${currentUser}</span>
        <button id="logoutBtn">Logout</button>
      `;

      const userProfile = document.getElementById("userProfile");
      if (userProfile) {
        userProfile.addEventListener("click", () => {
          window.location.href = "dashboard/dashboard.html";
        });
      }

      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
      }
    } else {
      authArea.innerHTML = `<a href="login/login.html">Login</a>`;
    }
  }

  // NAVBAR TOGGLE
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


// HERO BUTTONS
const startBtn = document.getElementById("startBtn");
const exploreBtn = document.getElementById("exploreBtn");

if (startBtn) {
  startBtn.addEventListener("click", function () {
    const currentUser = localStorage.getItem("currentUser");

    if (currentUser) {
      window.location.href = "zones/Comfort/comfort.html";
    } else {
      window.location.href = "login/login.html";
    }
  });
}

if (exploreBtn) {
  exploreBtn.addEventListener("click", function () {
    const zonesSection = document.querySelector(".zones");

    if (zonesSection) {
      zonesSection.scrollIntoView({
        behavior: "smooth"
      });
    }
  });
}

/* =========================
   DESKTOP HERO EMOJI SYSTEM
========================= */

function initHeroEmojiScene() {
  const hero = document.getElementById("heroSection");
  const emojiLayer = document.getElementById("heroEmojiLayer");
  const rippleLayer = document.getElementById("heroRippleLayer");

  if (!hero || !emojiLayer || !rippleLayer) return;
  if (window.innerWidth < 1024) return;

  emojiLayer.innerHTML = "";
  rippleLayer.innerHTML = "";

  const emojis = ["😔", "😟", "😕", "😶", "🙂", "😊", "😌", "😄", "😎", "✨"];
  const emojiCount = 18;

  const heroRect = hero.getBoundingClientRect();
  const content = hero.querySelector(".hero-content");
  const contentRect = content.getBoundingClientRect();

  const forbidden = {
    left: contentRect.left - heroRect.left - 80,
    top: contentRect.top - heroRect.top - 60,
    right: contentRect.right - heroRect.left + 80,
    bottom: contentRect.bottom - heroRect.top + 60
  };

  const placed = [];

  function overlapsCenterZone(x, y) {
    return (
      x > forbidden.left &&
      x < forbidden.right &&
      y > forbidden.top &&
      y < forbidden.bottom
    );
  }

  function tooCloseToOthers(x, y) {
    return placed.some(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 70;
    });
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  for (let i = 0; i < emojiCount; i++) {
    let x = 0;
    let y = 0;
    let tries = 0;

    do {
      x = randomBetween(40, heroRect.width - 40);
      y = randomBetween(50, heroRect.height - 50);
      tries++;
    } while ((overlapsCenterZone(x, y) || tooCloseToOthers(x, y)) && tries < 100);

    placed.push({ x, y });

    const emoji = document.createElement("div");
    emoji.className = "floating-emoji";

    const size = Math.floor(randomBetween(28, 54));
    const duration = randomBetween(3.2, 6.4);
    const delay = randomBetween(0, 2.8);
    const opacity = randomBetween(0.28, 0.8);

    emoji.style.left = `${x}px`;
    emoji.style.top = `${y}px`;
    emoji.style.fontSize = `${size}px`;
    emoji.style.opacity = opacity;

    const inner = document.createElement("span");
    inner.className = "emoji-inner";
    inner.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    inner.style.animationDuration = `${duration}s`;
    inner.style.animationDelay = `${delay}s`;

    emoji.appendChild(inner);
    emojiLayer.appendChild(emoji);
  }

  function createRipple(x, y) {
    const ripple = document.createElement("div");
    ripple.className = "hero-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    rippleLayer.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 700);
  }

  function pushEmojisAway(clickX, clickY) {
    const items = emojiLayer.querySelectorAll(".floating-emoji");

    items.forEach((item) => {
      const itemX = parseFloat(item.style.left);
      const itemY = parseFloat(item.style.top);

      const dx = itemX - clickX;
      const dy = itemY - clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 140) {
        const force = (140 - distance) / 140;
        const angle = Math.atan2(dy, dx);
        const pushX = Math.cos(angle) * force * 90;
        const pushY = Math.sin(angle) * force * 90;

        item.style.transform = `translate(${pushX}px, ${pushY}px) scale(${1 + force * 0.15})`;

        setTimeout(() => {
          item.style.transform = "";
        }, 420);
      }
    });
  }

  emojiLayer.addEventListener("click", function (e) {
    const rect = emojiLayer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    createRipple(clickX, clickY);
    pushEmojisAway(clickX, clickY);
  });
}

window.addEventListener("load", initHeroEmojiScene);

let heroResizeTimeout;
window.addEventListener("resize", function () {
  clearTimeout(heroResizeTimeout);
  heroResizeTimeout = setTimeout(() => {
    initHeroEmojiScene();
  }, 250);
});

  // TRUST SCROLL REVEAL
  const reveals = document.querySelectorAll(".trust-scroll-reveal");

  function revealTrustSection() {
    reveals.forEach((el) => {
      const windowHeight = window.innerHeight;
      const elementTop = el.getBoundingClientRect().top;

      if (elementTop < windowHeight - 100) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll", revealTrustSection);
  revealTrustSection();

  // LOAD HOME PAGE DYNAMIC SECTIONS
  loadTodayFocus();
  loadProgressSnapshot();
  loadConfidmateStoryAnimation();
});

/* =========================
   USER DATA HELPERS
========================= */

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function getUserData() {
  const currentUser = localStorage.getItem("currentUser");
  const userEmail = localStorage.getItem("userEmail");
  const users = getUsers();

  if (userEmail && users[userEmail]) {
    return users[userEmail].data || {};
  }

  if (currentUser && users[currentUser]) {
    return users[currentUser].data || {};
  }

  return {};
}

/* =========================
   TODAY FOCUS
========================= */

function loadTodayFocus() {
  const data = getUserData();
  const focusTasks = document.getElementById("focusTasks");
  const focusMessage = document.getElementById("focusMessage");
  const startFocusBtn = document.getElementById("startFocusBtn");

  if (!focusTasks || !focusMessage || !startFocusBtn) return;

  const moodCount = data.moods?.length || 0;
  const practiceCount = data.practice?.sessionDates?.length || 0;
  const growthCount = data.growth?.challengesCompleted?.length || 0;
  const breathingCount = data.breathing?.totalCycles || 0;

  let tasks = [];

  if (moodCount === 0 || breathingCount < 3) {
    tasks.push({
      icon: "😌",
      title: "Start slow — just breathe for a moment",
      desc: "No pressure right now. Just take a few deep breaths and settle yourself."
    });
  } else {
    tasks.push({
      icon: "💙",
      title: "Check in with yourself",
      desc: "Notice how you feel before you move forward today."
    });
  }

  if (practiceCount < 3) {
    tasks.push({
      icon: "🎤",
      title: "Say something out loud today",
      desc: "Just one small practice round. Don’t overthink it, just speak."
    });
  } else {
    tasks.push({
      icon: "💬",
      title: "Keep your flow alive",
      desc: "Talk to the AI partner and keep your speaking energy active."
    });
  }

  if (growthCount < 2) {
    tasks.push({
      icon: "🚀",
      title: "Do one thing you’d normally avoid",
      desc: "Something small. Something real. That’s where confidence builds."
    });
  } else {
    tasks.push({
      icon: "🔥",
      title: "Push a little further today",
      desc: "Choose a slightly bolder action than last time."
    });
  }

  focusTasks.innerHTML = tasks.map(task => `
    <div class="focus-task">
      <span class="focus-icon">${task.icon}</span>
      <div>
        <h4>${task.title}</h4>
        <p>${task.desc}</p>
      </div>
    </div>
  `).join("");

  if (practiceCount + growthCount + moodCount === 0) {
    focusMessage.textContent = "Today is a good day to begin. Start small and keep it simple.";
  } else if (practiceCount > 5 && growthCount > 2) {
    focusMessage.textContent = "You’ve already built momentum. Today is about keeping it alive.";
  } else {
    focusMessage.textContent = "Small steps still count. Start with one.";
  }

  startFocusBtn.onclick = function () {
    if (practiceCount < 3) {
      window.location.href = "zones/Comfort/comfort.html";
    } else if (growthCount < 2) {
      window.location.href = "zones/Growth/Growth.html";
    } else {
      window.location.href = "zones/confidence/confidence.html";
    }
  };
}

/* =========================
   MINI SCORE / SNAPSHOT
========================= */

/* =========================
   DATE HELPERS (FIXED)
========================= */

// ✅ LOCAL DATE (NOT UTC)
function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// convert any date object → YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================
   STREAK LOGIC (FIXED)
========================= */

function getStreakFromDates(dates = []) {
  if (!dates.length) return 0;

  // remove duplicates
  const uniqueDates = [...new Set(dates)];

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);

    const checkStr = formatDate(checkDate);

    if (uniqueDates.includes(checkStr)) {
      streak++;
    } else {
      break; // streak stops
    }
  }

  return streak;
}

/* =========================
   MAIN SNAPSHOT FUNCTION
========================= */

function loadProgressSnapshot() {
  const data = getUserData();

  // counts
  const practiceSessions = data.practice?.sessionDates?.length || 0;
  const growthChallenges = data.growth?.challengesCompleted?.length || 0;

  const aiInteractions =
    (data.chatHistory?.length || 0) +
    (data.practice?.aiPracticeChats?.length || 0) +
    (data.confidence?.aiScenarios?.length || 0);

  // streak (from both sources)
  const streak = Math.max(
    getStreakFromDates(data.practice?.sessionDates || []),
    getStreakFromDates(data.growth?.sessionDates || [])
  );

  // DOM elements
  const streakEl = document.getElementById("snapshot-streak");
  const practiceEl = document.getElementById("snapshot-practice");
  const growthEl = document.getElementById("snapshot-growth");
  const aiEl = document.getElementById("snapshot-ai");

  const statusTitleEl = document.getElementById("snapshot-status-title");
  const statusTextEl = document.getElementById("snapshot-status-text");

  // update UI
  if (streakEl) streakEl.textContent = streak;
  if (practiceEl) practiceEl.textContent = practiceSessions;
  if (growthEl) growthEl.textContent = growthChallenges;
  if (aiEl) aiEl.textContent = aiInteractions;

  if (!statusTitleEl || !statusTextEl) return;

  // status logic
  if (practiceSessions === 0 && growthChallenges === 0) {
    statusTitleEl.textContent = "You’re getting started";
    statusTextEl.textContent =
      "This is your beginning. Start small, stay consistent, and let confidence build naturally.";
  } else if (practiceSessions > 5 && growthChallenges < 3) {
    statusTitleEl.textContent = "You’re building momentum";
    statusTextEl.textContent =
      "Your practice is growing well. This is a good time to take more real-world action.";
  } else if (growthChallenges >= 3 && streak >= 3) {
    statusTitleEl.textContent = "You’re showing real progress";
    statusTextEl.textContent =
      "You’re not just practicing anymore — you’re starting to act with confidence.";
  } else {
    statusTitleEl.textContent = "You’re moving forward";
    statusTextEl.textContent =
      "Every small rep matters. Keep showing up and the bigger shifts will follow.";
  }
}

/* =========================
   CONFIDMATE STORY
========================= */

function loadConfidmateStoryAnimation() {
  const header = document.getElementById("storyHeader");
  const steps = document.querySelectorAll(".journey-step");
  const arrows = document.querySelectorAll(".journey-arrow");

  if (!header || !steps.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;

      if (entry.isIntersecting) {
        if (el === header) {
          el.classList.add("active");
        }

        if (el.classList.contains("journey-step")) {
          const index = [...steps].indexOf(el);

          setTimeout(() => {
            el.classList.remove("hide");
            el.classList.add("show");
          }, index * 150);

          if (arrows[index - 1]) {
            setTimeout(() => {
              arrows[index - 1].classList.add("show");
            }, (index * 150) - 80);
          }
        }
      } else {
        if (el.classList.contains("journey-step")) {
          el.classList.remove("show");
          el.classList.add("hide");

          const index = [...steps].indexOf(el);
          if (arrows[index - 1]) {
            arrows[index - 1].classList.remove("show");
          }
        }
      }
    });
  }, {
    threshold: 0.35
  });

  observer.observe(header);
  steps.forEach(step => observer.observe(step));
}

/* =========================
   LOGOUT
========================= */

function logout() {
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (confirmLogout) {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
  }
}