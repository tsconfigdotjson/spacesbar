import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./style.css";
import { loop, renderMenu, RoomDemo, setDemo } from "./ui";

// The Pages deploy copies the latest release's disk image next to the page.
const DOWNLOAD_URL = `${import.meta.env.BASE_URL}SpacesBar.dmg`;

/** The desktop's design size: everything is laid out for it, then zoomed to fit. */
const DESIGN = { width: 1400, height: 860 };
const desk = document.getElementById("desk")!;
const iconEl = document.getElementById("status-icon")!;
const menu = document.getElementById("hero-menu")!;
const rings = document.getElementById("rings")!;
const panel = document.getElementById("room-panel")!;
let k = 1;

/** One screen on a Mac-sized window; a plain stack on anything narrow. */
function fit() {
  const stacked = innerWidth < 1000 || innerHeight < 600;
  document.body.classList.toggle("stacked", stacked);
  k = stacked ? 1 : Math.min(1.2, innerWidth / DESIGN.width, (innerHeight - 30) / DESIGN.height);
  desk.style.setProperty("--k", String(k));
  const r = iconEl.getBoundingClientRect();
  const mid = (r.left + r.width / 2) / k;
  rings.style.left = `${mid}px`;
  menu.style.left = stacked ? "" : `${Math.min(mid - 180, innerWidth / k - 368)}px`;
}

function setMenu(open: boolean) {
  menu.classList.toggle("closed", !open);
  iconEl.classList.toggle("is-active", open);
  iconEl.setAttribute("aria-expanded", String(open));
}

iconEl.addEventListener("click", (e) => {
  e.stopPropagation();
  setMenu(menu.classList.contains("closed"));
});
// Like a menu: a click anywhere else closes it.
document.addEventListener("click", (e) => {
  if (!document.body.classList.contains("stacked") && !menu.contains(e.target as Node)) setMenu(false);
  document.querySelectorAll(".react-wrap.open").forEach((x) => x.contains(e.target as Node) || x.classList.remove("open"));
});

/** Windows move by their title bars. */
function draggable(win: HTMLElement) {
  const bar = win.querySelector<HTMLElement>("[data-drag]")!;
  let x = 0, y = 0;
  bar.addEventListener("pointerdown", (down) => {
    if (document.body.classList.contains("stacked")) return;
    const sx = down.clientX, sy = down.clientY, ox = x, oy = y;
    bar.setPointerCapture(down.pointerId);
    const move = (e: PointerEvent) => {
      x = ox + (e.clientX - sx) / k;
      y = oy + (e.clientY - sy) / k;
      win.style.translate = `${x}px ${y}px`;
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", () => bar.removeEventListener("pointermove", move), { once: true });
  });
}

function clock() {
  const el = document.getElementById("clock")!;
  const show = () => {
    el.textContent = new Date().toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" }).replace(",", "");
  };
  show();
  setInterval(show, 15_000);
}

document.querySelectorAll<HTMLAnchorElement>("[data-download]").forEach((a) => (a.href = DOWNLOAD_URL));
renderMenu(menu, () => {
  setMenu(false);
  // Opening the Space you're in brings its panel forward.
  panel.firstElementChild?.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
    { duration: 420, easing: "cubic-bezier(.2,1.4,.4,1)" },
  );
});
setDemo(new RoomDemo(panel));
draggable(document.getElementById("readme")!);
clock();
fit();
addEventListener("resize", fit);
document.fonts.ready.then(fit);
loop();
