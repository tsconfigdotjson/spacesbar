import { icon } from "./icons";

// MARK: - People and Spaces (fictional), drawn the way the app draws them

type Role = "Host" | "Co-host" | "Speaker" | "Listener";

interface Person {
  name: string;
  handle: string;
  role: Role;
  verified?: boolean;
  me?: boolean;
}

const p = (name: string, handle: string, role: Role = "Speaker", verified = false): Person => ({ name, handle, role, verified });

/** Person.hue in Model.swift: a stable hue from the screen name. */
function hue(handle: string): number {
  let h = 0;
  for (const c of handle) h = (h * 31 + c.codePointAt(0)!) % 360;
  return h / 360;
}

/** Color.tint: SwiftUI's HSB, as CSS. */
function tint(h: number, s = 0.6, b = 0.9, a = 1): string {
  const f = (n: number) => {
    const k = (n + h * 6) % 6;
    return Math.round(255 * (b - b * s * Math.max(0, Math.min(k, 4 - k, 1))));
  };
  return `rgb(${f(5)} ${f(3)} ${f(1)} / ${a})`;
}

const host = p("Maya Okafor", "mayaonair", "Host", true);
export const stage: Person[] = [
  host,
  p("Theo Lindqvist", "theo_l", "Co-host"),
  p("Priya Raman", "priyacodes", "Speaker", true),
  p("Jun Park", "junpark"),
  p("Sam Rivera", "samriv"),
  p("Ada Chen", "adachen", "Speaker", true),
];
export const me: Person = { name: "Night Owl", handle: "nightowl", role: "Speaker", me: true };
const listeners = ["Noor Haddad", "Eli Brooks", "Kai Tanaka", "Lena Vogel", "Omar Diallo", "Rosa Marín", "Ines Costa", "Ravi Shah", "Zoe Kim", "Ben Ito", "Mia Laurent", "Tom Reyes"]
  .map((n) => p(n, n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(" ", "_"), "Listener"));

interface Space {
  title: string;
  host: Person;
  speakers: Person[];
  count: number;
  trending?: boolean;
}

const spaces: Space[] = [
  { title: "Shipping on a Friday: a support group", host, speakers: stage.slice(1), count: 1284 },
  { title: "Late-night synth jam — bring a patch", host: p("Felix Moreau", "felixwaves", "Host", true), speakers: [p("Ana Ruiz", "anaruiz"), p("Dev Patel", "devp")], count: 3412, trending: true },
  { title: "Rust vs. everything, round 12", host: p("Hana Sato", "hanasato", "Host"), speakers: [p("Leo Grant", "leog"), p("Ivy Nash", "ivyn"), p("Max Ode", "maxode")], count: 862 },
  { title: "Founders' coffee — open mic", host: p("Chris Adeyemi", "chrisade", "Host", true), speakers: [p("Uma Bell", "umab")], count: 517 },
  { title: "Golden hour photo talk", host: p("Lucia Ferri", "luciaferri", "Host"), speakers: [], count: 96 },
];

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K`.replace(".0K", "K") : `${n}`);
const first = (x: Person) => (x.me ? "You" : x.name.split(" ")[0]);

// MARK: - Shared pieces

function avatar(x: Person, size: number, extra = ""): string {
  const h = hue(x.handle);
  const initials = x.name.split(" ").slice(0, 2).map((w) => w[0]).join("");
  // The monogram shows while the photo loads, as in the app.
  return `<span class="avatar ${extra}" style="--s:${size}px;--a:${tint(h, 0.5, 0.88)};--b:${tint((h + 0.07) % 1, 0.72, 0.52)}">${initials}<img src="${
    import.meta.env.BASE_URL
  }avatars/${x.handle}.jpg" alt="" decoding="async"></span>`;
}

function facePile(people: Person[], size: number, max: number, ring: string): string {
  return `<span class="facepile" style="--s:${size}px;--ring:${ring}">${people.slice(0, max).map((x) => avatar(x, size)).join("")}</span>`;
}

const seal = (size = 11) => `<span class="seal" style="--s:${size}px">${icon.seal}</span>`;

