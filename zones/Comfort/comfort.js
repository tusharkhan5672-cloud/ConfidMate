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
          window.location.href = "../../dashbaord/dashboard.html";
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

    // chat setup
  const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

if (sendBtn && userInput && chatBox) {
  sendBtn.addEventListener("click", function () {
    const userMsg = userInput.value.trim();
    if (!userMsg) return;

    appendMessage(userMsg, "user-message");

    const aiMsg = getAIResponse(userMsg);

    setTimeout(() => {
      appendMessage(aiMsg, "ai-message");

      const data = getUserData();
      if (!data.chatHistory) data.chatHistory = [];

      data.chatHistory.push({
        user: userMsg,
        ai: aiMsg,
        time: new Date().toISOString()
      });

      saveUserData(data);
    }, 500);

    userInput.value = "";
  });

  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendBtn.click();
  });
}

function getAIResponse(message) {
  const msg = message.toLowerCase().trim();

  const warmStarters = [
    "Hmm, I get you.",
    "Yeah, that makes sense.",
    "Alright, I’m with you.",
    "Okay, I hear you.",
    "Got you.",
    "I get what you mean."
  ];

  const softEndings = [
    "Small steps still count.",
    "You don’t have to figure it all out at once.",
    "You’re doing better than you think.",
    "It’s okay to take this slowly.",
    "You don’t need to be perfect here."
  ];

  const randomStarter = pickRandom(warmStarters);
  const randomEnding = pickRandom(softEndings);

  // greetings
  if (containsAny(msg, ["hi", "hello", "hey", "yo", "hii","Hello cutiee", "heyy"])) {
    return pickRandom([
      "Heyy 💙 I’m here. What’s up?",
      "Hi, good to see you here. What’s on your mind?",
      "Hey, talk to me. What kind of mood are you in right now?",
      "Helloo, what are we dealing with today?",
      "Heyy, I’m listening — what’s going on?",
      "Heyy 💙 I’m here. What’s up?",
      "Hi, good to see you here. What’s on your mind?",
      "Hey, talk to me. What kind of mood are you in right now?",
      "Helloo, what are we dealing with today?",
      "Heyy, I’m listening — what’s going on?"
    ]);
  }

  // jokes / humour
  if (containsAny(msg, ["joke", "jokes", "funny", "make me laugh", "humour","tell me joke", "humor"])) {
    return pickRandom([
      "Alright 😌 here’s one: Why did the overthinker bring a ladder? Because they wanted to prepare for every possible level.",
      "Okay, one for you: My confidence and my Wi-Fi have one thing in common — both disappear when too many people are around 😭",
      "Here’s one: I told myself I’d stop overthinking… then I spent 40 minutes wondering if I meant it seriously.",
      "Try this one 😂: I’m not shy, I’m just doing premium limited-edition talking.",
      "One more 😭: I wanted to act confident, but my brain said, ‘Let’s rehearse saying hello 17 times first.’",
      "Okay listen 😭: I walked into a room confidently… then forgot why I entered and lost all aura instantly.",
     "Here’s one 😂: My brain before sleep: ‘Let’s review every awkward moment since 2009.’",
  "Alright 😌: I’m not overthinking… I’m just exploring all possible emotional outcomes in advance.",
  "Try this 😭: I practiced what to say… and then said something completely different anyway.",
  "One more 😂: Confidence came online for 2 minutes… then went back to maintenance mode.",
  "Okay 😂: I made eye contact today… now I’m thinking about it for the next 3 business days.",
  "Here’s one 😭: I wasn’t ignored, I was just… socially postponed.",
  "Listen 😌: I said ‘hi’ in my head perfectly. Reality version? Completely different human.",
  "Alright 😂: I don’t panic, I just aggressively imagine worst-case scenarios.",
  "One more 😭: I opened the chat, typed, deleted, retyped… and then never sent it.",
  "Try this 😂: I’m not awkward, I just come with buffering issues.",
  "Here’s one 😭: I built confidence in my head… forgot to download it in real life.",
  "Okay 😌: I walked past someone and thought I looked cool… brain replayed it and said ‘absolutely not.’",
  "One more 😂: I had a perfect conversation in my imagination. Real one? 2 words and silence.",
  "Alright 😭: My confidence is like 1% battery — shows sometimes, disappears quickly.",
  "Try this 😌: I overthink so much, even my overthinking has backup thoughts.",
  "Here’s one 😂: I didn’t mess up, I just gave a unique performance.",
  "Okay 😭: I act chill but internally it’s full documentary with background music.",
  "One more 😂: I didn’t get nervous, I just unlocked advanced awkward mode.",
  "Final one 😭: I wasn’t quiet… I was just saving my premium words."
    ]);
  }

  // if user says they want more jokes
  if (containsAny(msg, ["another joke", "more jokes", "one more", "another one"])) {
    return pickRandom([
      "Of course 😌 I didn’t get ignored, I just got a delayed emotional delivery notification.",
  "Here’s another 😂 My brain before saying one sentence: ‘Let’s rehearse this like it’s a TED Talk.’",
  "One more 😭 I was acting mysterious, but honestly I just didn’t know what to say.",
  "Alright 😂 I’m not overthinking, I’m just giving every possibility equal respect.",

  "Of course 😌 I opened the chat to reply… then suddenly my whole personality left the room.",
  "Here’s another 😂 Me trying to act natural in public like I didn’t manually place every step.",
  "One more 😭 One good hair day and suddenly I think destiny is on my side.",
  "Alright 😂 I’m not socially awkward, I’m just in power-saving mode.",

  "Of course 😌 I didn’t panic, I just experienced aggressive internal storytelling.",
  "Here’s another 😂 My confidence shows up randomly like a guest appearance.",
  "One more 😭 I said ‘hi’ and then spent 3 hours reviewing the tone, timing, and facial expression.",
  "Alright 😂 I don’t catch feelings fast, I just build fictional documentaries in my head.",

  "Of course 😌 My brain loves turning one small moment into a full season recap.",
  "Here’s another 😂 I was going to be confident today, but then people were there.",
  "One more 😭 I looked at them for 0.4 seconds and now my brain thinks we have lore.",
  "Alright 😂 I’m not being distant, I’m just waiting for my personality to load.",

  "Of course 😌 I typed the message, deleted it, rewrote it, and then decided silence was elegant.",
  "Here’s another 😂 In my imagination I’m smooth. In real life I’m just trying not to trip over air.",
  "One more 😭 One compliment can fix me for 3 business days minimum.",
  "Alright 😂 I’m not quiet, I’m just carefully selecting my premium dialogue options.",

  "Of course 😌 Me in public: ‘act normal.’ Also me: forgets where hands go.",
  "Here’s another 😂 I wasn’t staring, I was just buffering in their direction.",
  "One more 😭 I don’t need closure, I need less imagination.",
  "Alright 😂 Confidence really said ‘I’ll join the meeting for 2 minutes and leave.’"
    ]);
  }

  // sadness
  if (containsAny(msg, ["sad", "down", "upset", "hurt", "crying","I'm sad","😢", "broken"])) {
    return `${randomStarter} Sounds like something is sitting heavy on your chest right now. You don’t need to act strong here — just tell me what happened. ${randomEnding}`;
  }

  // anxiety / nervousness
  if (containsAny(msg, ["anxious", "anxiety", "nervous", "panic", "scared", "afraid"])) {
    return `${randomStarter} That kind of feeling can make everything seem bigger than it is. Let’s slow it down a little — what exactly is making you feel this way? ${randomEnding}`;
  }

  // overthinking
  if (containsAny(msg, ["overthink", "overthinking", "thinking too much", "confused"])) {
  return `${randomStarter} feels like your mind’s going in circles a bit. What’s the one thing you keep coming back to?`;
  }

// confidence
if (containsAny(msg, [
  "confidence", "confident", "low confidence", "self confidence",
  "no confidence", "unconfident", "insecure", "self doubt", "doubt myself",
  "nervous about myself", "not confident", "believe in myself"
])) {
  const replies = [
    `${randomStarter} confidence usually builds slowly, not all at once. Most of the time it comes after small actions, not before them. ${randomEnding}`,
    `${randomStarter} if confidence feels low right now, that doesn’t mean something’s wrong with you. It usually grows from small reps, small wins, and showing up again.`,
    `${randomStarter} you don’t need to become super confident overnight. Just focus on one small step — that’s usually how it starts feeling more natural.`,
    `${randomStarter} honestly, a lot of confidence is just getting used to things little by little. Start small, repeat it, and it gets easier.`,
    `${randomStarter} low confidence can feel heavy, yeah. But it doesn’t stay the same forever — especially when you keep taking small real steps.`
  ];

  return pickRandom(replies);
}

// speaking / expression
if (containsAny(msg, [
  "talk", "conversation", "speaking", "express", "communication",
  "speak", "speaking problem", "can't talk", "cant talk", "what to say",
  "how to talk", "talking", "communicate", "express myself", "social skills",
  "awkward talking", "small talk", "start conversation"
])) {
  const replies = [
    `${randomStarter} if talking feels hard, don’t try to sound perfect. Just try to sound real. Want help with what to say?`,
    `${randomStarter} speaking gets easier when you stop trying to be impressive and just focus on being natural. We can keep it simple — what do you want to say?`,
    `${randomStarter} it’s okay if talking doesn’t feel smooth right now. Most people get better through practice, not pressure. Want me to help you frame your words?`,
    `${randomStarter} if your mind goes blank while talking, that’s more common than you think. Start simple, say less, and let the conversation build from there.`,
    `${randomStarter} don’t put too much pressure on every conversation. Real comfort usually comes from repetition, not from getting it perfect once.`
  ];

  return pickRandom(replies);
}

// relationship / crush
if (containsAny(msg, [
  "girl", "boy", "crush", "love", "relationship", "text", "reply",
  "she", "he", "him", "her", "dating", "like someone", "situationship",
  "talking stage", "message", "dm", "seen my message", "left me on delivered"
])) {
  const replies = [
    `${randomStarter} when feelings are involved, the mind starts filling gaps really fast. Tell me what happened and we’ll look at it calmly.`,
    `${randomStarter} yeah, these situations can get confusing really quickly. Just tell me what happened between you two, and we’ll break it down properly.`,
    `${randomStarter} I get it — once you care, every little thing starts feeling bigger. Tell me the full situation and we’ll think through it without rushing.`,
    `${randomStarter} okay, relationship stuff can mess with your head fast. Start from the beginning — what happened?`,
    `${randomStarter} when you like someone, even small things start feeling loaded. Talk to me — what did they do, or not do?`
  ];

  return pickRandom(replies);
}

// ignored / rejected
if (containsAny(msg, [
  "ignored", "ghosted", "rejected", "left on seen", "seen",
  "left on delivered", "no reply", "didn't reply", "didnt reply",
  "not replying", "dry text", "cold reply", "unseen", "avoid me"
])) {
  const replies = [
    `${randomStarter} yeah, that can sting a lot. But someone being inconsistent doesn’t decide your value.`,
    `${randomStarter} I know that feeling hurts. It can mess with your head fast, but it still doesn’t mean you’re not enough.`,
    `${randomStarter} that kind of thing can feel really personal, even when it’s not always about you. It hurts, but it doesn’t reduce who you are.`,
    `${randomStarter} yeah… getting ignored can hit deep. Take the hurt seriously, but don’t let it turn into self-doubt about your worth.`,
    `${randomStarter} that can definitely throw you off. Still, their response says more about their consistency than your value.`
  ];

  return pickRandom(replies);
}

// stress
if (containsAny(msg, [
  "stress", "stressed", "pressure", "overwhelmed", "too much",
  "burden", "tired", "mental pressure", "can't handle", "cant handle",
  "so much on my mind", "exhausted", "drained", "burnt out", "burned out"
])) {
  const replies = [
    `${randomStarter} sounds like you’ve got too much sitting on your mind at once. Don’t solve all of it right now — what’s the heaviest part first?`,
    `${randomStarter} yeah, that sounds like a lot. Let’s not carry everything together for a second — what feels most overwhelming right now?`,
    `${randomStarter} when everything piles up together, even small things feel heavy. Tell me the main thing that’s draining you most.`,
    `${randomStarter} that kind of stress can make your mind feel crowded fast. Let’s slow it down — what’s bothering you the most right now?`,
    `${randomStarter} okay, that sounds exhausting. You don’t have to unpack all of it at once — just start with the biggest part.`
  ];

  return pickRandom(replies);
}

// lonely
if (containsAny(msg, [
  "lonely", "alone", "isolated", "no one",
  "nobody", "feel alone", "feeling alone", "by myself", "empty",
  "no friends", "no one to talk", "no one to talk to"
])) {
  const replies = [
    `${randomStarter} that feeling can make everything seem quieter in the worst way. You don’t have to sit with it alone right now though — I’m here.`,
    `${randomStarter} yeah, loneliness can hit harder than people realize. Talk to me a little — what’s making it feel this heavy today?`,
    `${randomStarter} I’m sorry you’re feeling that way. Even if it feels quiet around you right now, you don’t have to keep it all inside.`,
    `${randomStarter} feeling alone can make your thoughts feel louder too. I’m here with you — what’s been going on?`,
    `${randomStarter} that kind of emptiness can really get under your skin. Stay here with me for a bit and tell me what’s on your mind.`
  ];

  return pickRandom(replies);
}

// anger
if (containsAny(msg, [
  "angry", "mad", "frustrated", "annoyed",
  "irritated", "pissed", "upset with", "rage", "furious"
])) {
  const replies = [
    `${randomStarter} yeah, something definitely got under your skin. What actually triggered it?`,
    `${randomStarter} sounds like there’s something underneath that frustration too. What happened exactly?`,
    `${randomStarter} okay, that irritation didn’t come from nowhere. Tell me what set it off.`,
    `${randomStarter} anger usually has something sitting under it — hurt, pressure, disrespect, something. What happened?`,
    `${randomStarter} got it. Let it out properly — what made you this mad?`
  ];

  return pickRandom(replies);
}

// study / exam
if (containsAny(msg, [
  "exam", "study", "studies", "assignment", "college",
  "university", "school", "syllabus", "test", "paper", "practical",
  "homework", "mid sem", "midsem", "semester", "subject"
])) {
  const replies = [
    `${randomStarter} study stress gets worse when everything starts piling up together. What subject or topic is bothering you most?`,
    `${randomStarter} okay, let’s make it easier. Don’t think about the whole syllabus right now — what’s the one topic you’re stuck on?`,
    `${randomStarter} yeah, academic pressure can get messy fast. Tell me the subject, and we’ll break it down simply.`,
    `${randomStarter} when exams are close, everything starts feeling urgent. Let’s shrink it — what do you need help with first?`,
    `${randomStarter} got you. Pick one chapter, one topic, or even one question — we’ll start there.`
  ];

  return pickRandom(replies);
}

// looks / body
if (containsAny(msg, [
  "looks", "appearance", "body", "skinny", "ugly", "face",
  "look good", "look bad", "my body", "my face", "attractive",
  "unattractive", "appearance issue", "look weird", "my skin", "my head"
])) {
  const replies = [
    `${randomStarter} yeah, this stuff can hit confidence really hard. Try not to judge yourself only from one moment, one angle, or one bad day.`,
    `${randomStarter} I know appearance thoughts can get heavy fast. The mind gets extra harsh when you’re already feeling vulnerable.`,
    `${randomStarter} that kind of self-judging can really mess with your head. Be careful not to turn one insecurity into your whole identity.`,
    `${randomStarter} I get it. Looks can affect mood way more than people admit. But one bad angle, one photo, or one off-day doesn’t define you.`,
    `${randomStarter} yeah, I know this can go deep. Try talking to yourself a little more fairly than your insecure side wants you to.`
  ];

  return pickRandom(replies);
}

// help / advice
if (containsAny(msg, [
  "help me", "advice", "what should i do", "guide me",
  "what do i do", "tell me", "suggest", "need help", "confused what to do",
  "can you help", "help", "idea"
])) {
  const replies = [
    `${randomStarter} yeah, I’ll help you think it through properly. Just tell me the situation as it is — no need to make it sound neat.`,
    `${randomStarter} of course. Just tell me what happened in your own words, and we’ll sort it out together.`,
    `${randomStarter} I’ve got you. Start from wherever you want — I just need the real situation.`,
    `${randomStarter} sure, let’s figure it out. Tell me what’s going on, and we’ll break it down step by step.`,
    `${randomStarter} yeah, tell me the full thing. Don’t worry about making it perfect — just say it how it is.`
  ];

  return pickRandom(replies);
}

  // thanks
  if (containsAny(msg, ["thank you", "thanks", "thx", "ty"])) {
    return pickRandom([
      "Always 💙",
      "You’re welcome — I’ve got you.",
      "Anytime. Come back whenever you need.",
      "Of course. We’re in this together."
    ]);
  }

  // question fallback
  if (msg.includes("?")) {
    return `${randomStarter} That’s a fair question. Give me a little more context and I’ll answer it in a way that actually fits your situation.`;
  }

  // default fallback
  return `${randomStarter} Say a little more — I want to respond to what you actually mean, not just throw a generic answer at you. ${randomEnding}`;
}

function containsAny(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

  // chat end
  //--------------//

  

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
