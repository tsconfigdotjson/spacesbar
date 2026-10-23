import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./style.css";
import "./og.css";
import { paint, room, RoomDemo, setDemo, setTalker, stage } from "./ui";

const demo = new RoomDemo(document.getElementById("room-panel")!);
setDemo(demo);
setTalker(stage[0]);
room.level = 0.8;
paint(1.3);
demo.float("💜", true, 0.8);
demo.float("👏", false, 0.62);

// Freeze mid-air once the photos and fonts are in, then tell the renderer.
await document.fonts.ready;
await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
await new Promise((r) => setTimeout(r, 900));
for (const a of document.getAnimations()) a.pause();
document.body.dataset.ready = "";