/** Waveform: bars that dance while someone speaks (Components.swift). */
interface Wave {
  el: HTMLElement;
  level: () => number;
}
const waves: Wave[] = [];

function waveform(height: number, color: string): string {
  return `<span class="wf" data-wave style="--h:${height}px;--c:${color}"><i></i><i></i><i></i><i></i></span>`;
}

function bindWaves(root: ParentNode, level: () => number) {
  root.querySelectorAll<HTMLElement>("[data-wave]:not([data-bound])").forEach((el) => {
    el.dataset.bound = "";
    waves.push({ el, level });
  });
}

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// MARK: - Voices: who's talking, and how loud

export const room = {
  talker: host as Person | null,
  level: 0,
  target: 0.6,
  listening: true,
};

function speakingOrder(): Person[] {
  return demo?.state === "live" ? [...stage, me, me] : stage;
}

// MARK: - The menu bar drop-down (MenuView.swift)

export function renderMenu(el: HTMLElement, onOpen?: () => void) {
  const rows = spaces
    .map((s, i) => {
      const others = s.speakers.length;
      const byline = others === 0 ? s.host.name : `${s.host.name} and ${others} other${others === 1 ? "" : "s"}`;
      const h = hue(s.host.handle);
      const side =
        i === 0
          ? waveform(10, "var(--violet)")
          : s.trending
            ? `<span class="row-flame" title="Trending">${icon.flame}</span>`
            : `<span class="row-wave">${icon.waveform}</span>`;
      return `<button class="row" data-row="${i}">
        <span class="row-ring" style="--t:${tint(h)}">${avatar(s.host, 42)}</span>
        <span class="row-text">
          <span class="row-title">${s.title}</span>
          <span class="row-by">${others ? facePile(s.speakers, 16, 3, "var(--menu-solid)") : ""}<span>${byline}</span></span>
        </span>
        <span class="row-side">${side}<span class="row-count">${compact(s.count)}</span></span>
      </button>`;
    })
    .join("");

  el.innerHTML = `<div class="menu">
    <div class="menu-head">
      <span class="menu-title">Spaces</span><span class="menu-live">${spaces.length} live</span>
      <span class="menu-refresh" title="Refresh">${icon.refresh}</span>
    </div>
    <button class="now" data-now style="--t:${tint(hue(host.handle), 0.6, 0.45)}">
      <span data-now-avatar></span>
      <span class="now-text"><span class="now-title">${spaces[0].title}</span><span class="now-sub" data-now-sub></span></span>
      ${waveform(12, "#fff")}
    </button>
    <div class="menu-list">${rows}</div>
    <div class="menu-foot">${avatar(me, 22)}<span>@${me.handle}</span><span class="menu-more">${icon.ellipsis}</span></div>
  </div>`;

  bindWaves(el.querySelector(".now")!, () => Math.max(0.15, room.level));
  bindWaves(el.querySelector(".menu-list")!, () => 0.8);

  const nowAvatar = el.querySelector<HTMLElement>("[data-now-avatar]")!;
  const nowSub = el.querySelector<HTMLElement>("[data-now-sub]")!;
  onTalker((t) => {
    nowAvatar.innerHTML = avatar(t ?? host, 34);
    nowSub.textContent = t ? `${t.me ? "You are" : t.name + " is"} speaking` : "You're listening";
  });

  el.querySelectorAll("[data-row], [data-now]").forEach((b) => b.addEventListener("click", () => onOpen?.()));
}

// MARK: - The room (SpacePanel.swift), live and clickable

type MicState = "listening" | "requested" | "joining" | "muted" | "live";
const EMOJIS = ["😂", "😲", "😢", "💜", "💯", "👏", "✊", "👍", "👎", "👋"];

const talkerListeners: ((t: Person | null) => void)[] = [];
function onTalker(f: (t: Person | null) => void) {
  talkerListeners.push(f);
  f(room.talker);
}
export function setTalker(t: Person | null) {
  if (t === room.talker) return;
  room.talker = t;
  talkerListeners.forEach((f) => f(t));
}

export class RoomDemo {
  state: MicState = "listening";
  compact = false;
  hand = false;
  private panel: HTMLElement;
  private timers: number[] = [];

