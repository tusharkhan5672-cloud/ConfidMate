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
        window.location.href = "../dashboard/dashboard.html";
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

  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");

  if (sendBtn && userInput) {
    sendBtn.addEventListener("click", sendConfidenceMessage);

    userInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") sendConfidenceMessage();
    });
  }

  renderWinLogs();
  updateConfidenceScore();
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

  if (!data.confidence) {
    data.confidence = {
      currentChallenge: null,
      challengesCompleted: [],
      challengesSkipped: [],
      presenceTasks: [],
      aiScenarios: [],
      winLogs: []
    };
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
   CONFIDENCE CHALLENGES
========================= */

const confidenceChallenges = [
  "Share your opinion clearly in one conversation today.",
  "Start and lead a conversation for at least 1 minute.",
  "Talk to someone attractive without overthinking.",
  "Ask a follow-up question and keep the conversation going.",
  "Disagree politely with someone while staying calm.",
  "Speak slightly slower and clearer in your next interaction.",
  "Introduce yourself confidently in a social setting.",
  "Join a conversation instead of waiting to be invited."
];

function generateConfidenceChallenge() {
  const challengeText = document.getElementById("confidence-challenge-text");
  const random = confidenceChallenges[Math.floor(Math.random() * confidenceChallenges.length)];
  challengeText.textContent = random;

  const data = getUserData();
  data.confidence.currentChallenge = {
    text: random,
    createdAt: new Date().toISOString()
  };
  saveUserData(data);
}

function completeConfidenceChallenge() {
  const status = document.getElementById("confidence-challenge-status");
  const data = getUserData();

  if (!data.confidence.currentChallenge) {
    status.textContent = "Generate a challenge first.";
    return;
  }

  data.confidence.challengesCompleted.push({
    text: data.confidence.currentChallenge.text,
    time: new Date().toISOString()
  });

  saveUserData(data);
  status.textContent = "Challenge completed — strong move 🔥";
  updateConfidenceScore();
}

function skipConfidenceChallenge() {
  const status = document.getElementById("confidence-challenge-status");
  const data = getUserData();

  if (!data.confidence.currentChallenge) {
    status.textContent = "Generate a challenge first.";
    return;
  }

  data.confidence.challengesSkipped.push({
    text: data.confidence.currentChallenge.text,
    time: new Date().toISOString()
  });

  saveUserData(data);
  status.textContent = "Challenge skipped for now.";
  updateConfidenceScore();
}

/* =========================
   PRESENCE TASKS
========================= */

function markPresenceTask(type) {
  const result = document.getElementById("presence-result");
  const data = getUserData();

  data.confidence.presenceTasks.push({
    type: type,
    time: new Date().toISOString()
  });

  saveUserData(data);
  result.textContent = "Presence task tracked ✅";
  updateConfidenceScore();
}

/* =========================
   AI MODES
========================= */

let currentMode = "networking";

function setConfidenceMode(mode) {
  currentMode = mode;

  const modeMessage = document.getElementById("mode-message");
  if (!modeMessage) return;

  if (mode === "networking") {
    modeMessage.textContent = "You’re at a networking event. Start confidently and make a good impression.";
  } else if (mode === "group") {
    modeMessage.textContent = "You’re joining a group conversation. Speak clearly and naturally.";
  } else if (mode === "leadership") {
    modeMessage.textContent = "You’re leading a conversation. Guide it with confidence and calm energy.";
  } else if (mode === "attraction") {
    modeMessage.textContent = "You’re talking to someone you’re attracted to. Stay relaxed, present, and natural.";
  }
}

function appendMessage(message, className) {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  const div = document.createElement("div");
  div.textContent = message;
  div.className = className;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function getConfidenceAIResponse(message) {
  const msg = message.toLowerCase().trim();

  const networkingReplies = [
    "Nice start — that feels natural. Now ask a thoughtful follow-up and keep the conversation flowing.",
    "Good energy. Try sounding a little more curious now, like you genuinely want to know the other person.",
    "That works well. Add one more line about yourself so it feels more memorable.",
    "Smooth start. Now guide the conversation with a confident question.",
    "Nice — you’re coming across well. Keep it relaxed and let the conversation breathe."
  ];

  const groupReplies = [
    "Good. Now speak a little more clearly and add your own opinion instead of only reacting.",
    "Nice start — in a group, your calmness matters. Say a little more and own your space.",
    "That works. Try making your next line shorter, clearer, and more direct.",
    "Good energy. Now imagine everyone is already comfortable hearing you speak.",
    "Nice. Add one confident follow-up so your presence feels stronger in the group."
  ];

  const leadershipReplies = [
    "Strong. Now make it a little more concise and confident, like someone people naturally listen to.",
    "That’s solid. Try saying it again with fewer words and more certainty.",
    "Nice — leadership sounds calm, not rushed. Slow it down a bit and keep it clear.",
    "Good response. Now make it sound more decisive, like you trust your own point.",
    "That has potential. Sharpen it and make it feel more grounded."
  ];

  const attractionReplies = [
    "Nice. Keep it relaxed — don’t try too hard. Just stay present and a little playful.",
    "Good start. Confidence here is about ease, not pressure. Keep it light.",
    "That works. Now say a little less and let the moment breathe.",
    "Nice energy. Stay natural — the goal is connection, not performance.",
    "Good. Keep it smooth, simple, and genuine."
  ];

  const generalReplies = [
    "That was good — now say it again with a little more calm confidence.",
    "Nice. Keep going — you sound better when you don’t overthink it.",
    "Good energy. Now make it a touch simpler and stronger.",
    "That works well. Try one more line and keep your tone relaxed.",
    "Nice start — stay present and let your words land.",
    "Good. You don’t need to force it, just keep it steady."
  ];

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // greeting handling
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    if (currentMode === "networking") {
      return "Hey — nice to meet you. Try opening like you’re genuinely interested in the other person, not trying to impress them.";
    }
    if (currentMode === "group") {
      return "Hey — imagine you’re stepping into an active group smoothly. Say something simple and natural first.";
    }
    if (currentMode === "leadership") {
      return "Hey — leadership starts with calm presence. Say your next line like you expect people to listen.";
    }
    if (currentMode === "attraction") {
      return "Hey — keep it easy. Think relaxed, warm, and natural rather than perfect.";
    }
  }

  // nervousness handling
  if (
    msg.includes("nervous") ||
    msg.includes("awkward") ||
    msg.includes("scared") ||
    msg.includes("anxious")
  ) {
    return "That’s normal. Confidence isn’t about feeling zero nerves — it’s about staying composed while you speak. Keep going.";
  }

  // short messages
  if (msg.split(" ").length <= 3) {
    return "Good start. Add a little more so it feels like a real confident response.";
  }

  // longer message praise
  if (msg.split(" ").length >= 14) {
    return "That’s strong — you’re expressing yourself well. Now tighten it slightly so it sounds even more confident.";
  }

  if (currentMode === "networking") {
    return randomFrom(networkingReplies);
  }

  if (currentMode === "group") {
    return randomFrom(groupReplies);
  }

  if (currentMode === "leadership") {
    return randomFrom(leadershipReplies);
  }

  if (currentMode === "attraction") {
    return randomFrom(attractionReplies);
  }

  return randomFrom(generalReplies);
}

function sendConfidenceMessage() {
  const userInput = document.getElementById("userInput");
  const userMsg = userInput.value.trim();
  if (!userMsg) return;

  appendMessage(userMsg, "user-message");

  const aiMsg = getConfidenceAIResponse(userMsg);
  appendMessage(aiMsg, "ai-message");

  const data = getUserData();
  data.confidence.aiScenarios.push({
    mode: currentMode,
    user: userMsg,
    ai: aiMsg,
    time: new Date().toISOString()
  });

  saveUserData(data);
  userInput.value = "";
  updateConfidenceScore();
}

/* =========================
   WIN LOG
========================= */

function saveWinLog() {
  const input = document.getElementById("win-input");
  const result = document.getElementById("win-result");
  const value = input.value.trim();

  if (!value) {
    result.textContent = "Write a win first.";
    return;
  }

  const data = getUserData();
  data.confidence.winLogs.push({
    text: value,
    time: new Date().toISOString()
  });

  saveUserData(data);
  input.value = "";
  result.textContent = "Win saved 🏆";

  renderWinLogs();
  updateConfidenceScore();
}

function renderWinLogs() {
  const winsList = document.getElementById("wins-list");
  if (!winsList) return;

  const data = getUserData();
  winsList.innerHTML = "";

  const latestWins = data.confidence.winLogs.slice(-5).reverse();

  latestWins.forEach(item => {
    const div = document.createElement("div");
    div.className = "win-item";
    div.textContent = item.text;
    winsList.appendChild(div);
  });
}

/* =========================
   CONFIDENCE SCORE
========================= */

function updateConfidenceScore() {
  const data = getUserData();

  const completed = data.confidence.challengesCompleted.length;
  const presence = data.confidence.presenceTasks.length;
  const chats = data.confidence.aiScenarios.length;
  const wins = data.confidence.winLogs.length;

  const score = completed * 3 + presence * 2 + chats + wins * 2;

  const completedEl = document.getElementById("completed-confidence");
  const presenceEl = document.getElementById("presence-count");
  const scoreEl = document.getElementById("confidence-score");

  if (completedEl) completedEl.textContent = completed;
  if (presenceEl) presenceEl.textContent = presence;
  if (scoreEl) scoreEl.textContent = score;
}
