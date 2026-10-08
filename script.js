/* =========================================================
   Invitación · Cumpleaños del Servicio C
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURACIÓN — todo lo editable está aquí
   --------------------------------------------------------- */

// Fecha del contador: new Date(año, mes, día, hora, minutos)
// OJO: los meses van de 0 a 11 → diciembre = 11.
// Cuando se confirme la hora, cámbiala aquí (ej. 18, 30 para las 6:30 p. m.).
const fechaEvento = new Date(2026, 11, 17, 0, 0);

// WhatsApp: código de país + número, sin "+", espacios ni guiones.
const whatsappNumber = "51999999999";
const whatsappMessage = "Hola, confirmo mi asistencia a la celebración del Servicio C del 17 de diciembre.";

// Enlace de Google Maps. Déjalo vacío ("") mientras el lugar esté por confirmar.
const ubicacionUrl = "";

// Homenajeadas por mes. Mientras "personas" esté vacío se muestra el texto "Próximamente…".
// Para agregar nombres:
//   personas: [
//     { nombre: "María López", fecha: "12 de octubre" },
//     { nombre: "Ana Torres",  fecha: "25 de octubre" },
//   ]
const homenajeadas = [
  {
    mes: "Octubre",
    personas: [
      { nombre: "Kiara Melissa Gutierrez Guardia", fecha: "1 de octubre" },
      { nombre: "Karine Toralva Camayo", fecha: "2 de octubre" },
      { nombre: "Lily Amparo Orellano Fernandez", fecha: "26 de octubre" },
    ],
  },
  { mes: "Noviembre", personas: [] },
  {
    mes: "Diciembre",
    personas: [
      { nombre: "Catherine Beatriz Huanacune Feliciano", fecha: "5 de diciembre" },
      { nombre: "Rosa Cleofe Lescano Guerra", fecha: "19 de diciembre" },
    ],
  },
];

/* --------------------------------------------------------- */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel) => document.querySelector(sel);
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- Secciones que aparecen al hacer scroll ---------- */
function iniciarApariciones() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ---------- Contador regresivo ---------- */
function iniciarContador() {
  const grid = $("#countdown");
  const done = $("#countdown-done");
  const nums = {};
  grid.querySelectorAll("[data-unit]").forEach((el) => (nums[el.dataset.unit] = el));

  function tick() {
    const diff = fechaEvento - Date.now();
    if (diff <= 0) {
      clearInterval(timer);
      grid.hidden = true;
      done.hidden = false;
      return;
    }
    const s = Math.floor(diff / 1000);
    const values = {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
    for (const unit in values) {
      const text = unit === "days" ? String(values[unit]) : String(values[unit]).padStart(2, "0");
      const el = nums[unit];
      if (el.textContent !== text) {
        el.textContent = text;
        // Animación discreta al cambiar cada número
        if (!reduceMotion) el.animate([{ opacity: 0.3, transform: "translateY(-3px)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: "ease-out" });
      }
    }
  }

  const timer = setInterval(tick, 1000);
  tick();
}

/* ---------- Carrusel de homenajeadas ---------- */
function iniciarCarrusel() {
  const track = $("#honorees-track");
  const dots = $("#honorees-dots");
  const status = $("#honorees-status");
  const total = homenajeadas.length;

  track.innerHTML = homenajeadas.map(({ mes, personas }, i) => {
    const contenido = personas.length
      ? `<ul class="slide__list">${personas.map((p) => `
          <li><span class="slide__name">${escapeHtml(p.nombre)}</span>${p.fecha ? `<span class="slide__date">${escapeHtml(p.fecha)}</span>` : ""}</li>`).join("")}
        </ul>`
      : `<p class="slide__placeholder">Próximamente agregaremos los nombres y fechas.</p>`;
    return `
      <article class="slide" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${total}: ${escapeHtml(mes)}">
        <div class="slide__card">
          <span class="slide__num">${String(i + 1).padStart(2, "0")}</span>
          <h3 class="slide__month">${escapeHtml(mes)}</h3>
          <div class="ornament" aria-hidden="true"></div>
          ${contenido}
        </div>
      </article>`;
  }).join("");
  dots.innerHTML = "<span></span>".repeat(total);

  let index = -1;
  function marcar(i) {
    if (i === index) return;
    index = i;
    [...dots.children].forEach((d, n) => d.classList.toggle("is-active", n === i));
    status.textContent = `${homenajeadas[i].mes}, ${i + 1} de ${total}`;
  }

  // Las diapositivas miden 100% del ancho: la posición = índice × ancho
  const irA = (i) => track.scrollTo({ left: ((i + total) % total) * track.clientWidth });

  $("#honorees-prev").addEventListener("click", () => irA(index - 1));
  $("#honorees-next").addEventListener("click", () => irA(index + 1));
  // El deslizamiento táctil y las flechas del teclado los da el scroll nativo
  track.addEventListener("scroll", () => marcar(Math.round(track.scrollLeft / track.clientWidth)), { passive: true });

  marcar(0);
}

/* ---------- WhatsApp y ubicación ---------- */
function iniciarBotones() {
  $("#btn-whatsapp").href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  if (ubicacionUrl) {
    const btn = $("#btn-location");
    btn.href = ubicacionUrl;
    btn.removeAttribute("aria-disabled");
    btn.classList.remove("is-disabled");
    btn.querySelector("span").textContent = "Ver ubicación";
  }
}

/* ---------- Música opcional ---------- */
function iniciarMusica() {
  const audio = $("#music");
  const btn = $("#music-toggle");
  const label = btn.querySelector(".music-toggle__label");
  audio.volume = 0.5;

  btn.addEventListener("click", async () => {
    if (!audio.paused) {
      audio.pause();
      btn.setAttribute("aria-pressed", "false");
      label.textContent = "Activar música";
      return;
    }
    try {
      await audio.play();
      btn.setAttribute("aria-pressed", "true");
      label.textContent = "Pausar música";
    } catch {
      // Si no existe assets/audio/musica.mp3 la página sigue normal
      label.textContent = "Música no disponible";
      btn.disabled = true;
    }
  });
}

iniciarApariciones();
iniciarContador();
iniciarCarrusel();
iniciarBotones();
iniciarMusica();
