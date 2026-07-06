There is a file you can reference named "wedding album.mp4". Refer to this file by its name verbatim.

```markdown
# README.md: Micro-Interaction & Split-Text Portfolio Landing Page

This document explains the dynamic, click-and-hold portfolio grid transition showcased in "wedding album.mp4" and outlines a precise technical implementation guide.

## 1. Interaction Overview (For Copilot Context)

The interaction pattern in "wedding album.mp4" relies on an immersive, physics-based grid explosion triggered by user confirmation (`mousedown` / Long Press), rather than a standard scroll event.

### Phase 1: The Monogram Grid (Initial State)
* **Visuals:** The brand name **"GETZ"** is spaced widely across a dark viewport.
* **Micro-interactions:** 
  * Hovering over letters reveals associated vertical/horizontal images clipped directly behind or adjacent to the typography.
  * A custom circular cursor tracks the mouse. When hovering near the bottom right, it prompts a **"CLICK HERE & HOLD"** call-to-action (CTA).

### Phase 2: The Click-and-Hold "Explosion"
* **Action:** The user clicks and holds down on the CTA. A circular progress ring fills up around the cursor.
* **Transition:** Once full, the landing page explodes outward. The typography ("G", "E", "T", "Z") and existing images scatter away from the center with randomized rotations and trajectories. New portfolio cards fly up from the background depth into the viewport.

### Phase 3: Infinite Card Stack & Title Reveal
* **State Change:** The background color morphs smoothly (e.g., black to deep forest green).
* **The Stack:** The main project card occupies the center. Multiple historical project cards stack loosely beneath it with off-axis rotations ($ \approx -5^\circ $ to $ 5^\circ $).
* **Interaction:** Clicking the background or holding the CTA shifts the focus, sliding the top card away to stack a new item on top, smoothly updating the large central editorial title (e.g., "Poetic Calmness" $\rightarrow$ "Obscure Places").

---

## 2. Technical Stack Recommendation
* **Frontend:** HTML5, Tailwind CSS for structural grid alignment and absolute positioning.
* **Animation Core:** **GSAP (GreenSock)** for timeline sequencing and CSS transform values.
* **Input Tracking:** Native JavaScript pointer events (`mousedown`, `mouseup`, `mousemove`) to drive the progress ring and explosion logic.

---

## 3. Step-by-Step Implementation Guide

### Step 1: DOM Structuring
The landing view requires split tracking components and absolute positioning zones so items can fly outward radially.

```html
<!-- Interactive Landing View Container -->
<div id="portfolio-canvas" class="relative w-full h-screen overflow-hidden bg-[#0A0A0A] text-white select-none">
  
  <!-- Interactive Word Wrapper -->
  <div class="absolute inset-0 flex items-center justify-between px-24 text-[12vw] font-serif">
    <div class="scatter-item relative group" data-x="-200" data-y="-100">G
      <img src="thumb1.jpg" class="absolute top-0 left-full w-32 h-48 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
    <div class="scatter-item relative group" data-x="-50" data-y="-300">E</div>
    <div class="scatter-item relative group" data-x="50" data-y="300">T</div>
    <div class="scatter-item relative group" data-x="200" data-y="100">Z</div>
  </div>

  <!-- Custom Cursor / Holding Ring CTA -->
  <div id="hold-cta" class="absolute bottom-16 right-16 flex items-center justify-center w-24 h-24 rounded-full border border-white/20 cursor-pointer z-50">
    <svg class="absolute inset-0 w-full h-full -rotate-90">
      <circle id="progress-bar" cx="48" cy="48" r="44" stroke="white" stroke-width="2" fill="transparent" stroke-dasharray="276" stroke-dashoffset="276" />
    </svg>
    <span class="text-[9px] uppercase tracking-widest text-center pointer-events-none">Click Here & Hold</span>
  </div>
</div>

```

### Step 2: Custom Micro-Interaction Logic

Manage the cursor pathing, progress tracking, and long-press event listener loops.

```javascript
const cta = document.getElementById('hold-cta');
const progressBar = document.getElementById('progress-bar');
const totalLength = 276; // Dasharray value
let holdTimeline;

// Mouse hold progress calculation
cta.addEventListener('mousedown', () => {
  holdTimeline = gsap.to(progressBar, {
    strokeDashoffset: 0,
    duration: 1.2,
    ease: "power1.inOut",
    onComplete: triggerExplosion
  });
});

cta.addEventListener('mouseup', () => {
  if (holdTimeline) holdTimeline.reverse();
});

cta.addEventListener('mouseleave', () => {
  if (holdTimeline) holdTimeline.reverse();
});

```

### Step 3: GSAP Radial Scatter and Reveal Sequence

When the timeline completes, read the specific coordinate vectors mapped onto each element node to animate the explosion cleanly.

```javascript
function triggerExplosion() {
  const tl = gsap.timeline();

  tl.to(".scatter-item", {
    x: (i, target) => target.dataset.x + "px",
    y: (i, target) => target.dataset.y + "px",
    rotation: () => Math.random() * 40 - 20,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
  })
  .to("#hold-cta", { scale: 0, opacity: 0, duration: 0.4 }, 0)
  .to("#portfolio-canvas", { backgroundColor: "#0C2318", duration: 1 }, 0.2)
  .fromTo(".main-card-stack", {
    scale: 0.5,
    y: 500,
    opacity: 0
  }, {
    scale: 1,
    y: 0,
    opacity: 1,
    stagger: 0.1,
    duration: 1,
    ease: "power4.out"
  }, 0.4);
}

```

## 4. Key Details for Production Optimization

1. **Z-Indexing:** Keep the image layers slightly behind the textual typography vectors to preserve crisp font edges when layers pass over one another.
2. **Radial Scatter Values:** Use data attributes (`data-x`, `data-y`) to assign explicit flight directional vectors relative to the center of the viewport, ensuring elements don't bunch up into the same corners during the scatter.

```

```