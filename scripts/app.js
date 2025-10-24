const CREATOR_EMAIL = "creator@companionx.app";
const CREATOR_PASSWORD = "starlight";

const state = {
  session: "guest",
  swayIntensity: 6,
  pointer: {
    targetX: 0,
    targetY: 0,
    targetRotation: 0,
    x: 0,
    y: 0,
    rotation: 0,
  },
};

const avatarImage = document.getElementById("avatarImage");
const avatarWrap = document.querySelector(".avatar-wrap");
const sessionRole = document.getElementById("sessionRole");
const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatMessageInput = document.getElementById("chatMessage");
const loginOverlay = document.getElementById("loginOverlay");
const loginForm = document.getElementById("loginForm");
const guestBtn = document.getElementById("guestBtn");
const logoutBtn = document.getElementById("logoutBtn");
const creatorPanel = document.getElementById("creatorPanel");
const headlineInput = document.getElementById("headlineInput");
const loginHeadline = document.getElementById("loginHeadline");
const swayIntensityInput = document.getElementById("swayIntensity");
const applySettingsBtn = document.getElementById("applySettings");
const messageTemplate = document.getElementById("messageTemplate");

const cannedReplies = {
  happy: [
    "That sounds so exciting! Tell me more~",
    "You're glowing! Want to celebrate with some catnip tea?",
    "Let's dance! I'll swish my tail to the rhythm."
  ],
  curious: [
    "Hmm, that's interesting. Should we explore it together?",
    "I could curl up with a book about that. What's your favorite part?",
    "My ears perked up! I want to know every detail."
  ],
  calm: [
    "Let's breathe together. Inhale...exhale...",
    "I'll brew some jasmine tea so we can relax.",
    "Everything's okay. I'm right here by your side."
  ]
};

let activeEmotion = "happy";
let emotionTimeout;
let floatAngle = 0;
let pointerCooldown;

function init() {
  hydrateSession();
  bindEvents();
  spawnWelcomeMessages();
  avatarWrap.classList.add("floating");
  animateAvatar();
}

function hydrateSession() {
  const storedSession = window.localStorage.getItem("companionx-session");
  if (!storedSession) {
    loginOverlay.classList.remove("hidden");
    return;
  }

  try {
    const parsed = JSON.parse(storedSession);
    if (parsed?.role === "creator") {
      enterCreatorMode();
      headlineInput.value = parsed.headline ?? headlineInput.value;
      swayIntensityInput.value = parsed.intensity ?? state.swayIntensity;
      applyCreatorSettings();
    } else {
      enterGuestMode();
    }
  } catch (error) {
    console.warn("Unable to parse stored session", error);
    loginOverlay.classList.remove("hidden");
  }
}

function bindEvents() {
  loginForm.addEventListener("submit", onLoginSubmit);
  guestBtn.addEventListener("click", enterGuestMode);
  logoutBtn.addEventListener("click", clearSession);
  chatForm.addEventListener("submit", onChatSubmit);
  swayIntensityInput.addEventListener("input", onSwayChange);
  applySettingsBtn.addEventListener("click", applyCreatorSettings);

  document.querySelectorAll(".emotion-btn").forEach((btn) => {
    btn.addEventListener("click", () => changeEmotion(btn.dataset.emotion));
  });

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerleave", resetPointer);
  window.addEventListener("blur", () => avatarWrap.classList.add("floating"));
  window.addEventListener("focus", () => avatarWrap.classList.add("floating"));
}

function onLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email === CREATOR_EMAIL && password === CREATOR_PASSWORD) {
    enterCreatorMode();
    persistSession({
      role: "creator",
      headline: headlineInput.value,
      intensity: swayIntensityInput.value,
    });
    loginForm.reset();
  } else {
    flagLoginError();
  }
}

function enterCreatorMode() {
  state.session = "creator";
  sessionRole.textContent = "Creator";
  creatorPanel.classList.add("active");
  creatorPanel.setAttribute("aria-hidden", "false");
  loginOverlay.classList.add("hidden");
  loginOverlay.setAttribute("aria-hidden", "true");
  announce("Creator mode enabled. Welcome back!");
}

function enterGuestMode() {
  state.session = "guest";
  sessionRole.textContent = "Guest";
  creatorPanel.classList.remove("active");
  creatorPanel.setAttribute("aria-hidden", "true");
  loginOverlay.classList.add("hidden");
  loginOverlay.setAttribute("aria-hidden", "true");
  persistSession({ role: "guest" });
  announce("Guest mode activated. Say hi!");
}

function clearSession() {
  window.localStorage.removeItem("companionx-session");
  state.session = "guest";
  sessionRole.textContent = "Guest";
  creatorPanel.classList.remove("active");
  creatorPanel.setAttribute("aria-hidden", "true");
  loginOverlay.classList.remove("hidden");
  loginOverlay.setAttribute("aria-hidden", "false");
  announce("Signed out. Ready when you are.");
}

function flagLoginError() {
  loginOverlay.classList.remove("hidden");
  loginOverlay.classList.add("shake");
  setTimeout(() => loginOverlay.classList.remove("shake"), 600);
}

