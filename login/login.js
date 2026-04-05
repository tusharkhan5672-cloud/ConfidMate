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

function getUsersFromStorage() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function saveUsersToStorage(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function ensureUserInLocalStorage(userEmail) {
  const users = getUsersFromStorage();

  if (!users[userEmail]) {
    users[userEmail] = {
      password: null,
      username: null,
      data: {
        moods: [],
        breathing: {
          totalCycles: 0,
          lastSessionStart: null,
          lastSessionEnd: null
        },
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

    saveUsersToStorage(users);
  }
}

function redirectToHome() {
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 700);
}

function redirectToChooseUsername() {
  setTimeout(() => {
    window.location.href = "choose-username.html";
  }, 700);
}

function handleExistingUserLogin(userEmail) {
  const users = getUsersFromStorage();

  ensureUserInLocalStorage(userEmail);

  if (users[userEmail] && users[userEmail].username) {
    localStorage.setItem("currentUser", users[userEmail].username);
    localStorage.setItem("userEmail", userEmail);

    showMessage("Welcome back 👋");
    redirectToHome();
    return;
  }

  localStorage.setItem("userEmail", userEmail);
  showMessage("Almost done — choose your username first.");
  redirectToChooseUsername();
}

/* =========================
   LOGIN WITH EMAIL / PASSWORD
========================= */

if (loginBtn) {
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

      handleExistingUserLogin(userEmail);

    } catch (error) {
      console.error("LOGIN ERROR:", error.code, error.message);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        showMessage("No account found with these details. Create an account first or check your password.", true);
      } else if (error.code === "auth/invalid-email") {
        showMessage("Please enter a valid email address.", true);
      } else if (error.code === "auth/user-disabled") {
        showMessage("This account has been disabled.", true);
      } else {
        showMessage(error.message, true);
      }
    }
  });
}

/* =========================
   SIGNUP WITH EMAIL / PASSWORD
========================= */

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showMessage("Please enter email and password.", true);
      return;
    }

    if (password.length < 6) {
      showMessage("Password should be at least 6 characters long.", true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email;

      ensureUserInLocalStorage(userEmail);

      // store email only for username selection step
      localStorage.setItem("userEmail", userEmail);

      showMessage("Account created 🎉 Now choose your username.");
      redirectToChooseUsername();

    } catch (error) {
      console.error("SIGNUP ERROR:", error.code, error.message);

      if (error.code === "auth/email-already-in-use") {
        showMessage("This email is already registered. Try logging in instead.", true);
      } else if (error.code === "auth/weak-password") {
        showMessage("Password should be at least 6 characters long.", true);
      } else if (error.code === "auth/invalid-email") {
        showMessage("Please enter a valid email address.", true);
      } else {
        showMessage(error.message, true);
      }
    }
  });
}

/* =========================
   GOOGLE LOGIN / SIGNUP
========================= */

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = user.email;

      const users = getUsersFromStorage();

      ensureUserInLocalStorage(userEmail);

      // Existing user with username → go home
      if (users[userEmail] && users[userEmail].username) {
        localStorage.setItem("currentUser", users[userEmail].username);
        localStorage.setItem("userEmail", userEmail);

        showMessage("Login successful ✅");
        redirectToHome();
        return;
      }

      // New or incomplete user → choose username
      localStorage.setItem("userEmail", userEmail);
      showMessage("Almost done — choose your username.");
      redirectToChooseUsername();

    } catch (error) {
      console.error("GOOGLE LOGIN ERROR:", error.code, error.message);
      showMessage(error.message, true);
    }
  });
}

/* =========================
   ENTER KEY SUPPORT
========================= */

if (passwordInput) {
  passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && loginBtn) {
      loginBtn.click();
    }
  });
}
