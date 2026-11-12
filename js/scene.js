// Full-page background: a deep neural network made of translucent glass nodes.
// Layers recede into the page; scrolling moves the camera forward through them while
// signals flow from layer to layer. One still frame is drawn when reduced motion is on.
import * as THREE from "three";

const host = document.getElementById("bg-scene");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

if (host && webglAvailable()) start();
else document.documentElement.classList.add("no-webgl");

function start() {
  const dark = false; // the site always uses its light theme
  const bg = new THREE.Color(dark ? "#121417" : "#F7F7F4");
  const rim = new THREE.Color(dark ? "#9CC3EA" : "#6F9FCF");
  const core = new THREE.Color(dark ? "#E9F2FB" : "#FFFFFF");
  const lineColor = new THREE.Color(dark ? "#5E86AE" : "#9DBCDD");
  const signal = new THREE.Color(dark ? "#CFE6FF" : "#2F78C4");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(bg, 6, 30);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 80);

  // Deterministic random numbers so the network looks the same on every visit.
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // ---------- Network layout ----------
  const LAYERS = 14;
  const GAP = 3.4; // distance between layers along -z
  const layers = [];
  for (let li = 0; li < LAYERS; li++) {
    const n = 16 + Math.floor(rand() * 9);
    const z = -li * GAP;
    const rx = 7.5 + rand() * 1.5;
    const ry = 4.2 + rand() * 1;
    const cx = Math.sin(li * 0.7) * 1.6; // the network snakes gently as it recedes
    const cy = Math.cos(li * 0.5) * 0.8;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const a = i * 2.39996 + li * 1.3;
      const r = Math.sqrt(t);
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r * rx, cy + Math.sin(a) * r * ry, z + (rand() - 0.5) * 1.2));
    }
    layers.push(pts);
  }
  const nodes = layers.flat();
  const layerStart = [];
  layers.reduce((acc, l, i) => ((layerStart[i] = acc), acc + l.length), 0);

  // Edges: each node links to 2-3 of its nearest nodes in the next layer.
  const edges = [];
  const outgoing = nodes.map(() => []);
  for (let li = 0; li < LAYERS - 1; li++) {
    layers[li].forEach((p, i) => {
      const a = layerStart[li] + i;
      const ranked = layers[li + 1]
        .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
        .sort((u, v) => u.d - v.d)
        .slice(0, 5);
      const k = 2 + Math.floor(rand() * 2);
      for (let c = 0; c < k; c++) {
        const pick = ranked[Math.floor(rand() * ranked.length)];
        const b = layerStart[li + 1] + pick.j;
        if (!outgoing[a].some((e) => edges[e][1] === b)) {
          outgoing[a].push(edges.length);
          edges.push([a, b]);
        }
      }
    });
  }

  const net = new THREE.Group();
  scene.add(net);
  const dim = { value: 1 }; // overall strength: full in the hero, softer behind content

  // ---------- Glass nodes ----------
  const nodeMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uCore: { value: core },
      uRim: { value: rim },
      uDim: dim,
    },
    vertexShader: /* glsl */ `
      attribute float aPulse;
      varying vec3 vN; varying vec3 vV; varying float vDepth; varying float vPulse;
      void main(){
        vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        vV = normalize(-mv.xyz);
        vDepth = -mv.z;
        vPulse = aPulse;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCore; uniform vec3 uRim; uniform float uDim;
      varying vec3 vN; varying vec3 vV; varying float vDepth; varying float vPulse;
      void main(){
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        float f = pow(1.0 - max(dot(n, v), 0.0), 2.2);                       // glass rim
        float spec = pow(max(dot(reflect(-normalize(vec3(-0.4,0.7,0.6)), n), v), 0.0), 40.0);
        vec3 col = mix(uCore, uRim, f) + spec * 0.6;
        col = mix(col, uRim * 1.1, vPulse * 0.6);
        float alpha = 0.18 + f * 0.75 + spec * 0.5 + vPulse * 0.35;
        float fog = smoothstep(30.0, 10.0, vDepth);       // fade into the distance
        float nearFade = smoothstep(0.6, 3.0, vDepth);    // fade nodes passing the camera
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0) * fog * nearFade * uDim);
      }`,
  });
  const nodeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 32, 20), nodeMat, nodes.length);
  const pulseAttr = new THREE.InstancedBufferAttribute(new Float32Array(nodes.length), 1);
  nodeMesh.geometry.setAttribute("aPulse", pulseAttr);
  const baseScale = nodes.map(() => 0.09 + rand() * 0.07);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  function placeNode(i, k = 1) {
    sc.setScalar(baseScale[i] * k);
    m4.compose(nodes[i], q, sc);
    nodeMesh.setMatrixAt(i, m4);
  }
  nodes.forEach((_, i) => placeNode(i));
  nodeMesh.frustumCulled = false;
  net.add(nodeMesh);

  // ---------- Soft halos around nodes ----------
  const haloPos = new Float32Array(nodes.length * 3);
  nodes.forEach((p, i) => haloPos.set([p.x, p.y, p.z], i * 3));
  const haloGeo = new THREE.BufferGeometry();
  haloGeo.setAttribute("position", new THREE.BufferAttribute(haloPos, 3));
  haloGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(baseScale.map((s) => s * 9)), 1));
  const pointsVertex = /* glsl */ `
    attribute float aSize; uniform float uScale; varying float vDepth;
    void main(){
      vec4 mv = modelViewMatrix * vec4(position,1.0);
      vDepth = -mv.z;
      gl_PointSize = aSize * uScale / max(vDepth, 0.5);
      gl_Position = projectionMatrix * mv;
    }`;
  const halo = new THREE.Points(
    haloGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: rim }, uScale: { value: 300 }, uDim: dim },
      vertexShader: pointsVertex,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uDim; varying float vDepth;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          a = a * a * 0.22 * smoothstep(30.0, 8.0, vDepth) * smoothstep(0.6, 3.0, vDepth);
          gl_FragColor = vec4(uColor, a * uDim);
        }`,
    })
  );
  halo.frustumCulled = false;
  net.add(halo);

  // ---------- Connections ----------
  const linePos = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], k) => linePos.set([nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z], k * 6));
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0.4, depthWrite: false, fog: true });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;
  net.add(lines);

  // ---------- Signals flowing through the network ----------
  const SIGNALS = 160;
  const sigPos = new Float32Array(SIGNALS * 3);
  const sigGeo = new THREE.BufferGeometry();
  sigGeo.setAttribute("position", new THREE.BufferAttribute(sigPos, 3));
  sigGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(SIGNALS).map(() => 0.5 + rand() * 0.35), 1));
  const signals = new THREE.Points(
    sigGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: signal }, uScale: { value: 300 }, uDim: dim },
      vertexShader: pointsVertex,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uDim; varying float vDepth;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float core = smoothstep(0.18, 0.05, d);
          float glow = smoothstep(0.5, 0.0, d) * 0.35;
          float a = (core + glow) * smoothstep(30.0, 6.0, vDepth) * smoothstep(0.5, 2.0, vDepth);
          gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.25), a * uDim);
        }`,
    })
  );
  signals.frustumCulled = false;
  net.add(signals);

  const randomEdgeFrom = (node) => {
    const list = outgoing[node];
    return list && list.length ? list[Math.floor(rand() * list.length)] : -1;
  };
  const freshEdge = () => {
    for (let tries = 0; tries < 12; tries++) {
      const node = Math.floor(rand() * layerStart[LAYERS - 1]);
      const e = randomEdgeFrom(node);
      if (e >= 0) return e;
    }
    return 0;
  };
  // Signals start spread over the whole depth so the flow is visible from the first frame.
  const flow = Array.from({ length: SIGNALS }, () => ({ edge: freshEdge(), t: rand(), speed: 0.35 + rand() * 0.45 }));
  const pulse = pulseAttr.array;
  const tmp = new THREE.Vector3();

  function stepSignals(dt) {
    flow.forEach((s, i) => {
      s.t += dt * s.speed;
      if (s.t >= 1) {
        const arrived = edges[s.edge][1];
        pulse[arrived] = 1;
        const next = randomEdgeFrom(arrived);
        s.edge = next >= 0 ? next : freshEdge();
        s.t = 0;
      }
      const [a, b] = edges[s.edge];
      tmp.lerpVectors(nodes[a], nodes[b], s.t);
      sigPos[i * 3] = tmp.x;
      sigPos[i * 3 + 1] = tmp.y;
      sigPos[i * 3 + 2] = tmp.z;
    });
    sigGeo.attributes.position.needsUpdate = true;
    let changed = false;
    for (let i = 0; i < pulse.length; i++) {
      if (pulse[i] > 0) {
        pulse[i] = Math.max(0, pulse[i] - dt * 1.8);
        placeNode(i, 1 + pulse[i] * 0.5);
        changed = true;
      }
    }
    if (changed) {
      nodeMesh.instanceMatrix.needsUpdate = true;
      pulseAttr.needsUpdate = true;
    }
  }

  // ---------- Camera path: scrolling moves forward through the layers ----------
  const depth = (LAYERS - 1) * GAP;
  const pointer = { x: 0, y: 0 };
  const cam = { x: 0, y: 0, z: 7 };
  let progress = 0;
  let wide = true;

  function readScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const heroEnd = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
    dim.value = 1 - heroEnd * 0.42; // calmer behind the content
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    wide = w > 900;
    camera.fov = wide ? 50 : 62;
    camera.updateProjectionMatrix();
    const scale = h * renderer.getPixelRatio();
    halo.material.uniforms.uScale.value = scale * 0.42;
    signals.material.uniforms.uScale.value = scale * 0.11;
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );
  resize();
  readScroll();

  function frame(dt, time) {
    const sway = reduceMotion ? 0 : Math.sin(time * 0.15) * 0.4;
    const targetZ = 7 - progress * (depth - 2);
    const targetX = (wide ? 2.6 : 0) + pointer.x * 0.9 + sway + Math.sin(progress * Math.PI * 2) * 1.2;
    const targetY = -pointer.y * 0.5 + Math.cos(progress * Math.PI * 1.5) * 0.5;
    const k = dt ? Math.min(1, dt * 2.5) : 1;
    cam.x += (targetX - cam.x) * k;
    cam.y += (targetY - cam.y) * k;
    cam.z += (targetZ - cam.z) * k;
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(cam.x * 0.35 - (wide ? 1.2 : 0), cam.y * 0.3, cam.z - 10);
    if (!reduceMotion) stepSignals(dt);
    renderer.render(scene, camera);
  }

  if (reduceMotion) {
    stepSignals(0);
    frame(0, 0);
    const redraw = () => frame(0, 0);
    window.addEventListener("scroll", redraw, { passive: true });
    window.addEventListener("resize", redraw, { passive: true });
    host.classList.add("ready");
    return;
  }

  let raf = 0;
  let last = performance.now();
  let elapsed = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += dt;
    frame(dt, elapsed);
    raf = requestAnimationFrame(loop);
  }
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  });

  frame(0, 0);
  host.classList.add("ready");
  raf = requestAnimationFrame(loop);
}
