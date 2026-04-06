document.addEventListener("DOMContentLoaded", function () {
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
          window.location.href = "../../../dashboard/dashboard.html";
        });
      }

      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
      }
    } else {
      authArea.innerHTML = `<a href="../../login/login.html">Login</a>`;
    }
  }

  // navbar toggle
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

/* =========================
   AI ASSISTANT - FRONTEND
========================= */



const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

if (sendBtn && userInput && chatBox) {
  sendBtn.addEventListener("click", sendAIMessage);

  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendAIMessage();
    }
  });
}

async function sendAIMessage() {
  const userMsg = userInput.value.trim();
  if (!userMsg) return;

  appendMessage(userMsg, "user-message");
  userInput.value = "";

  const thinkingEl = appendMessage("Thinking...", "ai-message temp-message");

  try {
    const aiMsg = await getRealAIResponse(userMsg);

    if (thinkingEl) thinkingEl.remove();

    appendMessage(aiMsg, "ai-message");

    if (typeof getUserData === "function" && typeof saveUserData === "function") {
      const data = getUserData();
      if (!data.chatHistory) data.chatHistory = [];

      data.chatHistory.push({
        user: userMsg,
        ai: aiMsg,
        time: new Date().toISOString()
      });

      saveUserData(data);
    }

  } catch (error) {
    console.error("AI Assistant Error:", error);

    if (thinkingEl) thinkingEl.remove();

    appendMessage(
      "Something went wrong while contacting the AI. Please try again.",
      "ai-message"
    );
  }
}

function appendMessage(message, className) {
  if (!chatBox) return null;

  const div = document.createElement("div");
  div.textContent = message;
  div.className = className;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  return div;
}

async function getRealAIResponse(message) {
  let data = {};
  if (typeof getUserData === "function") {
    data = getUserData();
  }

  const currentUser = localStorage.getItem("currentUser") || "User";

  const response = await fetch("https://confidmate.tusharkhan5672.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      user: {
        name: currentUser,
        history: data.chatHistory || []
      }
    })
  });

  if (!response.ok) {
    let errorText = "Failed to fetch AI response";

    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorText = errorData.error;
      }
    } catch (e) {
      console.error("Error reading error response:", e);
    }

    throw new Error(errorText);
  }

  const result = await response.json();
  return result.reply || "I’m here. Tell me your topic, audience, and speaking goal.";
}



/* =========================
   AI ASSISTANT END
========================= */

  

  // load last mood
  const data = getUserData();
  if (data.moods && data.moods.length > 0) {
    const lastMood = data.moods[data.moods.length - 1].mood;
    setMood(lastMood);
  }
});

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
      data: {
        moods: [],
        breathing: {
          totalCycles: 0,
          lastSessionStart: null,
          lastSessionEnd: null
        },
        tipsSeen: [],
        soundsPlayed: [],
        chatHistory: []
      }
    };
    saveUsers(users);
  }

  return users[currentUser].data;
}

function saveUserData(updatedData) {
  const currentUser = getCurrentUser();
  const users = getUsers();

  if (!users[currentUser]) return;

  users[currentUser].data = updatedData;
  saveUsers(users);
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "../../index.html";
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

function getAIResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes("hello") || msg.includes("hi")) return "Hello! How are you feeling today?";
  if (msg.includes("joke")) return "Why did the computer go to the doctor? Because it caught a virus! 😄";
  if (msg.includes("time")) return `Current time is ${new Date().toLocaleTimeString()}`;
  if (msg.includes("weather")) return "I can't check real weather yet, but imagine it's sunny and perfect! ☀️";

  return "Hmm, I didn't understand that.";
}

function setMood(mood) {
  const result = document.getElementById("mood-result");
  const data = getUserData();

  data.moods.push({
    mood: mood,
    time: new Date().toISOString()
  });
  saveUserData(data);

  if (mood === "happy") {
    result.innerText = "You're feeling great! Keep going 🔥";
  } else if (mood === "neutral") {
    result.innerText = "Not bad. Let’s improve it a bit 🙂";
  } else if (mood === "sad") {
    result.innerText = "It's okay to feel low. Let's take it slow 💛";
  } else if (mood === "anxious") {
    result.innerText = "You seem anxious. Let's calm down first 🧘‍♂️";
  }
}