  constructor(root: HTMLElement) {
    this.panel = document.createElement("div");
    this.panel.className = "panel";
    this.panel.style.setProperty("--hue-a", tint(hue(host.handle), 0.7, 0.9));
    this.panel.style.setProperty("--hue-b", tint((hue(host.handle) + 0.12) % 1, 0.65, 0.7));
    root.append(this.panel);
    this.render();
    onTalker(() => this.talkerChanged());
  }

  private render() {
    this.panel.classList.toggle("is-pill", this.compact);
    this.panel.innerHTML = `<div class="ambient"><i></i><i></i></div><div class="floaters"></div>${this.compact ? this.pill() : this.full()}`;
    bindWaves(this.panel, () => room.level);
    this.wire();
    this.talkerChanged();
  }

  private full(): string {
    const ppl = this.state === "muted" || this.state === "live" ? [...stage, me] : stage;
    return `<div class="room">
      <div class="room-head">
        <div>
          <div class="room-meta"><span class="live-badge"><i></i>LIVE</span><span>${compact(spaces[0].count)} listening</span></div>
          <div class="room-title">${spaces[0].title}</div>
        </div>
        <button class="glass sm" data-act="min" aria-label="Minimize">${icon.chevronDown}</button>
      </div>
      <div class="spotlight" data-spot></div>
      <div class="stage">${ppl
        .map(
          (x) => `<div class="stage-p" data-person="${x.handle}" title="${x.name} · @${x.handle}">
            ${this.live(x, 40)}
            <span class="stage-name">${first(x)}${x.verified ? seal(9) : ""}</span>
            <span class="stage-role">${x.role === "Speaker" ? "&nbsp;" : x.role}</span>
          </div>`,
        )
        .join("")}</div>
      <button class="listeners" data-act="listeners">
        ${facePile(listeners, 20, 5, "rgb(0 0 0 / .6)")}
        <span>${compact(spaces[0].count)} listening</span>
        <span class="chev">${icon.chevronRight}</span>
      </button>
      <div class="listener-grid">${listeners.map((x) => `<span>${avatar(x, 34)}<small>${first(x)}</small></span>`).join("")}</div>
      <div class="controls">
        ${this.mic(52)}
        <div class="ctl-text">
          <div class="ctl-title">${this.title()}</div>
          ${
            this.state === "muted" || this.state === "live"
              ? `<button class="ctl-sub link" data-act="unstage">Leave the stage</button>`
              : `<div class="ctl-sub">${this.subtitle()}</div>`
          }
        </div>
        ${this.state === "muted" || this.state === "live" ? `<button class="glass ${this.hand ? "on" : ""}" data-act="hand" aria-label="Raise hand">${icon.hand}</button>` : ""}
        <div class="react-wrap">
          <button class="glass" data-act="react" aria-label="React">${icon.smile}</button>
          <div class="picker">${EMOJIS.map((e) => `<button data-emoji="${e}">${e}</button>`).join("")}</div>
        </div>
        <button class="glass red" data-act="leave" aria-label="Leave Space">${icon.xmark}</button>
      </div>
      <div class="ended"><span>${icon.waveSlash}</span><strong>You left the Space</strong><button data-act="rejoin">Rejoin</button></div>
    </div>`;
  }

  private pill(): string {
    return `<div class="pill">
      <span data-pill-avatar></span>
      <div class="pill-text">
        <div class="pill-title" data-pill-title></div>
        <div class="pill-sub">${waveform(8, "rgb(255 255 255 / .8)")}<span data-pill-sub></span></div>
      </div>
      <button class="glass sm pill-expand" data-act="expand" aria-label="Expand">${icon.chevronUp}</button>
      ${this.mic(38)}
    </div>`;
  }

  /** LiveAvatar: glows while its person talks. */
  private live(x: Person, size: number, mute = true): string {
    const onStage = this.state === "live" || this.state === "muted";
    const muted = x.me ? this.state !== "live" : false;
    const hand = x.me && this.hand && onStage;
    return `<span class="live" style="--s:${size}px;--glow:${tint(hue(x.handle), 0.55, 1)}" data-live="${x.handle}">${avatar(x, size)}${
      mute && muted ? `<span class="mute">${icon.micSlash}</span>` : ""
    }${hand ? `<span class="badge">✋</span>` : ""}</span>`;
  }

