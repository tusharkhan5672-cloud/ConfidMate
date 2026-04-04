document.addEventListener("DOMContentLoaded", function () {
  const authArea = document.getElementById("auth-area");
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    window.location.href = "../login/login.html";
    return;
  }

  if (authArea) {
    authArea.innerHTML = `
      <span id="userProfile" style="margin-right:10px; cursor:pointer;">Hi, ${currentUser}</span>
      <button id="logoutBtn">Logout</button>
    `;

    const userProfile = document.getElementById("userProfile");
    const logoutBtn = document.getElementById("logoutBtn");

    if (userProfile) {
      userProfile.addEventListener("click", () => {
        window.location.href = "dashboard.html";
      });
    }

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

  loadDashboard(currentUser);
});

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "../index.html";
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function getUserData() {
  const currentUser = localStorage.getItem("currentUser");
  const users = getUsers();
  return users[currentUser]?.data || {};
}

function loadDashboard(currentUser) {
  const data = getUserData();

  const comfortActions =
    (data.moods?.length || 0) +
    (data.breathing?.totalCycles || 0) +
    (data.tipsSeen?.length || 0) +
    (data.soundsPlayed?.length || 0) +
    (data.chatHistory?.length || 0);

  const practiceActions =
    (data.practice?.scenariosChosen?.length || 0) +
    (data.practice?.promptsSeen?.length || 0) +
    (data.practice?.timerSessions?.length || 0) +
    (data.practice?.aiPracticeChats?.length || 0) +
    (data.practice?.feedbackHistory?.length || 0) +
    (data.practice?.videoSessions?.length || 0);

  const growthActions =
    (data.growth?.challengesCompleted?.length || 0) +
    (data.growth?.reflections?.length || 0) +
    (data.growth?.reflectionNotes?.length || 0);

  const confidenceActions =
    (data.confidence?.challengesCompleted?.length || 0) +
    (data.confidence?.presenceTasks?.length || 0) +
    (data.confidence?.aiScenarios?.length || 0) +
    (data.confidence?.winLogs?.length || 0);

  const totalActions = comfortActions + practiceActions + growthActions + confidenceActions;

  const comfortPercent = calcPercent(comfortActions, 60);
  const practicePercent = calcPercent(practiceActions, 60);
  const growthPercent = calcPercent(growthActions, 40);
  const confidencePercent = calcPercent(confidenceActions, 40);

  const combinedPercent = Math.min(
    100,
    Math.round((comfortPercent + practicePercent + growthPercent + confidencePercent) / 4)
  );

  document.getElementById("welcome-text").textContent = `Hi, ${currentUser} 👋`;
  document.getElementById("confidence-score-main").textContent = `${combinedPercent}%`;

  updateScoreRing(combinedPercent);

  //weekly
  

  // top stats
  const weeklyStreak =
    Math.max(
      data.growth?.sessionDates ? getStreakFromDates(data.growth.sessionDates) : 0,
      data.practice?.sessionDates ? getStreakFromDates(data.practice.sessionDates) : 0
    );

  const todaySessions =
    getTodayCount(data.practice?.sessionDates || []) +
    getTodayCount(data.growth?.sessionDates || []);

  const aiInteractions =
    (data.chatHistory?.length || 0) +
    (data.practice?.aiPracticeChats?.length || 0) +
    (data.confidence?.aiScenarios?.length || 0);

  document.getElementById("weekly-streak-main").textContent = weeklyStreak;
  document.getElementById("streak-badge").textContent = `${weeklyStreak} days`;
  document.getElementById("total-actions-main").textContent = totalActions;
  document.getElementById("today-sessions-main").textContent = todaySessions;
  document.getElementById("ai-interactions-main").textContent = aiInteractions;

  // zones
  setProgress("comfort", comfortPercent, comfortActions, "comfort actions completed");
  setProgress("practice", practicePercent, practiceActions, "practice actions completed");
  setProgress("growth", growthPercent, growthActions, "growth actions completed");
  setProgress("confidence", confidencePercent, confidenceActions, "confidence actions completed");

  // weekly bars
  renderWeeklyBars(data);

  // insights
  renderInsights({
    comfortActions,
    practiceActions,
    growthActions,
    confidenceActions,
    data
  });

  // growth stats
  const growthCompleted = data.growth?.challengesCompleted?.length || 0;
  const growthSkipped = data.growth?.challengesSkipped?.length || 0;
  const growthAttempts = growthCompleted + growthSkipped;
  const growthSuccess = growthAttempts > 0 ? Math.round((growthCompleted / growthAttempts) * 100) : 0;
  const growthWeekly = countLast7Days(data.growth?.challengesCompleted || []);

  document.getElementById("growth-completed").textContent = `Challenges completed: ${growthCompleted}`;
  document.getElementById("growth-success").textContent = `Success rate: ${growthSuccess}%`;
  document.getElementById("growth-weekly").textContent = `Weekly activity: ${growthWeekly}`;

  // confidence stats
  document.getElementById("conf-challenges").textContent =
    `Challenges done: ${data.confidence?.challengesCompleted?.length || 0}`;
  document.getElementById("presence-count").textContent =
    `Presence tasks: ${data.confidence?.presenceTasks?.length || 0}`;
  document.getElementById("win-logs").textContent =
    `Wins logged: ${data.confidence?.winLogs?.length || 0}`;
}

