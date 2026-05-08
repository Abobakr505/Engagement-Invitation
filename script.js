/* STARS */
(function () {
  const bg = document.getElementById("starbg");
  for (let i = 0; i < 100; i++) {
    const d = document.createElement("div");
    d.className = "sdot";
    const sz = Math.random() * 2.5 + 0.5;
    d.style.cssText = `width:${sz}px;height:${sz}px;left:${
      Math.random() * 100
    }%;top:${Math.random() * 100}%;animation-delay:${
      Math.random() * 3
    }s;animation-duration:${2 + Math.random() * 3}s`;
    bg.appendChild(d);
  }
})();

/* RINGS */
(function () {
  const rod = document.getElementById("rod");
  for (let i = 0; i < 22; i++) {
    const r = document.createElement("div");
    r.className = "ring";
    r.style.left = i * 4.7 + 0.5 + "%";
    rod.appendChild(r);
  }
})();

/* CURTAINS */
let opened = false;
function openCurtains() {
  if (opened) return;
  opened = true;
  const btn = document.getElementById("openBtn");
  btn.style.transition = "opacity .5s";
  btn.style.opacity = "0";
  btn.style.pointerEvents = "none";
  setTimeout(() => (btn.style.display = "none"), 550);
  document.getElementById("cglow").style.opacity = "0";
  document.getElementById("cL").classList.add("open");
  document.getElementById("cR").classList.add("open");
  setTimeout(() => {
    document.getElementById("s1c").classList.add("show");
    spawnParticles(28);
  }, 2000);
}

/* NAVIGATION */
const SECS = ["s1", "s2", "s3", "s4", "s5"];
const dots = document.querySelectorAll(".nd");
function goTo(i) {
  document.getElementById(SECS[i]).scrollIntoView({ behavior: "smooth" });
}
window.addEventListener(
  "scroll",
  () => {
    const sy = window.scrollY,
      wh = window.innerHeight;
    SECS.forEach((id, i) => {
      const el = document.getElementById(id),
        t = el.offsetTop;
      if (sy >= t - wh / 2 && sy < t + el.offsetHeight - wh / 2) {
        dots.forEach((d) => d.classList.remove("active"));
        dots[i].classList.add("active");
      }
    });
  },
  { passive: true }
);

/* SCRATCH BALLS */
const done = [false, false, false];

function drawGold(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  // Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
  ctx.clip();
  // Gold gradient
  const g = ctx.createRadialGradient(w * 0.4, h * 0.35, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "#f5e090");
  g.addColorStop(0.45, "#c9972b");
  g.addColorStop(0.8, "#8a6010");
  g.addColorStop(1, "#5a3e0a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Shine
  const sh = ctx.createRadialGradient(
    w * 0.35,
    h * 0.28,
    0,
    w * 0.35,
    h * 0.28,
    w * 0.32
  );
  sh.addColorStop(0, "rgba(255,255,220,.65)");
  sh.addColorStop(1, "rgba(255,255,220,0)");
  ctx.fillStyle = sh;
  ctx.fillRect(0, 0, w, h);
  // Text
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(255,255,255,.6)";
  ctx.font = "bold 13px Tajawal,Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Wipe Here 🪄", w / 2, h / 2);
  ctx.restore();
}

function initScratch(wrapId, canvasId, idx) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const w = canvas.width,
    h = canvas.height;
  drawGold(ctx, w, h);

  let painting = false;
  let scratchCount = 0;

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const sx = w / r.width,
      sy2 = h / r.height;
    if (e.touches)
      return {
        x: (e.touches[0].clientX - r.left) * sx,
        y: (e.touches[0].clientY - r.top) * sy2,
      };
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy2 };
  }

  function erase(x, y) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
    scratchCount++;
    if (scratchCount % 8 === 0) checkPct(canvasId, idx);
  }

  canvas.addEventListener("mousedown", (e) => {
    painting = true;
    const p = pos(e);
    erase(p.x, p.y);
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!painting) return;
    const p = pos(e);
    erase(p.x, p.y);
  });
  canvas.addEventListener("mouseup", () => (painting = false));
  canvas.addEventListener("mouseleave", () => (painting = false));
  canvas.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      painting = true;
      const p = pos(e);
      erase(p.x, p.y);
    },
    { passive: false }
  );
  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (!painting) return;
      const p = pos(e);
      erase(p.x, p.y);
    },
    { passive: false }
  );
  canvas.addEventListener("touchend", () => (painting = false));
}