  private mic(size: number): string {
    const glyph = {
      listening: icon.mic,
      requested: icon.check,
      joining: `<span class="spinner"></span>`,
      muted: icon.micSlash,
      live: icon.mic,
    }[this.state];
    const label = { listening: "Request to speak", requested: "Cancel request", joining: "Joining the stage", muted: "Unmute", live: "Mute" }[this.state];
    return `<button class="mic mic-${this.state}" style="--s:${size}px" data-act="mic" aria-label="${label}" title="${label}">${glyph}</button>`;
  }

  private title(): string {
    return { listening: "Listening", requested: "Request sent", joining: "Joining the stage…", muted: "You're muted", live: "You're live" }[this.state];
  }

  private subtitle(): string {
    return { listening: "Tap the mic to request", requested: "Waiting for the host" }[this.state as "listening"] ?? "&nbsp;";
  }

  private talkerChanged() {
    const t = room.talker;
    const shown = t ?? host;
    const spot = this.panel.querySelector<HTMLElement>("[data-spot]");
    if (spot && spot.dataset.who !== shown.handle) {
      spot.dataset.who = shown.handle;
      spot.innerHTML = `<div class="spot-in">${this.live(shown, 84, false)}
        <div class="spot-name">${shown.me ? "You" : shown.name}${shown.verified ? seal() : ""}</div>
        <div class="spot-sub">${t ? waveform(9, "rgb(255 255 255 / .85)") : ""}<span>${shown.role} · ${t ? "speaking" : "quiet right now"}</span></div></div>`;
      bindWaves(spot, () => room.level);
    }
    const pa = this.panel.querySelector<HTMLElement>("[data-pill-avatar]");
    if (pa) {
      pa.innerHTML = `<span class="live" style="--s:34px;--glow:${tint(hue(shown.handle), 0.55, 1)}" data-live="${shown.handle}">${avatar(shown, 34)}</span>`;
      this.panel.querySelector("[data-pill-title]")!.textContent = t ? (t.me ? "You" : t.name) : spaces[0].title;
      this.panel.querySelector("[data-pill-sub]")!.textContent = t ? "speaking" : `${compact(spaces[0].count)} listening`;
      this.panel.querySelector<HTMLElement>(".pill .wf")!.style.display = t ? "" : "none";
    }
    this.panel.querySelectorAll<HTMLElement>("[data-live]").forEach((el) => el.classList.toggle("speaking", !!t && el.dataset.live === t.handle));
  }

