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
        window.location.href = "../../dashbaord/dashboard.html";
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
    sendBtn.addEventListener("click", sendPracticeMessage);

    userInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") sendPracticeMessage();
    });
  }

  updatePracticeStats();
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

  if (!data.practice) {
    data.practice = {
      scenariosChosen: [],
      promptsSeen: [],
      timerSessions: [],
      aiPracticeChats: [],
      feedbackHistory: [],
      videoSessions: [],
      sessionDates: []
    };
  }

  if (!data.practice.sessionDates) {
    data.practice.sessionDates = [];
  }

  if (!data.practice.videoSessions) {
    data.practice.videoSessions = [];
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
   DATE HELPERS
========================= */

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/* =========================
   PRACTICE SESSION TRACKING
========================= */

function trackPracticeSession() {
  const data = getUserData();
  const today = getTodayDate();

  if (!data.practice.sessionDates) {
    data.practice.sessionDates = [];
  }

  data.practice.sessionDates.push(today);
  saveUserData(data);

  updatePracticeStats();
}

function updatePracticeStats() {
  const data = getUserData();
  const today = getTodayDate();

  const sessionDates = data.practice.sessionDates || [];

  // Today's sessions
  const todaySessions = sessionDates.filter(date => date === today).length;

  // Total practice rounds
  const totalRounds = sessionDates.length;

  // Weekly streak
  let streak = 0;
  const uniqueDates = [...new Set(sessionDates)].sort().reverse();

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

  const todayEl = document.getElementById("today-sessions");
  const totalEl = document.getElementById("total-rounds");
  const streakEl = document.getElementById("weekly-streak");

  if (todayEl) todayEl.textContent = todaySessions;
  if (totalEl) totalEl.textContent = totalRounds;
  if (streakEl) streakEl.textContent = streak;
}

/* =========================
   SCENARIOS + PROMPTS
========================= */

const prompts = {
  intro: [
    "Introduce yourself like you’re meeting someone for the first time.",
    "Tell someone your name, what you do, and one thing you enjoy.",
    "Describe yourself in a simple and confident way.",
    "Introduce yourself in under 20 seconds, keep it clear and natural.",
    "Say your name and one thing that makes you unique.",
    "Imagine you're at a new place — introduce yourself casually.",
    "Introduce yourself with a smile and relaxed tone.",
    "Tell someone who you are without overthinking it.",
    "Introduce yourself like you're talking to a friendly stranger.",
    "Say your name and what you're currently focused on.",
    "Introduce yourself as if you're starting a conversation.",
    "Explain who you are in a calm and confident voice.",
    "Introduce yourself like you're meeting someone you’d like to know better."
  ],

  smalltalk: [
    "Start a casual conversation about the weather or your day.",
    "Talk about your favorite food like you're chatting with someone new.",
    "Ask 3 simple small-talk questions.",
    "Start a conversation like: 'Hey, how’s your day going?'",
    "Talk about something you did recently.",
    "Comment on your surroundings to start a conversation.",
    "Ask someone what they like to do in their free time.",
    "Talk about a movie or show you recently watched.",
    "Start a light conversation with a simple compliment.",
    "Practice continuing a conversation for at least 30 seconds."
  ],

  help: [
    "Ask someone politely for directions.",
    "Ask for help with a simple task.",
    "Practice saying: 'Excuse me, could you help me with this?'",
    "Ask someone where a place is located in a calm tone.",
    "Request help without rushing your words.",
    "Ask for clarification politely: 'Can you explain that again?'",
    "Practice saying thank you after receiving help.",
    "Ask someone for a recommendation (food/place/etc).",
    "Start with 'Excuse me' and ask a clear question.",
    "Ask for help while maintaining eye contact."
  ],

  interview: [
    "Answer: Tell me about yourself.",
    "Answer: Why should we choose you?",
    "Answer: What are your strengths?",
    "Answer: What are your weaknesses?",
    "Answer: Why do you want this role?",
    "Answer: Tell me about a challenge you faced.",
    "Answer: Where do you see yourself in the future?",
    "Answer: What makes you different from others?",
    "Answer: Describe a situation where you showed confidence.",
    "Answer in a clear 2–3 sentence structured response."
  ]
};

function setScenario(type) {
  const promptEl = document.getElementById("practice-prompt");
  const list = prompts[type];
  const randomPrompt = list[Math.floor(Math.random() * list.length)];

  if (promptEl) {
    promptEl.textContent = randomPrompt;
  }

  const data = getUserData();
  data.practice.scenariosChosen.push({
    type: type,
    time: new Date().toISOString()
  });

  data.practice.promptsSeen.push({
    scenario: type,
    prompt: randomPrompt,
    time: new Date().toISOString()
  });

  saveUserData(data);
}

/* =========================
   TIMER
========================= */

let timerInterval;

function startTimer(seconds) {
  const timerText = document.getElementById("timer-text");
  let timeLeft = seconds;

  clearInterval(timerInterval);

  if (timerText) {
    timerText.textContent = `${timeLeft}s`;
  }

  const startTime = new Date().toISOString();

  timerInterval = setInterval(() => {
    timeLeft--;

    if (timerText) {
      timerText.textContent = `${timeLeft}s`;
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);

      if (timerText) {
        timerText.textContent = "Time’s up 🎉";
      }

      const data = getUserData();
      data.practice.timerSessions.push({
        duration: seconds,
        startedAt: startTime,
        completedAt: new Date().toISOString(),
        status: "completed"
      });
      saveUserData(data);

      trackPracticeSession();
    }
  }, 1000);
}

