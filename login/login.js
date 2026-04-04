import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCO7mM26iCeCVnXYZiiO9MxdAIknyK-GjE",
  authDomain: "confidante-90ad8.firebaseapp.com",
  projectId: "confidante-90ad8",
  storageBucket: "confidante-90ad8.firebasestorage.app",
  messagingSenderId: "431373370136",
  appId: "1:431373370136:web:05e4dcf78a520240a8146d",
  measurementId: "G-SYG3BJ2C32"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const googleBtn = document.getElementById("googleBtn");
const authMessage = document.getElementById("authMessage");

function showMessage(message, isError = false) {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.style.color = isError ? "#b91c1c" : "#166534";
}

function getUsernameFromEmail(email) {
  if (!email) return "User";
  return email.split("@")[0];
}

function ensureUserInLocalStorage(userEmail) {
  const users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[userEmail]) {
    users[userEmail] = {
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

    localStorage.setItem("users", JSON.stringify(users));
  }
}

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showMessage("Please enter email and password.", true);
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userEmail = userCredential.user.email;
    const username = getUsernameFromEmail(userEmail);

    ensureUserInLocalStorage(userEmail);

    localStorage.setItem("currentUser", username);
    localStorage.setItem("userEmail", userEmail);

    showMessage("Login successful ✅");

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 700);
  } catch (error) {
    showMessage(error.message, true);
  }
});

signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showMessage("Please enter email and password.", true);
    return;
  }

  try {
    // TRY TO CREATE ACCOUNT
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const userEmail = userCredential.user.email;
    const username = userEmail.split("@")[0];

    ensureUserInLocalStorage(userEmail);

    localStorage.setItem("currentUser", username);
    localStorage.setItem("userEmail", userEmail);

    showMessage("Account created successfully 🎉");

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 700);

  } catch (error) {

    // 🔥 IF EMAIL ALREADY EXISTS → LOGIN INSTEAD
    if (error.code === "auth/email-already-in-use") {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const userEmail = userCredential.user.email;
        const username = userEmail.split("@")[0];

        ensureUserInLocalStorage(userEmail);

        localStorage.setItem("currentUser", username);
        localStorage.setItem("userEmail", userEmail);

        showMessage("Welcome back 👋");

        setTimeout(() => {
          window.location.href = "../index.html";
        }, 700);

      } catch (loginError) {
        showMessage("Account exists. Please check your password.", true);
      }
    } else {
      showMessage(error.message, true);
    }
  }
});

googleBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userEmail = user.email;

    const users = JSON.parse(localStorage.getItem("users")) || {};

    // If user exists AND has username → go home
    if (users[userEmail] && users[userEmail].username) {
      localStorage.setItem("currentUser", users[userEmail].username);
      localStorage.setItem("userEmail", userEmail);

      window.location.href = "../index.html";
      return;
    }

    // If new user → store email temporarily
    localStorage.setItem("userEmail", userEmail);

    window.location.href = "choose-username.html";

  } catch (error) {
    showMessage(error.message, true);
  }
});

