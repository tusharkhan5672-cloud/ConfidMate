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
   LIVE STAGE STARTS
========================= */

let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;
let recordedAudioUrl = null;
let recordingStartTime = null;
let activeStream = null;
let lastStageReport = null;
let recognition = null;
let finalTranscript = "";
let interimTranscript = "";
let speechRecognitionStartTime = null;

const fillerWordsList = ["umm", "uh", "like", "basically", "actually", "you know", "sort of", "kind of", "literally"];

document.addEventListener("DOMContentLoaded", function () {
  const startPracticeBtn = document.getElementById("startPracticeBtn");
  const stopPracticeBtn = document.getElementById("stopPracticeBtn");

  if (startPracticeBtn) {
    startPracticeBtn.addEventListener("click", startFullPractice);
  }

  if (stopPracticeBtn) {
    stopPracticeBtn.addEventListener("click", stopFullPractice);
  }
});

function startFullPractice() {
  const startPracticeBtn = document.getElementById("startPracticeBtn");
  const stopPracticeBtn = document.getElementById("stopPracticeBtn");
  const recordStatus = document.getElementById("recordStatus");
  const recordHint = document.getElementById("recordHint");

  if (startPracticeBtn) startPracticeBtn.disabled = true;
  if (stopPracticeBtn) stopPracticeBtn.disabled = false;

  if (recordStatus) recordStatus.textContent = "Listening and recording...";
  if (recordHint) recordHint.textContent = "Speak naturally. We’re capturing your voice, transcript, and breakdown together.";

  startSpeechRecording();
  startSpeechListening();
}

function stopFullPractice() {
  const startPracticeBtn = document.getElementById("startPracticeBtn");
  const stopPracticeBtn = document.getElementById("stopPracticeBtn");
  const recordStatus = document.getElementById("recordStatus");
  const recordHint = document.getElementById("recordHint");

  if (startPracticeBtn) startPracticeBtn.disabled = false;
  if (stopPracticeBtn) stopPracticeBtn.disabled = true;

  stopSpeechRecording();
  stopSpeechListening();

  if (recordStatus) recordStatus.textContent = "Practice complete";
  if (recordHint) recordHint.textContent = "Your recording, transcript, and breakdown are ready below.";
}

async function startSpeechRecording() {
  const recordBtn = document.getElementById("recordBtn");
  const stopRecordBtn = document.getElementById("stopRecordBtn");
  const recordStatus = document.getElementById("recordStatus");
  const recordHint = document.getElementById("recordHint");
  const audioPlayer = document.getElementById("audioPlayer");
  const audioStatus = document.getElementById("audioStatus");

  try {
    activeStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    audioChunks = [];
    recordedAudioBlob = null;

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      recordedAudioUrl = null;
    }

    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.removeAttribute("src");
      audioPlayer.load();
    }

    if (audioStatus) {
      audioStatus.textContent = "Recording in progress...";
    }

    let mimeType = "";
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      mimeType = "audio/webm;codecs=opus";
    } else if (MediaRecorder.isTypeSupported("audio/webm")) {
      mimeType = "audio/webm";
    } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
      mimeType = "audio/mp4";
    }

    mediaRecorder = mimeType
      ? new MediaRecorder(activeStream, { mimeType })
      : new MediaRecorder(activeStream);

    recordingStartTime = Date.now();

    mediaRecorder.ondataavailable = function (event) {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = function () {
      if (!audioChunks.length) {
        if (recordStatus) recordStatus.textContent = "No audio captured";
        if (recordHint) recordHint.textContent = "Try again and allow microphone access.";
        if (audioStatus) audioStatus.textContent = "No recording available.";
        return;
      }

      recordedAudioBlob = new Blob(audioChunks, {
        type: mediaRecorder.mimeType || "audio/webm"
      });

      recordedAudioUrl = URL.createObjectURL(recordedAudioBlob);

      if (audioPlayer) {
        audioPlayer.src = recordedAudioUrl;
        audioPlayer.load();
      }

      if (audioStatus) {
        audioStatus.textContent = "Recording ready. You can play, pause, or move through the timeline.";
      }

      if (recordStatus) recordStatus.textContent = "Recording complete";
      if (recordHint) recordHint.textContent = "Audio recorded. Use live listening for transcript and speech breakdown.";

      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        activeStream = null;
      }
    };

    mediaRecorder.start();



    if (recordStatus) recordStatus.textContent = "Recording...";
    if (recordHint) recordHint.textContent = "Speak naturally. Click stop when you're done.";

    trackPracticeSession();
  } catch (error) {
    console.error("Recording start error:", error);
    if (recordStatus) recordStatus.textContent = "Microphone unavailable";
    if (recordHint) recordHint.textContent = "Please allow microphone access and try again.";
    if (audioStatus) audioStatus.textContent = "Microphone access is required.";
  }
}