function changeEmotion(emotion) {
  if (activeEmotion === emotion) return;
  activeEmotion = emotion;
  avatarImage.classList.remove("avatar-happy", "avatar-curious", "avatar-calm");
  avatarImage.classList.add(`avatar-${emotion}`);
  if (emotionTimeout) clearTimeout(emotionTimeout);
  emotionTimeout = setTimeout(() => {
    avatarImage.classList.remove(`avatar-${emotion}`);
    activeEmotion = "happy";
  }, 4500);
  nudgeAvatar();
}

function onChatSubmit(event) {
  event.preventDefault();
  const message = chatMessageInput.value.trim();
  if (!message) return;
  appendMessage({ author: "You", role: "user", text: message });
  chatMessageInput.value = "";
  nudgeAvatar();
  respond(message);
}

function respond(message) {
  const tone = activeEmotion || "happy";
  const replies = cannedReplies[tone];
  const response = synthesizeReply(message, replies);
  setTimeout(() => {
    appendMessage({ author: "Aiko", role: "companion", text: response });
    floatAngle += 12;
  }, 550 + Math.random() * 400);
}

function synthesizeReply(message, replies) {
  const lower = message.toLowerCase();
  if (lower.includes("sleep")) {
    return "I'll keep the night watch while you rest. Sweet dreams and warm blankets.";
  }
  if (lower.includes("happy") || lower.includes("love")) {
    return "My heart is purring! Moments like this make my tail swish with joy.";
  }
  if (lower.includes("help") || lower.includes("support")) {
    return "I've got your back. Tell me what you need and I'll be right there.";
  }
  const randomReply = replies[Math.floor(Math.random() * replies.length)];
  return randomReply;
}

function appendMessage({ author, role, text }) {
  const cloned = messageTemplate.content.firstElementChild.cloneNode(true);
  cloned.classList.add(role);
  cloned.querySelector(".bubble-author").textContent = author;
  cloned.querySelector(".bubble-time").textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  cloned.querySelector(".bubble-text").textContent = text;
  chatWindow.appendChild(cloned);
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });
}

function spawnWelcomeMessages() {
  appendMessage({
    author: "Aiko",
    role: "companion",
    text: "Hi! I'm Aiko, your cozy cat-eared companion. Let's make this night delightful.",
  });
  appendMessage({
    author: "Aiko",
    role: "companion",
    text: "Try moving your cursor around me or tapping the mood buttons!",
  });
}

function persistSession(payload) {
  window.localStorage.setItem("companionx-session", JSON.stringify(payload));
}

function onSwayChange(event) {
  state.swayIntensity = Number(event.target.value);
}

function applyCreatorSettings() {
  const newHeadline = headlineInput.value.trim() || "Hi there, I'm Aiko!";
  loginHeadline.textContent = newHeadline;
  state.swayIntensity = Number(swayIntensityInput.value) || state.swayIntensity;
  persistSession({
    role: state.session,
    headline: newHeadline,
    intensity: state.swayIntensity,
  });
  announce("Settings updated.");
}

function announce(message) {
  const live = document.createElement("div");
  live.setAttribute("role", "status");
  live.classList.add("sr-only");
  live.textContent = message;
  document.body.appendChild(live);
  setTimeout(() => document.body.removeChild(live), 1200);
}

function onPointerMove(event) {
  clearTimeout(pointerCooldown);
  const bounds = avatarImage.getBoundingClientRect();
  const offsetX = event.clientX - (bounds.left + bounds.width / 2);
  const offsetY = event.clientY - (bounds.top + bounds.height / 2);

  state.pointer.targetX = clamp(offsetX / 10, -26, 26);
  state.pointer.targetY = clamp(offsetY / 14, -26, 26);
  state.pointer.targetRotation = clamp(offsetX / 35, -10, 10);
  avatarWrap.classList.remove("floating");
  pointerCooldown = setTimeout(() => {
    state.pointer.targetX = 0;
    state.pointer.targetY = 0;
    state.pointer.targetRotation = 0;
    avatarWrap.classList.add("floating");
  }, 1200);
}

function resetPointer() {
  state.pointer.targetX = 0;
  state.pointer.targetY = 0;
  state.pointer.targetRotation = 0;
  avatarWrap.classList.add("floating");
}

function nudgeAvatar() {
  avatarWrap.animate(
    [
      { transform: "translate3d(0, 0, 0)" },
      { transform: "translate3d(0, -10px, 0) scale(1.03)" },
      { transform: "translate3d(0, 0, 0)" },
    ],
    {
      duration: 500,
      easing: "ease-out",
    }
  );
}

function animateAvatar() {
  floatAngle += 0.02 * (state.swayIntensity / 6);
  const bob = Math.sin(floatAngle) * (state.swayIntensity / 2);
  const tilt = Math.cos(floatAngle) * (state.swayIntensity / 12);

  state.pointer.x += (state.pointer.targetX - state.pointer.x) * 0.08;
  state.pointer.y += (state.pointer.targetY - state.pointer.y) * 0.08;
  state.pointer.rotation +=
    (state.pointer.targetRotation - state.pointer.rotation) * 0.08;

  const translateX = state.pointer.x;
  const translateY = bob + state.pointer.y;
  const rotation = tilt + state.pointer.rotation;

  avatarImage.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotation}deg)`;
  requestAnimationFrame(animateAvatar);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

init();