let breathingInterval;

function startBreathing() {
  const circle = document.getElementById("circle");
  const text = document.getElementById("breath-text");

  clearInterval(breathingInterval);

  const data = getUserData();
  data.breathing.lastSessionStart = new Date().toISOString();
  saveUserData(data);

  function runCycle() {
    text.innerText = "Breathe In...";
    circle.classList.remove("shrink");
    circle.classList.add("expand");

    setTimeout(() => {
      text.innerText = "Hold...";
    }, 4000);

    setTimeout(() => {
      text.innerText = "Breathe Out...";
      circle.classList.remove("expand");
      circle.classList.add("shrink");

      const updatedData = getUserData();
      updatedData.breathing.totalCycles += 1;
      saveUserData(updatedData);
    }, 8000);
  }

  runCycle();
  breathingInterval = setInterval(runCycle, 12000);
}

function stopBreathing() {
  const text = document.getElementById("breath-text");
  const circle = document.getElementById("circle");

  clearInterval(breathingInterval);

  text.innerText = "Session stopped";
  circle.classList.remove("expand", "shrink");

  const data = getUserData();
  data.breathing.lastSessionEnd = new Date().toISOString();
  saveUserData(data);
}

const tips = [
  "You don’t have to be perfect right now.",
  "It’s okay if you’re feeling a little nervous — that’s human.",
  "Start small. Even one step counts today.",
  "You’re doing better than you think you are.",
  "Take a breath… you’re safe here.",
  "No one has everything figured out, including you — and that’s okay.",
  "You don’t need to impress anyone right now.",
  "Just showing up today already matters.",
  "You’re allowed to take things slow.",
  "It’s okay to pause. You don’t have to rush."
];

function newTip() {
  const tip = document.getElementById("mind-tip");

  tip.classList.add("fade-out");

  setTimeout(() => {
    const random = tips[Math.floor(Math.random() * tips.length)];
    tip.innerText = random;

    const data = getUserData();
    data.tipsSeen.push({
      tip: random,
      time: new Date().toISOString()
    });
    saveUserData(data);

    tip.classList.remove("fade-out");
    tip.classList.add("fade-in");
  }, 300);
}

// audio

function playSound(type) {
  const audioPlayer = document.getElementById("audio-player");
  const stopBtn = document.getElementById("stop-btn");

  const buttons = {
    rain: document.getElementById("btn-rain"),
    whiteNoise: document.getElementById("btn-white"),
    softMusic: document.getElementById("btn-soft")
  };

  let src = "";

  if (type === "rain") src = "../../sounds/rain.mp3";
  else if (type === "whiteNoise") src = "../../sounds/whitenoise.mp3";
  else if (type === "softMusic") src = "../../sounds/soft.mp3";

  Object.values(buttons).forEach(btn => {
    if (btn) btn.classList.remove("active");
  });

  if (audioPlayer) {
    audioPlayer.src = src;
    audioPlayer.play();
  }

  if (buttons[type]) {
    buttons[type].classList.add("active");
  }

  if (stopBtn) {
    stopBtn.style.display = "inline-block";
  }

  const data = getUserData();
  data.soundsPlayed.push({
    type: type,
    time: new Date().toISOString()
  });
  saveUserData(data);
}

// audio stop

function stopSound() {
  const audioPlayer = document.getElementById("audio-player");
  const stopBtn = document.getElementById("stop-btn");

  const buttons = {
    rain: document.getElementById("btn-rain"),
    whiteNoise: document.getElementById("btn-white"),
    softMusic: document.getElementById("btn-soft")
  };

  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.src = "";
  }

  Object.values(buttons).forEach(btn => {
    if (btn) btn.classList.remove("active");
  });

  if (stopBtn) {
    stopBtn.style.display = "none";
  }
}