/* =========================
   CHAT
========================= */

function appendMessage(message, className) {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  const div = document.createElement("div");
  div.textContent = message;
  div.className = className;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function getPracticeAIResponse(message) {
  const msg = message.toLowerCase().trim();

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hey! Glad you're here. Let’s practice together — tell me a little about yourself.";
  }

  if (
    msg.includes("my name is") ||
    msg.includes("i am") ||
    msg.includes("i'm")
  ) {
    return "Nice start — that sounds natural. Now add one thing about what you do or what you enjoy.";
  }

  if (
    msg.includes("nervous") ||
    msg.includes("scared") ||
    msg.includes("afraid") ||
    msg.includes("anxious")
  ) {
    return "That’s completely okay. You don’t need to sound perfect here — just keep going. Try one short sentence first.";
  }

  if (
    msg.includes("interview") ||
    msg.includes("job") ||
    msg.includes("hr") ||
    msg.includes("tell me about yourself")
  ) {
    return "Good direction. For interview practice, keep it clear: who you are, what you do, and one strength. Try that now in 2 or 3 lines.";
  }

  if (
    msg.includes("help") ||
    msg.includes("can you help") ||
    msg.includes("excuse me")
  ) {
    return "Nice. That already sounds polite. Now say it once more in a calmer, more confident way.";
  }

  if (
    msg.includes("how are you") ||
    msg.includes("what's up") ||
    msg.includes("weather") ||
    msg.includes("nice day")
  ) {
    return "That’s a good small-talk opener. Keep it flowing — ask one simple follow-up question next.";
  }

  if (
    msg.includes("confidence") ||
    msg.includes("confident")
  ) {
    return "Confidence grows through repetition. What matters is that you’re practicing right now — that already counts.";
  }

  if (
    msg.includes("overthink") ||
    msg.includes("awkward") ||
    msg.includes("weird")
  ) {
    return "That feeling is common. Try keeping your sentence shorter and slower — simple sounds more confident.";
  }

  if (msg.split(" ").length <= 3) {
    return "Good start. Try saying a little more so it feels like a real conversation.";
  }

  if (msg.split(" ").length >= 12) {
    return "That was strong — you’re expressing yourself well. Now try saying the same thing in a simpler and more confident way.";
  }

  return "Nice practice. Keep going — now add one more sentence so the conversation feels more natural.";
}

function sendPracticeMessage() {
  const userInput = document.getElementById("userInput");
  const userMsg = userInput.value.trim();
  if (!userMsg) return;

  appendMessage(userMsg, "user-message");

  const aiMsg = getPracticeAIResponse(userMsg);

  setTimeout(() => {
    appendMessage(aiMsg, "ai-message");

    const data = getUserData();
    data.practice.aiPracticeChats.push({
      user: userMsg,
      ai: aiMsg,
      time: new Date().toISOString()
    });
    saveUserData(data);

    trackPracticeSession();
  }, 500);

  userInput.value = "";
}

/* =========================
   FEEDBACK
========================= */

function setFeedback(level) {
  const result = document.getElementById("feedback-result");

  if (result) {
    if (level === "easy") {
      result.textContent = "Great — you're getting more comfortable. Keep building momentum.";
    } else if (level === "okay") {
      result.textContent = "Nice — that’s progress. A few more reps will make it easier.";
    } else if (level === "hard") {
      result.textContent = "That’s okay. Hard practice still counts as real progress.";
    }
  }

  const data = getUserData();
  data.practice.feedbackHistory.push({
    level: level,
    time: new Date().toISOString()
  });
  saveUserData(data);

  trackPracticeSession();
}

/* =========================
   YOUTUBE GUIDED PRACTICE
========================= */

function openVideo(type) {
  let url = "";
  let message = "";

  if (type === "intro") {
    url = "https://youtu.be/y3upEON0BG4?si=itrwnEmAN7-nTuPA";
    message = "Practice this intro out loud after watching.";
  } else if (type === "confidence") {
    url = "https://youtu.be/w-HYZv6HzAs?si=KY2QVoccaxy8bw5E";
    message = "Focus on posture, tone, and speaking clearly.";
  } else if (type === "conversation") {
    url = "https://youtu.be/7sxpKhIbr0E?si=wF_b_-nQDsGVWZcG";
    message = "Try repeating the questions and answers.";
  } else if (type === "interview") {
    url = "https://youtu.be/DHCCyiuhjUQ?si=eFHViI11i0sM2TuX";
    message = "Answer the questions before the speaker does.";
  }

  if (url) {
    window.open(url, "_blank");
  }

  const feedback = document.getElementById("video-feedback");
  if (feedback) {
    feedback.innerText = message;
  }

  const data = getUserData();
  data.practice.videoSessions.push({
    type: type,
    time: new Date().toISOString()
  });
  saveUserData(data);
}