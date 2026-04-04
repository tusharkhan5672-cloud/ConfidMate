function saveUsername() {
  const usernameInput = document.getElementById("username");
  const msg = document.getElementById("usernameMessage");

  const username = usernameInput.value.trim().toLowerCase();
  const userEmail = localStorage.getItem("userEmail");

  // ❌ No username
  if (!username) {
    msg.textContent = "Please enter a username.";
    msg.style.color = "#b91c1c";
    return;
  }

  // ❌ Length check
  if (username.length < 3) {
    msg.textContent = "Username must be at least 3 characters.";
    msg.style.color = "#b91c1c";
    return;
  }

  // ❌ Only letters + numbers
  if (!/^[a-z0-9]+$/.test(username)) {
    msg.textContent = "Only lowercase letters and numbers allowed.";
    msg.style.color = "#b91c1c";
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || {};

  // ❌ Check if username already taken
  const usernameTaken = Object.values(users).some(user => user.username === username);

  if (usernameTaken) {
    msg.textContent = "Username already taken. Try another.";
    msg.style.color = "#b91c1c";
    return;
  }

  // ✅ Save user
  if (!users[userEmail]) {
    users[userEmail] = {
      username: username,
      password: null,
      data: {
        moods: [],
        breathing: { totalCycles: 0, lastSessionStart: null, lastSessionEnd: null },
        tipsSeen: [],
        soundsPlayed: [],
        chatHistory: [],
        practice: {
          scenariosChosen: [],
          promptsSeen: [],
          timerSessions: [],
          aiPracticeChats: [],
          feedbackHistory: [],
          videoSessions: [],
          sessionDates: []
        },
        growth: {
          currentChallenge: null,
          challengesCompleted: [],
          challengesSkipped: [],
          reflections: [],
          reflectionNotes: [],
          sessionDates: [],
          ladderLevel: 1
        },
        confidence: {
          currentChallenge: null,
          challengesCompleted: [],
          challengesSkipped: [],
          presenceTasks: [],
          aiScenarios: [],
          winLogs: []
        },
        weeklyGoal: {
          title: "",
          category: "",
          target: 0,
          progress: 0,
          note: "",
          createdAt: null
        }
      }
    };
  } else {
    users[userEmail].username = username;
  }

  // ✅ Save everything
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", username);

  msg.textContent = "Looks good. Let’s go 🚀";
  msg.style.color = "#166534";

  // Redirect
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 700);
}