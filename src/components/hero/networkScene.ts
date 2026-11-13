import * as THREE from "three";

/**
 * The hero subject: a deep neural network of translucent glass nodes. Layers recede into the
 * scene; `setProgress(0–1)` moves the camera forward through them while signals flow from layer
 * to layer. The layout is seeded, so it is identical on every visit and matches the posters.
 */
export type NetworkScene = {
  setProgress: (p: number) => void;
  /** Renders one frame at the given progress with the signal animation paused (used for posters). */
  still: (p: number) => void;
  dispose: () => void;
};

type Options = { portrait: boolean; animate: boolean };

const PAPER = new THREE.Color("#fafafd");
const RIM = new THREE.Color("#6f9fcf");
const CORE = new THREE.Color("#ffffff");
const LINE = new THREE.Color("#9dbcdd");
const SIGNAL = new THREE.Color("#1257b8"); // the site accent

export function createNetworkScene(host: HTMLElement, opts: Options): NetworkScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false });
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PAPER, 6, 30);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);

  // Deterministic random numbers.
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  /* ---------- layout ---------- */
  const LAYERS = 14;
  const GAP = 3.4;
  const layers: THREE.Vector3[][] = [];
  for (let li = 0; li < LAYERS; li++) {
    const n = 16 + Math.floor(rand() * 9);
    const z = -li * GAP;
    const rx = 7.5 + rand() * 1.5;
    const ry = 4.2 + rand() * 1;
    const cx = Math.sin(li * 0.7) * 1.6;
    const cy = Math.cos(li * 0.5) * 0.8;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const a = i * 2.39996 + li * 1.3;
      const r = Math.sqrt(t);
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r * rx, cy + Math.sin(a) * r * ry, z + (rand() - 0.5) * 1.2));
    }
    layers.push(pts);
  }
  const nodes = layers.flat();
  const layerStart: number[] = [];
  layers.reduce((acc, l, i) => ((layerStart[i] = acc), acc + l.length), 0);

  const edges: [number, number][] = [];
  const outgoing: number[][] = nodes.map(() => []);
  for (let li = 0; li < LAYERS - 1; li++) {
    layers[li].forEach((p, i) => {
      const a = layerStart[li] + i;
      const ranked = layers[li + 1]
        .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
        .sort((u, v) => u.d - v.d)
        .slice(0, 5);
      const k = 2 + Math.floor(rand() * 2);
      for (let c = 0; c < k; c++) {
        const b = layerStart[li + 1] + ranked[Math.floor(rand() * ranked.length)].j;
        if (!outgoing[a].some((e) => edges[e][1] === b)) {
          outgoing[a].push(edges.length);
          edges.push([a, b]);
        }
      }
    });
  }

  const net = new THREE.Group();
  scene.add(net);

  /* ---------- glass nodes ---------- */
  const nodeMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uCore: { value: CORE }, uRim: { value: RIM } },
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
      uniform vec3 uCore; uniform vec3 uRim;
      varying vec3 vN; varying vec3 vV; varying float vDepth; varying float vPulse;
      void main(){
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        float f = pow(1.0 - max(dot(n, v), 0.0), 2.2);
        float spec = pow(max(dot(reflect(-normalize(vec3(-0.4,0.7,0.6)), n), v), 0.0), 40.0);
        vec3 col = mix(uCore, uRim, f) + spec * 0.6;
        col = mix(col, uRim * 1.1, vPulse * 0.6);
        float alpha = 0.18 + f * 0.75 + spec * 0.5 + vPulse * 0.35;
        float fog = smoothstep(30.0, 10.0, vDepth);
        float nearFade = smoothstep(0.6, 3.0, vDepth);
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0) * fog * nearFade);
      }`,
  });
  const nodeGeo = new THREE.SphereGeometry(1, 32, 20);
  const nodeMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, nodes.length);
  const pulseAttr = new THREE.InstancedBufferAttribute(new Float32Array(nodes.length), 1);
  nodeGeo.setAttribute("aPulse", pulseAttr);
  const baseScale = nodes.map(() => 0.09 + rand() * 0.07);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const placeNode = (i: number, k = 1) => {
    sc.setScalar(baseScale[i] * k);
    m4.compose(nodes[i], q, sc);
    nodeMesh.setMatrixAt(i, m4);
  };
  nodes.forEach((_, i) => placeNode(i));
  nodeMesh.frustumCulled = false;
  net.add(nodeMesh);

  /* ---------- halos and signals share one point shader ---------- */
  const pointsVertex = /* glsl */ `
    attribute float aSize; uniform float uScale; varying float vDepth;
    void main(){
      vec4 mv = modelViewMatrix * vec4(position,1.0);
      vDepth = -mv.z;
      gl_PointSize = aSize * uScale / max(vDepth, 0.5);
      gl_Position = projectionMatrix * mv;
    }`;

  const haloGeo = new THREE.BufferGeometry();
  haloGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nodes.flatMap((p) => [p.x, p.y, p.z])), 3));
  haloGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(baseScale.map((s) => s * 9)), 1));
  const haloMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: RIM }, uScale: { value: 300 } },
    vertexShader: pointsVertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vDepth;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a = a * a * 0.22 * smoothstep(30.0, 8.0, vDepth) * smoothstep(0.6, 3.0, vDepth);
        gl_FragColor = vec4(uColor, a);
      }`,
  });
  const halo = new THREE.Points(haloGeo, haloMat);
  halo.frustumCulled = false;
  net.add(halo);

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(edges.flatMap(([a, b]) => [nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z])), 3),
  );
  const lineMat = new THREE.LineBasicMaterial({ color: LINE, transparent: true, opacity: 0.42, depthWrite: false, fog: true });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;
  net.add(lines);

  const SIGNALS = 160;
  const sigPos = new Float32Array(SIGNALS * 3);
  const sigGeo = new THREE.BufferGeometry();
  sigGeo.setAttribute("position", new THREE.BufferAttribute(sigPos, 3));
  sigGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(SIGNALS).map(() => 0.5 + rand() * 0.35), 1));
  const sigMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: SIGNAL }, uScale: { value: 300 } },
    vertexShader: pointsVertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vDepth;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float core = smoothstep(0.18, 0.05, d);
        float glow = smoothstep(0.5, 0.0, d) * 0.35;
        float a = (core + glow) * smoothstep(30.0, 6.0, vDepth) * smoothstep(0.5, 2.0, vDepth);
        gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.25), a);
      }`,
  });
  const signals = new THREE.Points(sigGeo, sigMat);
  signals.frustumCulled = false;
  net.add(signals);

  const edgeFrom = (node: number) => {
    const list = outgoing[node];
    return list.length ? list[Math.floor(rand() * list.length)] : -1;
  };
  const freshEdge = () => {
    for (let tries = 0; tries < 12; tries++) {
      const e = edgeFrom(Math.floor(rand() * layerStart[LAYERS - 1]));
      if (e >= 0) return e;
    }
    return 0;
  };
  const flow = Array.from({ length: SIGNALS }, () => ({ edge: freshEdge(), t: rand(), speed: 0.35 + rand() * 0.45 }));
  const pulse = pulseAttr.array as Float32Array;
  const tmp = new THREE.Vector3();

  const stepSignals = (dt: number) => {
    flow.forEach((s, i) => {
      s.t += dt * s.speed;
      if (s.t >= 1) {
        const arrived = edges[s.edge][1];
        pulse[arrived] = 1;
        const next = edgeFrom(arrived);
        s.edge = next >= 0 ? next : freshEdge();
        s.t = 0;
      }
      const [a, b] = edges[s.edge];
      tmp.lerpVectors(nodes[a], nodes[b], s.t);
      sigPos.set([tmp.x, tmp.y, tmp.z], i * 3);
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
  };

  /* ---------- camera ---------- */
  const depth = (LAYERS - 1) * GAP;
  const pointer = { x: 0, y: 0 };
  const cam = { x: 0, y: 0, z: 7 };
  let progress = 0;
  let wide = !opts.portrait;

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    wide = w / h > 1;
    camera.fov = wide ? 48 : 60;
    camera.updateProjectionMatrix();
    const scale = h * renderer.getPixelRatio();
    haloMat.uniforms.uScale.value = scale * 0.42;
    sigMat.uniforms.uScale.value = scale * 0.11;
  };

  const frame = (dt: number, time: number, snap = false) => {
    const sway = opts.animate ? Math.sin(time * 0.15) * 0.4 : 0;
    // The network sits in the right half on wide screens, like the original subject, and the camera
    // travels about two thirds of the way through it over the hero.
    const targetZ = 7 - progress * depth * 0.62;
    const targetX = (wide ? 3.2 : 0.6) + pointer.x * 0.8 + sway + progress * 1.4;
    const targetY = -pointer.y * 0.45 + Math.cos(progress * Math.PI) * 0.35 - 0.2;
    const k = snap ? 1 : Math.min(1, dt * 2.5);
    cam.x += (targetX - cam.x) * k;
    cam.y += (targetY - cam.y) * k;
    cam.z += (targetZ - cam.z) * k;
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(cam.x * 0.35 - (wide ? 1.4 : 0.2), cam.y * 0.3, cam.z - 10);
    if (opts.animate && !snap) stepSignals(dt);
    renderer.render(scene, camera);
  };

  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const ro = new ResizeObserver(() => {
    resize();
    frame(0, 0, true);
  });
  ro.observe(host);
  resize();

  // Animate only while the scene is on screen and the tab is visible.
  let raf = 0, running = false, visible = true, last = 0, elapsed = 0;
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += dt;
    frame(dt, elapsed);
    raf = requestAnimationFrame(loop);
  };
  const play = () => {
    if (running || !opts.animate) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !document.hidden) play();
    else pause();
  });
  io.observe(host);
  const onVisibility = () => (document.hidden || !visible ? pause() : play());
  document.addEventListener("visibilitychange", onVisibility);
  if (opts.animate) window.addEventListener("pointermove", onPointer, { passive: true });

  stepSignals(0);
  frame(0, 0, true);
  play();

  return {
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
      if (!running) frame(0, elapsed, true);
    },
    still(p) {
      pause();
      progress = p;
      pointer.x = pointer.y = 0;
      frame(0, 0, true);
    },
    dispose() {
      pause();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      [nodeGeo, haloGeo, lineGeo, sigGeo].forEach((g) => g.dispose());
      [nodeMat, haloMat, lineMat, sigMat].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
