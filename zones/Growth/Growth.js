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

/* =========================
   USER DATA HELPERS
========================= */

function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getUserData() {
  const currentUser = getCurrentUser();
  const users = getUsers();

  if (!users[currentUser]) {
    users[currentUser] = {
      password: "",
      data: {}
    };
  }

  if (!users[currentUser].data) {
    users[currentUser].data = {};
  }

  const data = users[currentUser].data;

  if (!data.growth) {
    data.growth = {
      currentChallenge: null,
      challengesCompleted: [],
      challengesSkipped: [],
      reflections: [],
      reflectionNotes: [],
      sessionDates: [],
      ladderLevel: 1
    };
  }

  if (!data.growth.ladderLevel) {
    data.growth.ladderLevel = 1;
  }

  saveUsers(users);
  return data;
}

function saveUserData(updatedData) {
  const currentUser = getCurrentUser();
  const users = getUsers();

  if (!users[currentUser]) return;

  users[currentUser].data = updatedData;
  saveUsers(users);
}

/* =========================
   LOGOUT
========================= */

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "../index.html";
  }
}

/* =========================
   CHALLENGES
========================= */

const growthChallenges = [
  "Say hello to one new person today.",
  "Ask someone one simple question confidently.",
  "Give a genuine compliment to someone.",
  "Start a 30-second conversation in real life.",
  "Maintain eye contact for 5 seconds while speaking.",
  "Speak first instead of waiting for the other person.",
  "Ask for help in a calm and clear way.",
  "Share your opinion in one conversation today."
];

function generateChallenge() {
  const challengeText = document.getElementById("challenge-text");
  const random = growthChallenges[Math.floor(Math.random() * growthChallenges.length)];
  challengeText.textContent = random;

  const data = getUserData();
  data.growth.currentChallenge = {
    text: random,
    createdAt: new Date().toISOString()
  };
  saveUserData(data);
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function completeChallenge() {
  const status = document.getElementById("challenge-status");
  const data = getUserData();

  if (!data.growth.currentChallenge) {
    status.textContent = "Generate a challenge first.";
    return;
  }

  data.growth.challengesCompleted.push({
    text: data.growth.currentChallenge.text,
    time: new Date().toISOString()
  });

  data.growth.sessionDates.push(getTodayDate());
  saveUserData(data);

  status.textContent = "Nice work — challenge marked as completed ✅";
  updateGrowthStats();
  checkLadderProgress();
}

function skipChallenge() {
  const status = document.getElementById("challenge-status");
  const data = getUserData();

  if (!data.growth.currentChallenge) {
    status.textContent = "Generate a challenge first.";
    return;
  }

  data.growth.challengesSkipped.push({
    text: data.growth.currentChallenge.text,
    time: new Date().toISOString()
  });

  saveUserData(data);
  status.textContent = "Challenge skipped for now.";
  updateGrowthStats();
}

/* =========================
   REFLECTION
========================= */

function setGrowthFeedback(level) {
  const result = document.getElementById("reflection-result");
  const data = getUserData();

  data.growth.reflections.push({
    level: level,
    time: new Date().toISOString()
  });
  saveUserData(data);

  if (level === "easy") {
    result.textContent = "Great — that means your confidence is growing.";
  } else if (level === "okay") {
    result.textContent = "Nice — that still counts as strong progress.";
  } else if (level === "hard") {
    result.textContent = "Hard moments still build real confidence. Keep going.";
  }
}

function saveReflectionNote() {
  const note = document.getElementById("reflection-note");
  const result = document.getElementById("reflection-result");
  const value = note.value.trim();

  if (!value) {
    result.textContent = "Write something first before saving.";
    return;
  }

  const data = getUserData();
  data.growth.reflectionNotes.push({
    note: value,
    time: new Date().toISOString()
  });
  saveUserData(data);

  result.textContent = "Reflection saved 💙";
  note.value = "";
}

/* =========================
   PROGRESS
========================= */

function updateGrowthStats() {
  const data = getUserData();
  const today = getTodayDate();

  const todayCompleted = data.growth.challengesCompleted.filter(item =>
    item.time.startsWith(today)
  ).length;

  const totalCompleted = data.growth.challengesCompleted.length;

  let streak = 0;
  const uniqueDates = [...new Set(data.growth.sessionDates)].sort().reverse();

  let checkDate = new Date();
  for (let i = 0; i < 7; i++) {
    const d = checkDate.toISOString().split("T")[0];
    if (uniqueDates.includes(d)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const todayEl = document.getElementById("today-completed");
  const totalEl = document.getElementById("total-completed");
  const streakEl = document.getElementById("weekly-streak");

  if (todayEl) todayEl.textContent = todayCompleted;
  if (totalEl) totalEl.textContent = totalCompleted;
  if (streakEl) streakEl.textContent = streak;
}

function updateGrowthScore() {
  const data = getUserData();

  const completed = data.growth.challengesCompleted.length;
  const skipped = data.growth.challengesSkipped.length;
  const totalAttempts = completed + skipped;

  let successRate = 0;
  if (totalAttempts > 0) {
    successRate = Math.round((completed / totalAttempts) * 100);
  }

  const today = new Date();
  let weeklyActivity = 0;

  data.growth.challengesCompleted.forEach(item => {
    const itemDate = new Date(item.time);
    const diffTime = today - itemDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) {
      weeklyActivity++;
    }
  });

  const completedEl = document.getElementById("completed-count");
  const successEl = document.getElementById("success-rate");
  const weeklyEl = document.getElementById("weekly-activity");

  if (completedEl) completedEl.textContent = completed;
  if (successEl) successEl.textContent = `${successRate}%`;
  if (weeklyEl) weeklyEl.textContent = weeklyActivity;
}

/* =========================
   LADDER SYSTEM
========================= */

function updateLadder() {
  const data = getUserData();
  const currentLevel = data.growth.ladderLevel || 1;

  const levels = [
    document.getElementById("level-1"),
    document.getElementById("level-2"),
    document.getElementById("level-3"),
    document.getElementById("level-4"),
    document.getElementById("level-5")
  ];

  levels.forEach((levelEl, index) => {
    if (!levelEl) return;

    levelEl.classList.remove("active", "completed");

    const levelNumber = index + 1;

    if (levelNumber < currentLevel) {
      levelEl.classList.add("completed");
    } else if (levelNumber === currentLevel) {
      levelEl.classList.add("active");
    }
  });

  const ladderStatus = document.getElementById("ladder-status");
  if (ladderStatus) {
    ladderStatus.textContent = `You are currently on Level ${currentLevel}. Keep moving forward.`;
  }
}

function checkLadderProgress() {
  const data = getUserData();
  const completedCount = data.growth.challengesCompleted.length;

  let newLevel = 1;

  if (completedCount >= 2) newLevel = 2;
  if (completedCount >= 5) newLevel = 3;
  if (completedCount >= 8) newLevel = 4;
  if (completedCount >= 12) newLevel = 5;

  if (newLevel !== data.growth.ladderLevel) {
    data.growth.ladderLevel = newLevel;
    saveUserData(data);
  }

  updateLadder();
}