function checkPct(canvasId, idx) {
  if (done[idx]) return;
  const c = document.getElementById(canvasId);
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let t = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 30) t++;
  if (t / (c.width * c.height) > 0.55) {
    done[idx] = true;
    c.style.transition = "opacity .6s";
    c.style.opacity = "0";
    setTimeout(() => (c.style.display = "none"), 650);
    spawnParticles(8);
    if (done.every(Boolean)) {
      document.getElementById("s2hint").textContent =
        "🎉 The date has been revealed !";
      setTimeout(
        () => document.getElementById("dateCard").classList.add("show"),
        600
      );
      spawnParticles(25);
    }
  }
}

initScratch("sw1", "sc1", 0);
initScratch("sw2", "sc2", 1);
initScratch("sw3", "sc3", 2);

/* COUNTDOWN */
const target = new Date("2026-06-01T23:59:59");
function tick() {
  const diff = target - new Date();
  if (diff <= 0) {
    ["cdD", "cdH", "cdM", "cdS"].forEach(
      (id) => (document.getElementById(id).textContent = "00")
    );
    return;
  }
  const f = (n) => String(n).padStart(2, "0");
  document.getElementById("cdD").textContent = f(Math.floor(diff / 864e5));
  document.getElementById("cdH").textContent = f(
    Math.floor((diff % 864e5) / 36e5)
  );
  document.getElementById("cdM").textContent = f(
    Math.floor((diff % 36e5) / 6e4)
  );
  document.getElementById("cdS").textContent = f(
    Math.floor((diff % 6e4) / 1e3)
  );
}
tick();
setInterval(tick, 1000);

const wishes = [];

// ضع بيانات البوت هنا
const BOT_TOKEN = "8534485589:AAE7zKxdKrQNw6dPMicYgvgXrBMpU_MNOkk";
const CHAT_ID = "931408123";

async function sendWish() {
  const name = document.getElementById("wName").value.trim();
  const msg = document.getElementById("wMsg").value.trim();

  if (!name || !msg) {
    alert("Please write your name and message.🌹");
    return;
  }

  wishes.unshift({ name, msg });

  // رسالة التليجرام
  const telegramMessage = `
💌 تهنئة جديدة للعروسين

👤 الاسم: ${name}

📝 الرسالة:
${msg}
  `;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: telegramMessage,
      }),
    });

    document.getElementById("wishForm").style.display = "none";
    document.getElementById("thanksBox").classList.add("show");

    spawnParticles(20);

    setTimeout(renderWishes, 900);

  } catch (error) {
    console.error(error);
    alert("An error occurred while sending the greeting.");
  }
}

function renderWishes() {
  document.getElementById("wishesList").innerHTML = wishes
    .map(
      (w) => `
      <div class="wish-card">
        <div class="wc-name">💌 ${w.name}</div>
        <div class="wc-txt">${w.msg}</div>
      </div>
    `
    )
    .join("");
}
/* PARTICLES */
function spawnParticles(n) {
  const em = ["🌹", "💍", "✨", "🌸", "💛", "⭐", "🤍", "🌼", "❤️", "💐"];
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const p = document.createElement("div");
      p.className = "petal";
      p.textContent = em[Math.floor(Math.random() * em.length)];
      p.style.cssText = `left:${Math.random() * 100}vw;font-size:${
        14 + Math.random() * 16
      }px;animation-duration:${3 + Math.random() * 4}s;animation-delay:${
        Math.random() * 0.5
      }s`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 8000);
    }, i * 160);
  }
}