function calcPercent(value, max) {
  return Math.min(100, Math.round((value / max) * 100));
}

function updateScoreRing(percent) {
  const ring = document.getElementById("score-ring");
  const deg = Math.round((percent / 100) * 360);
  ring.style.background = `conic-gradient(#6366f1 0deg, #8b9cfb ${deg * 0.7}deg, #c4b5fd ${deg}deg, rgba(255,255,255,0.4) ${deg}deg)`;
}

function setProgress(prefix, percent, value, text) {
  const percentEl = document.getElementById(`${prefix}-percent`);
  const fillEl = document.getElementById(`${prefix}-fill`);
  const textEl = document.getElementById(`${prefix}-text`);

  if (percentEl) percentEl.textContent = `${percent}%`;
  if (fillEl) fillEl.style.width = `${percent}%`;
  if (textEl) textEl.textContent = `${value} ${text}`;
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getTodayCount(arr) {
  const today = getTodayDate();
  return arr.filter(d => d === today).length;
}

function getStreakFromDates(dates) {
  const uniqueDates = [...new Set(dates)].sort().reverse();
  let streak = 0;
  let checkDate = new Date();

  for (let i = 0; i < 30; i++) {
    const d = checkDate.toISOString().split("T")[0];
    if (uniqueDates.includes(d)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function countLast7Days(items) {
  const now = new Date();
  let count = 0;

  items.forEach(item => {
    const itemDate = new Date(item.time);
    const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays <= 7) count++;
  });

  return count;
}

function renderWeeklyBars(data) {
  const days = getLast7DateStrings();
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const counts = days.map(date => {
    let count = 0;

    count += (data.moods || []).filter(x => x.time?.startsWith(date)).length;
    count += (data.tipsSeen || []).filter(x => x.time?.startsWith(date)).length;
    count += (data.soundsPlayed || []).filter(x => x.time?.startsWith(date)).length;
    count += (data.chatHistory || []).filter(x => x.time?.startsWith(date)).length;

    count += (data.practice?.scenariosChosen || []).filter(x => x.time?.startsWith(date)).length;
    count += (data.practice?.timerSessions || []).filter(x => x.completedAt?.startsWith(date)).length;
    count += (data.practice?.aiPracticeChats || []).filter(x => x.time?.startsWith(date)).length;
    count += (data.practice?.feedbackHistory || []).filter(x => x.time?.startsWith(date)).length;

    count += (data.growth?.challengesCompleted || []).filter(x => x.time?.startsWith(date)).length;
    count += (data.growth?.reflections || []).filter(x => x.time?.startsWith(date)).length;
    count += (data.growth?.reflectionNotes || []).filter(x => x.time?.startsWith(date)).length;

    count += (data.confidence?.challengesCompleted || []).filter(x => x.time?.startsWith(date)).length;
    count += (data.confidence?.presenceTasks || []).filter(x => x.time?.startsWith(date)).length;
    count += (data.confidence?.aiScenarios || []).filter(x => x.time?.startsWith(date)).length;
    count += (data.confidence?.winLogs || []).filter(x => x.time?.startsWith(date)).length;

    return count;
  });

  const max = Math.max(...counts, 1);

  counts.forEach((count, i) => {
    const bar = document.getElementById(`bar-${i}`);
    const day = document.getElementById(`day-${i}`);

    if (bar) {
      const h = Math.max(20, Math.round((count / max) * 190));
      bar.style.height = `${h}px`;
    }

    if (day) {
      const dateObj = new Date(days[i]);
      day.textContent = labels[dateObj.getDay()];
    }
  });
}

function getLast7DateStrings() {
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().split("T")[0]);
  }
  return arr;
}

function renderInsights({ comfortActions, practiceActions, growthActions, confidenceActions, data }) {
  const zoneMap = {
    "Comfort Zone": comfortActions,
    "Practice Zone": practiceActions,
    "Growth Zone": growthActions,
    "Confidence Zone": confidenceActions
  };

  const mostActiveZone = Object.entries(zoneMap).sort((a, b) => b[1] - a[1])[0][0];
  document.getElementById("most-active-zone").textContent = `Most active zone: ${mostActiveZone}`;

  const moods = data.moods || [];
  let moodTrend = "No mood data yet";
  if (moods.length > 0) {
    const lastMoods = moods.slice(-5).map(x => x.mood);
    const happyish = lastMoods.filter(m => m === "happy" || m === "neutral").length;
    moodTrend = happyish >= Math.ceil(lastMoods.length / 2) ? "Mood trend: Improving" : "Mood trend: Needs support";
  }
  document.getElementById("mood-trend").textContent = moodTrend;

  const sounds = data.soundsPlayed || [];
  let topSoundText = "Top calm sound: —";
  if (sounds.length > 0) {
    const counts = {};
    sounds.forEach(s => {
      counts[s.type] = (counts[s.type] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    topSoundText = `Top calm sound: ${formatSound(top)}`;
  }
  document.getElementById("top-sound").textContent = topSoundText;
}

function formatSound(type) {
  if (type === "whiteNoise") return "White Noise";
  if (type === "softMusic") return "Soft Music";
  if (type === "rain") return "Rain";
  return type;
}

// weekly 

function ensureWeeklyGoalData() {
  const currentUser = localStorage.getItem("currentUser");
  const users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[currentUser]) return null;
  if (!users[currentUser].data) users[currentUser].data = {};

  if (!users[currentUser].data.weeklyGoal) {
    users[currentUser].data.weeklyGoal = {
      title: "",
      category: "",
      target: 0,
      progress: 0,
      note: "",
      createdAt: null
    };
    localStorage.setItem("users", JSON.stringify(users));
  }

  return users[currentUser].data.weeklyGoal;
}

function getGoalAISuggestion(category, title) {
  const lowerTitle = (title || "").toLowerCase();

  if (category === "study") {
    return "Break this into small daily study blocks. Don’t chase long hours — chase clean consistency.";
  }

  if (category === "work") {
    return "Keep it practical. One clear step a day will move this faster than waiting for the perfect moment.";
  }

  if (category === "social") {
    return "Keep it natural. Start with one simple interaction and focus on connection, not performance.";
  }

  if (category === "confidence") {
    return "Confidence grows from reps. Keep showing up, even if the action feels small.";
  }

  if (category === "fitness") {
    return "Treat this like identity-building. Momentum matters more than mood.";
  }

  if (
    lowerTitle.includes("girl") ||
    lowerTitle.includes("crush") ||
    lowerTitle.includes("someone i like")
  ) {
    return "Stay calm, natural, and honest. Don’t try to force an outcome — focus on being present and real.";
  }

  return "Keep it simple, measurable, and consistent. One small step today is still real progress.";
}

function getGoalStatus(progress, target) {
  if (!target || target <= 0) return "No Goal";
  if (progress >= target) return "Completed";
  if (progress === 0) return "Not Started";
  return "In Progress";
}

function getCategoryLabel(category) {
  if (!category) return "Focus";

  const map = {
    study: "Study",
    work: "Work",
    social: "Social",
    confidence: "Confidence",
    fitness: "Fitness",
    personal: "Personal"
  };

  return map[category] || "Focus";
}

function renderDashboardGoal() {
  const goal = ensureWeeklyGoalData();

  const titleEl = document.getElementById("dashboard-goal-title");
  const categoryEl = document.getElementById("dashboard-goal-category");
  const noteEl = document.getElementById("dashboard-goal-note");
  const progressTextEl = document.getElementById("dashboard-goal-progress-text");
  const progressFillEl = document.getElementById("dashboard-goal-progress-fill");
  const aiEl = document.getElementById("dashboard-goal-ai");
  const ringEl = document.getElementById("goal-ring");
  const ringNumberEl = document.getElementById("goal-ring-number");
  const statusPillEl = document.getElementById("goal-status-pill");
  const categoryChipEl = document.getElementById("dashboard-goal-category-chip");
  const targetMiniEl = document.getElementById("goal-target-mini");
  const doneMiniEl = document.getElementById("goal-done-mini");
  const leftMiniEl = document.getElementById("goal-left-mini");

  if (!goal || !goal.title) {
    if (titleEl) titleEl.textContent = "No weekly goal set yet";
    if (categoryEl) categoryEl.textContent = "Category: —";
    if (noteEl) noteEl.textContent = "Set a goal to start building momentum.";
    if (progressTextEl) progressTextEl.textContent = "0 / 0";
    if (progressFillEl) progressFillEl.style.width = "0%";
    if (aiEl) aiEl.textContent = "Set a weekly goal and ConfidMate will guide you here.";
    if (ringNumberEl) ringNumberEl.textContent = "0%";
    if (statusPillEl) statusPillEl.textContent = "No Goal";
    if (categoryChipEl) categoryChipEl.textContent = "Focus";
    if (targetMiniEl) targetMiniEl.textContent = "0";
    if (doneMiniEl) doneMiniEl.textContent = "0";
    if (leftMiniEl) leftMiniEl.textContent = "0";
    if (ringEl) {
      ringEl.style.background =
        "conic-gradient(#6366f1 0deg, #8b9cfb 0deg, rgba(255,255,255,0.4) 0deg)";
    }
    return;
  }

  const percent = Math.min(100, Math.round((goal.progress / goal.target) * 100));
  const status = getGoalStatus(goal.progress, goal.target);
  const left = Math.max(0, goal.target - goal.progress);
  const deg = Math.round((percent / 100) * 360);

  if (titleEl) titleEl.textContent = goal.title;
  if (categoryEl) categoryEl.textContent = `Category: ${getCategoryLabel(goal.category)}`;
  if (noteEl) noteEl.textContent = goal.note || "No extra note added.";
  if (progressTextEl) progressTextEl.textContent = `${goal.progress} / ${goal.target}`;
  if (progressFillEl) progressFillEl.style.width = `${percent}%`;
  if (aiEl) aiEl.textContent = getGoalAISuggestion(goal.category, goal.title);
  if (ringNumberEl) ringNumberEl.textContent = `${percent}%`;
  if (statusPillEl) statusPillEl.textContent = status;
  if (categoryChipEl) categoryChipEl.textContent = getCategoryLabel(goal.category);
  if (targetMiniEl) targetMiniEl.textContent = goal.target;
  if (doneMiniEl) doneMiniEl.textContent = goal.progress;
  if (leftMiniEl) leftMiniEl.textContent = left;

  if (ringEl) {
    ringEl.style.background =
      `conic-gradient(#6366f1 0deg, #8b9cfb ${deg * 0.7}deg, #c4b5fd ${deg}deg, rgba(255,255,255,0.4) ${deg}deg)`;
  }
}

function addDashboardGoalProgress() {
  const currentUser = localStorage.getItem("currentUser");
  const users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[currentUser] || !users[currentUser].data) return;

  if (!users[currentUser].data.weeklyGoal) {
    alert("Set a weekly goal first.");
    return;
  }

  const goal = users[currentUser].data.weeklyGoal;

  if (!goal.title) {
    alert("Set a weekly goal first.");
    return;
  }

  if (goal.progress < goal.target) {
    goal.progress += 1;
    localStorage.setItem("users", JSON.stringify(users));
    renderDashboardGoal();
  }
}

function resetDashboardGoal() {
  const currentUser = localStorage.getItem("currentUser");
  const users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[currentUser] || !users[currentUser].data) return;

  users[currentUser].data.weeklyGoal = {
    title: "",
    category: "",
    target: 0,
    progress: 0,
    note: "",
    createdAt: null
  };

  localStorage.setItem("users", JSON.stringify(users));
  renderDashboardGoal();
}

function openGoalModal() {
  const modal = document.getElementById("goal-modal-overlay");
  if (modal) {
    modal.classList.add("active");
  }
}

function closeGoalModal() {
  const modal = document.getElementById("goal-modal-overlay");
  if (modal) {
    modal.classList.remove("active");
  }
}

function saveDashboardGoal() {
  const currentUser = localStorage.getItem("currentUser");
  const users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[currentUser]) return;
  if (!users[currentUser].data) users[currentUser].data = {};

  const title = document.getElementById("goal-title").value.trim();
  const category = document.getElementById("goal-category").value;
  const target = parseInt(document.getElementById("goal-target").value);
  const note = document.getElementById("goal-note").value.trim();

  if (!title || !target || target < 1) {
    alert("Please enter a valid goal and target.");
    return;
  }

  users[currentUser].data.weeklyGoal = {
    title: title,
    category: category,
    target: target,
    progress: 0,
    note: note,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem("users", JSON.stringify(users));
  renderDashboardGoal();
  closeGoalModal();

  document.getElementById("goal-title").value = "";
  document.getElementById("goal-category").value = "study";
  document.getElementById("goal-target").value = "";
  document.getElementById("goal-note").value = "";
}