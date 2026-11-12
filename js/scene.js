// Hero scene: a layered neural network in 3D with signals travelling between layers.
// Runs only while the hero is on screen; renders one still frame when the visitor prefers reduced motion.
import * as THREE from "three";

const host = document.getElementById("hero-scene");
const hero = document.querySelector(".hero-wrap");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function css(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

if (host && hero && webglAvailable()) {
  start();
} else if (hero) {
  hero.classList.add("no-webgl");
}

function start() {
  const dark = matchMedia("(prefers-color-scheme: dark)").matches;
  const bg = new THREE.Color(css("--bg") || "#F7F7F4");
  const ink = new THREE.Color(dark ? "#AAC4DD" : "#18324A");
  const mid = new THREE.Color(dark ? "#6985A1" : "#546F89");
  const soft = new THREE.Color(dark ? "#415970" : "#87A3BF");
  const pulseColor = new THREE.Color(dark ? "#E6F0F8" : "#1F5A8C");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(bg, 7.5, 15);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
  camera.position.set(0, 0.2, 10.5);

  scene.add(new THREE.AmbientLight(0xffffff, dark ? 0.55 : 0.9));
  const key = new THREE.DirectionalLight(0xffffff, dark ? 1.4 : 1.6);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(dark ? 0x6985a1 : 0xaac4dd, 0.8);
  rim.position.set(-6, -2, -4);
  scene.add(rim);

  const net = new THREE.Group();
  scene.add(net);

  // Deterministic random numbers so the layout is the same on every visit.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // Layers sit along x; each layer is a disc of nodes in the y-z plane.
  const layerSizes = [7, 11, 14, 11, 6];
  const spacing = 1.75;
  const layers = layerSizes.map((n, li) => {
    const x = (li - (layerSizes.length - 1) / 2) * spacing;
    const radius = 0.55 + n * 0.11;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const a = i * 2.39996 + li; // golden-angle spiral gives an even spread
      const r = radius * Math.sqrt(t);
      pts.push(new THREE.Vector3(x + (rand() - 0.5) * 0.25, Math.cos(a) * r, Math.sin(a) * r));
    }
    return pts;
  });
  const nodes = layers.flat();
  const nodeLayer = layers.flatMap((l, li) => l.map(() => li));

  // Nodes
  const nodeGeo = new THREE.SphereGeometry(1, 24, 16);
  const nodeMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.15 });
  const nodeMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, nodes.length);
  const baseScale = nodes.map((_, i) => (nodeLayer[i] === 2 ? 0.085 : 0.075) * (0.85 + rand() * 0.3));
  const palette = [ink, mid, soft];
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  nodes.forEach((p, i) => {
    s.setScalar(baseScale[i]);
    m4.compose(p, q, s);
    nodeMesh.setMatrixAt(i, m4);
    nodeMesh.setColorAt(i, palette[Math.floor(rand() * 2.2)]);
  });
  net.add(nodeMesh);

  // Edges: each node links to a few nodes in the next layer.
  const edges = [];
  let offset = 0;
  for (let li = 0; li < layers.length - 1; li++) {
    const nextOffset = offset + layers[li].length;
    layers[li].forEach((_, i) => {
      const picks = new Set();
      const count = 3 + Math.floor(rand() * 3);
      while (picks.size < Math.min(count, layers[li + 1].length)) picks.add(Math.floor(rand() * layers[li + 1].length));
      picks.forEach((j) => edges.push([offset + i, nextOffset + j]));
    });
    offset = nextOffset;
  }
  const linePos = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], k) => {
    linePos.set([nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z], k * 6);
  });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  const lines = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ color: mid, transparent: true, opacity: dark ? 0.32 : 0.26, depthWrite: false })
  );
  net.add(lines);

  // Signals: small bright points that travel along edges, layer by layer.
  const PULSES = 46;
  const pulseMesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 12, 8),
    new THREE.MeshBasicMaterial({ color: pulseColor, transparent: true, opacity: 0.95, depthWrite: false }),
    PULSES
  );
  net.add(pulseMesh);
  const edgesFrom = new Map();
  edges.forEach((e, k) => {
    if (!edgesFrom.has(e[0])) edgesFrom.set(e[0], []);
    edgesFrom.get(e[0]).push(k);
  });
  const firstLayer = layers[0].map((_, i) => i);
  const pickStartEdge = () => {
    const from = firstLayer[Math.floor(rand() * firstLayer.length)];
    const list = edgesFrom.get(from);
    return list[Math.floor(rand() * list.length)];
  };
  const pulses = Array.from({ length: PULSES }, () => ({
    edge: edges.length ? pickStartEdge() : 0,
    t: rand(),
    speed: 0.45 + rand() * 0.4,
  }));
  const glow = new Float32Array(nodes.length); // brief "activation" when a signal arrives

  const tmp = new THREE.Vector3();
  function stepPulses(dt) {
    pulses.forEach((p, i) => {
      p.t += dt * p.speed;
      if (p.t >= 1) {
        const arrived = edges[p.edge][1];
        glow[arrived] = 1;
        const next = edgesFrom.get(arrived);
        p.edge = next ? next[Math.floor(rand() * next.length)] : pickStartEdge();
        p.t = 0;
      }
      const [a, b] = edges[p.edge];
      tmp.lerpVectors(nodes[a], nodes[b], p.t);
      s.setScalar(0.032);
      m4.compose(tmp, q, s);
      pulseMesh.setMatrixAt(i, m4);
    });
    pulseMesh.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < nodes.length; i++) {
      if (glow[i] > 0) {
        glow[i] = Math.max(0, glow[i] - dt * 2.2);
        s.setScalar(baseScale[i] * (1 + glow[i] * 0.55));
        m4.compose(nodes[i], q, s);
        nodeMesh.setMatrixAt(i, m4);
      }
    }
    nodeMesh.instanceMatrix.needsUpdate = true;
  }

  // Layout: the network sits to the right of the text on wide screens, centred behind it on phones.
  let wide = true;
  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    wide = w > 900;
    camera.fov = wide ? 36 : 30;
    camera.updateProjectionMatrix();
    net.position.set(wide ? 2.35 : 0, 0, 0);
    net.scale.setScalar(wide ? 0.92 : 0.95);
  }
  resize();
  new ResizeObserver(resize).observe(host);

  // Pointer parallax and scroll progress drive the rotation.
  const pointer = { x: 0, y: 0 };
  const rot = { x: -0.18, y: -0.55 };
  let scrollProgress = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );
  window.addEventListener("hero:scroll", (e) => (scrollProgress = e.detail), { passive: true });

  function frame(dt, time) {
    const drift = reduceMotion ? 0 : time * 0.06;
    const tx = -0.18 + pointer.y * 0.12 + scrollProgress * 0.35;
    const ty = -0.55 + drift + pointer.x * 0.25 + scrollProgress * 0.9;
    rot.x += (tx - rot.x) * Math.min(1, dt * 3);
    rot.y += (ty - rot.y) * Math.min(1, dt * 3);
    net.rotation.set(rot.x, rot.y, 0);
    camera.position.z = 10.5 + scrollProgress * 2.5;
    if (!reduceMotion) stepPulses(dt);
    renderer.render(scene, camera);
  }

  if (reduceMotion) {
    stepPulses(0);
    frame(1, 0);
    host.classList.add("ready");
    return;
  }

  let running = false;
  let last = 0;
  let elapsed = 0;
  let raf = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    elapsed += dt;
    frame(dt, elapsed);
    raf = requestAnimationFrame(loop);
  }
  function play() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // Pause when the hero leaves the screen or the tab is hidden.
  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible && !document.hidden ? play() : pause();
  }).observe(hero);
  document.addEventListener("visibilitychange", () => (document.hidden || !visible ? pause() : play()));

  frame(0.016, 0);
  host.classList.add("ready");
  play();
}