function analyzeLiveTranscript() {
  const transcriptEl = document.getElementById("speechTranscript");
  const judgeFeedback = document.getElementById("judgeFeedback");

  const transcript = (finalTranscript || "").trim();
  const durationSeconds = Math.max(
    1,
    Math.round((Date.now() - speechRecognitionStartTime) / 1000)
  );

  if (!transcript) {
    setJudgeMetric("metric-duration", "--");
    setJudgeMetric("metric-words", "--");
    setJudgeMetric("metric-pace", "--");
    setJudgeMetric("metric-fillers", "--");
    setJudgeMetric("score-clarity", "--");
    setJudgeMetric("score-confidence", "--");
    setJudgeMetric("score-pace", "--");
    setJudgeMetric("score-structure", "--");

    if (judgeFeedback) {
      judgeFeedback.textContent = "No speech captured. Try again and speak clearly.";
    }
    return;
  }

  if (transcriptEl) {
    transcriptEl.textContent = transcript;
  }

  const words = transcript.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const wpm = Math.round((wordCount / durationSeconds) * 60);

  let fillerCount = 0;
  const lower = transcript.toLowerCase();

  fillerWordsList.forEach(word => {
    const regex = new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) fillerCount += matches.length;
  });

  let clarity = 6;
  let confidence = 6;
  let paceScore = 6;
  let structure = 6;

  if (wordCount >= 20) clarity += 1;
  if (wordCount >= 35) structure += 1;
  if (wordCount < 10) structure -= 2;

  if (wpm > 150) paceScore -= 1;
  if (wpm >= 90 && wpm <= 140) paceScore += 2;
  if (wpm < 70) paceScore -= 1;

  if (
    lower.includes("i am") ||
    lower.includes("my name is") ||
    lower.includes("i can") ||
    lower.includes("i will")
  ) {
    confidence += 1;
  }

  if (
    lower.includes("maybe") ||
    lower.includes("i think") ||
    lower.includes("not sure")
  ) {
    confidence -= 1;
  }

  clarity -= Math.min(fillerCount, 2);
  confidence -= Math.min(fillerCount, 2);

  clarity = clampScore(clarity);
  confidence = clampScore(confidence);
  paceScore = clampScore(paceScore);
  structure = clampScore(structure);

  setJudgeMetric("metric-duration", `${durationSeconds}s`);
  setJudgeMetric("metric-words", wordCount);
  setJudgeMetric("metric-pace", `${wpm} wpm`);
  setJudgeMetric("metric-fillers", fillerCount);

  setJudgeMetric("score-clarity", `${clarity}/10`);
  setJudgeMetric("score-confidence", `${confidence}/10`);
  setJudgeMetric("score-pace", `${paceScore}/10`);
  setJudgeMetric("score-structure", `${structure}/10`);

  let feedback = "";

  if (wordCount < 12) {
    feedback += "Your response felt short, so the idea did not fully develop. ";
  } else {
    feedback += "You gave enough content to analyze properly. ";
  }

  if (fillerCount > 0) {
    feedback += `You used filler words ${fillerCount} time${fillerCount > 1 ? "s" : ""}. Try pausing instead of filling silence. `;
  }

  if (wpm > 150) {
    feedback += "Your pace felt fast. Slow down slightly so your message sounds stronger. ";
  } else if (wpm < 70) {
    feedback += "Your pace felt slow. Try a steadier flow so your speech sounds more natural. ";
  } else {
    feedback += "Your pace was in a good working range. ";
  }

  if (confidence >= 7) {
    feedback += "Your wording felt fairly direct, which helps you sound confident. ";
  } else {
    feedback += "Try using shorter and more direct lines to sound more confident. ";
  }

  if (structure >= 7) {
    feedback += "Your response had a decent structure, which improves delivery. ";
  } else {
    feedback += "Try organizing your speech as opening, main point, and closing. ";
  }

  feedback += "For the next round, improve just one thing at a time.";

  if (judgeFeedback) {
    judgeFeedback.textContent = feedback;
  }

  const data = getUserData();
  if (!data.practice.judgeReports) {
    data.practice.judgeReports = [];
  }

  const report = {
    durationSeconds,
    wordCount,
    wpm,
    fillerCount,
    clarity,
    confidence,
    pace: paceScore,
    structure,
    transcript,
    feedback,
    time: new Date().toISOString()
  };

  data.practice.judgeReports.push(report);
  saveUserData(data);

  lastStageReport = report;
}

function startSpeechListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const startListeningBtn = document.getElementById("startListeningBtn");
  const stopListeningBtn = document.getElementById("stopListeningBtn");
  const recordStatus = document.getElementById("recordStatus");
  const recordHint = document.getElementById("recordHint");
  const transcriptEl = document.getElementById("speechTranscript");
  const judgeFeedback = document.getElementById("judgeFeedback");

  if (!SpeechRecognition) {
    if (recordStatus) recordStatus.textContent = "Speech recognition not supported";
    if (recordHint) recordHint.textContent = "Use Chrome or a supported browser for live transcript.";
    return;
  }

  finalTranscript = "";
  interimTranscript = "";
  speechRecognitionStartTime = Date.now();

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function () {

    if (recordStatus) recordStatus.textContent = "Listening live...";
    if (recordHint) recordHint.textContent = "Speak naturally. Your transcript is updating in real time.";
    if (transcriptEl) transcriptEl.textContent = "Listening...";
    if (judgeFeedback) judgeFeedback.textContent = "Speech breakdown will appear after you stop listening.";
  };

  recognition.onresult = function (event) {
    interimTranscript = "";
    let latestFinal = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcriptPiece = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        latestFinal += transcriptPiece + " ";
      } else {
        interimTranscript += transcriptPiece;
      }
    }

    finalTranscript += latestFinal;

    if (transcriptEl) {
      const combined = (finalTranscript + interimTranscript).trim();
      transcriptEl.textContent = combined || "Listening...";
    }
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    if (recordStatus) recordStatus.textContent = "Recognition error";
    if (recordHint) recordHint.textContent = `Error: ${event.error}`;
    if (startListeningBtn) startListeningBtn.disabled = false;
    if (stopListeningBtn) stopListeningBtn.disabled = true;
  };

  recognition.onend = function () {

    if (recordStatus) recordStatus.textContent = "Listening stopped";
    if (recordHint) recordHint.textContent = "Transcript captured. Review your speech breakdown below.";

    analyzeLiveTranscript();
  };

  recognition.start();
  trackPracticeSession();
}

function stopSpeechListening() {
  if (recognition) {
    recognition.stop();
  }
}


function stopSpeechRecording() {
  const recordBtn = document.getElementById("recordBtn");
  const stopRecordBtn = document.getElementById("stopRecordBtn");

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }


}