  private wire() {
    this.panel.querySelectorAll<HTMLElement>("[data-act]").forEach((b) =>
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        this.act(b.dataset.act!);
      }),
    );
    this.panel.querySelectorAll<HTMLElement>("[data-emoji]").forEach((b) =>
      b.addEventListener("click", () => {
        this.float(b.dataset.emoji!, true);
        this.panel.querySelector(".react-wrap")!.classList.remove("open");
      }),
    );
    this.panel.querySelector(".pill")?.addEventListener("dblclick", () => this.act("expand"));
  }

  private later(ms: number, f: () => void) {
    this.timers.push(window.setTimeout(f, ms));
  }

  private act(a: string) {
    switch (a) {
      case "mic":
        if (this.state === "listening") {
          this.set("requested");
          // The host brings you up after a moment.
          this.later(2200, () => this.state === "requested" && this.set("joining"));
          this.later(3300, () => this.state === "joining" && this.set("muted"));
        } else if (this.state === "requested") this.set("listening");
        else if (this.state === "muted") this.set("live");
        else if (this.state === "live") this.set("muted");
        break;
      case "unstage":
        this.hand = false;
        this.set("listening");
        break;
      case "hand":
        this.hand = !this.hand;
        this.render();
        break;
      case "react":
        this.panel.querySelector(".react-wrap")!.classList.toggle("open");
        break;
      case "listeners":
        this.panel.classList.toggle("show-listeners");
        break;
      case "leave":
        this.panel.classList.add("is-ended");
        room.listening = false;
        break;
      case "rejoin":
        this.panel.classList.remove("is-ended");
        room.listening = true;
        this.hand = false;
        this.set("listening");
        break;
      case "min":
      case "expand":
        this.resize(() => {
          this.compact = a === "min";
          this.render();
        });
        break;
    }
  }

  private set(s: MicState) {
    this.state = s;
    if (s !== "live" && room.talker?.me) setTalker(stage[0]);
    if (s === "live") setTalker(me);
    this.render();
  }

  /** Animates the panel's height across a change, like the SwiftUI spring. */
  private resize(change: () => void) {
    const from = this.panel.offsetHeight;
    change();
    const to = this.panel.offsetHeight;
    if (reduceMotion) return;
    this.panel.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 480, easing: "cubic-bezier(.2,1.1,.3,1)" });
    this.panel.firstElementChild?.nextElementSibling?.nextElementSibling?.animate([{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "none" }], {
      duration: 320,
      easing: "ease-out",
    });
  }

  /** FloatingReactions: emoji rising and swaying up the panel. */
  float(emoji: string, mine = false, x = 0.55 + Math.random() * 0.35) {
    if (!room.listening) return;
    const layer = this.panel.querySelector<HTMLElement>(".floaters");
    if (!layer) return;
    const e = document.createElement("span");
    e.textContent = emoji;
    e.className = "floater";
    e.style.left = `${x * 100}%`;
    e.style.fontSize = `${mine ? 34 : 24}px`;
    e.style.setProperty("--drift", `${Math.random() * 60 - 30}px`);
    e.style.setProperty("--rise", `${-(reduceMotion ? 40 : this.panel.offsetHeight * 0.55)}px`);
    layer.append(e);
    e.addEventListener("animationend", () => e.remove());
  }
}

let demo: RoomDemo | null = null;
export function setDemo(d: RoomDemo | null) {
  demo = d;
}

// MARK: - The tick: levels, talkers, bars

let nextSwitch = 0;
let nextReaction = 0;

export function tick(now: number) {
  const t = now / 1000;
  if (now > nextSwitch) {
    // Someone new picks up, or the room goes quiet for a beat.
    const order = speakingOrder();
    const quiet = Math.random() < 0.12;
    setTalker(quiet ? null : order[Math.floor(Math.random() * order.length)]);
    if (demo?.state === "live" && !quiet && Math.random() < 0.5) setTalker(me);
    nextSwitch = now + 2200 + Math.random() * 2400;
  }
  if (Math.random() < 0.35) room.target = Math.random() < 0.15 ? 0.12 : 0.35 + Math.random() * 0.65;
  room.level += ((room.talker && room.listening ? room.target : 0) - room.level) * 0.45;

  if (demo && now > nextReaction) {
    demo.float(EMOJIS[Math.floor(Math.random() * 6)]);
    nextReaction = now + 1400 + Math.random() * 2600;
  }

  paint(t);
}

/** Draws the bars and glows for the current levels. */
export function paint(t: number) {
  // The Swift bars: max(0.22h, h · level · (0.5 + 0.5|sin(7t + 1.7i)|)).
  for (const w of waves) {
    if (!w.el.isConnected) continue;
    const lv = w.level();
    w.el.querySelectorAll("i").forEach((bar, i) => {
      const wobble = reduceMotion ? 0.7 : 0.5 + 0.5 * Math.abs(Math.sin(t * 7 + i * 1.7));
      bar.style.transform = `scaleY(${Math.max(0.22, lv * wobble)})`;
    });
  }
  const l = room.level;
  document.querySelectorAll<HTMLElement>(".live.speaking").forEach((el) => el.style.setProperty("--l", l.toFixed(3)));
  document.querySelectorAll<HTMLElement>(".panel").forEach((el) => el.style.setProperty("--l", l.toFixed(3)));
}

export function loop() {
  let last = 0;
  const frame = (now: number) => {
    // The app steps its bars every 0.09 s; so do we.
    if (now - last > 90) {
      last = now;
      tick(now);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