function generateStageJudgeFromTranscript(durationSeconds) {
  const transcriptEl = document.getElementById("speechTranscript");
  const judgeFeedback = document.getElementById("judgeFeedback");
  const typedInput = document.getElementById("speechInput");

  let transcript = "";

  if (typedInput && typedInput.value.trim()) {
    transcript = typedInput.value.trim();
  }

  if (!transcript) {
    transcript = "No transcript captured automatically yet. Type what you said in the speech box for full judging.";
  }

  if (transcriptEl) {
    transcriptEl.textContent = transcript;
  }

  const noTranscriptFallback = transcript === "No transcript captured automatically yet. Type what you said in the speech box for full judging.";
  const words = noTranscriptFallback ? [] : transcript.split(/\s+/);
  const wordCount = words.length;
  const wpm = durationSeconds > 0 && wordCount > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

  let fillerCount = 0;
  const lower = transcript.toLowerCase();

  fillerWordsList.forEach(word => {
    const regex = new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "g");
    const matches = lower.match(regex);
    if (matches) fillerCount += matches.length;
  });

  let clarity = 6;
  let confidence = 6;
  let paceScore = 6;
  let structure = 6;

  if (wordCount >= 20) clarity += 1;
  if (wordCount >= 35) structure += 1;
  if (wordCount < 10 && wordCount > 0) structure -= 2;

  if (wpm > 150) paceScore -= 1;
  if (wpm >= 90 && wpm <= 140) paceScore += 2;
  if (wpm < 70 && wordCount > 0) paceScore -= 1;

  if (
    lower.includes("i am") ||
    lower.includes("my name is") ||
    lower.includes("i can") ||
    lower.includes("i will")
  ) {
    confidence += 1;
  }

  if (
    lower.includes("maybe") ||
    lower.includes("i think") ||
    lower.includes("not sure")
  ) {
    confidence -= 1;
  }

  clarity -= Math.min(fillerCount, 2);
  confidence -= Math.min(fillerCount, 2);

  clarity = clampScore(clarity);
  confidence = clampScore(confidence);
  paceScore = clampScore(paceScore);
  structure = clampScore(structure);

  setJudgeMetric("metric-duration", `${durationSeconds}s`);
  setJudgeMetric("metric-words", wordCount || "--");
  setJudgeMetric("metric-pace", wordCount ? `${wpm} wpm` : "--");
  setJudgeMetric("metric-fillers", wordCount ? fillerCount : "--");

  setJudgeMetric("score-clarity", `${clarity}/10`);
  setJudgeMetric("score-confidence", `${confidence}/10`);
  setJudgeMetric("score-pace", `${paceScore}/10`);
  setJudgeMetric("score-structure", `${structure}/10`);

  let feedback = "";

  if (noTranscriptFallback) {
    feedback = "Recording worked. For full speech judging, type what you said in the speech box so I can analyze clarity, pace, fillers, and structure properly.";
  } else {
    if (wordCount < 12) {
      feedback += "Your response felt a little short, so the idea did not fully develop. ";
    } else {
      feedback += "You gave enough content to work with, which is a strong start. ";
    }

    if (fillerCount > 0) {
      feedback += `You used filler words ${fillerCount} time${fillerCount > 1 ? "s" : ""}. Try pausing instead of filling silence. `;
    }

    if (wpm > 150) {
      feedback += "Your pace felt a bit fast. Slow down slightly so your thoughts land better. ";
    } else if (wpm < 70) {
      feedback += "Your pace felt a little slow. Try a steadier rhythm to sound more natural. ";
    } else {
      feedback += "Your pace was in a pretty workable range. ";
    }

    if (confidence >= 7) {
      feedback += "Your wording felt fairly direct, which helps you sound more confident. ";
    } else {
      feedback += "Try using shorter and more direct sentences to sound more confident. ";
    }

    if (structure >= 7) {
      feedback += "Your response had a clearer structure, which improves delivery. ";
    } else {
      feedback += "Try organizing your answer as opening, point, and closing. ";
    }

    feedback += "For the next round, focus on just one improvement instead of trying to fix everything at once.";
  }

  if (judgeFeedback) {
    judgeFeedback.textContent = feedback;
  }

  const data = getUserData();
  if (!data.practice.judgeReports) {
    data.practice.judgeReports = [];
  }

  const report = {
    durationSeconds,
    wordCount,
    wpm,
    fillerCount,
    clarity,
    confidence,
    pace: paceScore,
    structure,
    transcript,
    feedback,
    time: new Date().toISOString()
  };

  data.practice.judgeReports.push(report);
  saveUserData(data);

  lastStageReport = report;
}

function setJudgeMetric(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function clampScore(value) {
  return Math.max(3, Math.min(10, value));
}

/* =========================
   LIVE STAGE ENDS
========================= */




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

