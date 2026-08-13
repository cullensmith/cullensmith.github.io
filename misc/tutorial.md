# How to Update Each Section

A reference for adding content, swapping images, wiring iframes, and expanding carousels across the five portfolio sections.

---

## Contents

1. [Folder & file structure](#1-folder--file-structure)
2. [Image sections — Static Maps, Spatial Analysis, 3D Models](#2-image-sections)
3. [Iframe sections — Full Stack, Custom Widgets](#3-iframe-sections)
4. [Adding or removing slides](#4-adding-or-removing-slides)
5. [Writing More Info modal content](#5-writing-more-info-modal-content)
6. [Updating titles and descriptions](#6-updating-titles-and-descriptions)

---

## 1. Folder & file structure

```
aug2026/
├── index.html              ← all section markup lives here
├── css/style.css           ← all styling
├── js/main.js              ← carousel + modal logic
└── assets/
    └── images/
        ├── static-maps/    ← drop map images here
        ├── spatial-analysis/
        └── 3d-models/
```

All content changes happen in `index.html`. CSS and JS only need to be touched if you're changing the design or adding new behavior.

---

## 2. Image sections

Applies to: **Static Maps**, **Spatial Analysis**, and **3D Models**.

### Replacing a placeholder with a real image

Find the slide with a `<div class="img-placeholder">` inside it and replace that entire div with a single `<img>` tag:

**Before:**
```html
<div class="slide-media slide-media--image">
  <div class="img-placeholder img-placeholder--map">
    <p class="ph-label">Map Image</p>
    <code class="ph-hint">assets/images/map-1.jpg</code>
  </div>
</div>
```

**After:**
```html
<div class="slide-media slide-media--image">
  <img src="assets/images/static-maps/your-file.jpg"
       alt="Descriptive alt text">
</div>
```

### Adding a new image slide

1. Drop the image file into the appropriate subfolder under `assets/images/`.
2. Find the section in `index.html` — each is marked with a comment like `<!-- ── Static Maps ──`.
3. Copy an existing `<article class="carousel-slide">` block and paste it before the closing `</div></div>` of the track.
4. Update the `src`, `alt`, title, and description.
5. Add one more dot button to the `.carousel-dots` div below the carousel.

A complete image slide:

```html
<article class="carousel-slide">
  <div class="slide-content">
    <div class="slide-media slide-media--image">
      <img src="assets/images/static-maps/your-file.jpg"
           alt="Brief description of the map">
    </div>
    <div class="slide-caption">
      <h3 class="slide-title">Map Title</h3>
      <p class="slide-desc">One or two sentences about the map.</p>
    </div>
  </div>
</article>
```

> **Supported formats:** JPG, PNG, WebP, and GIF all work. Images fill the full slide height so anything around 1800px wide is plenty.

---

## 3. Iframe sections

Applies to: **Full Stack** and **Custom Widgets**.

### Wiring a live app into a slide

Find the slide you want to update. Inside its `.slide-media` div you'll see a `<div class="frame-placeholder">`. Replace the entire placeholder div with an `<iframe>`:

**Before:**
```html
<div class="slide-media slide-media--frame">
  <div class="frame-placeholder">
    ...
  </div>
</div>
```

**After:**
```html
<div class="slide-media slide-media--frame">
  <iframe src="https://your-django-app.com"
          title="Project Name"
          loading="lazy"></iframe>
</div>
```

> **Cross-origin note:** The app being embedded needs to allow iframing. Make sure its server sends `X-Frame-Options: ALLOWALL` or a permissive `Content-Security-Policy: frame-ancestors` header. Apps hosted on the same domain should work without changes.

### A complete iframe slide:

```html
<article class="carousel-slide">
  <div class="slide-content">
    <div class="slide-media slide-media--frame">
      <iframe src="https://your-app.com"
              title="Project Name"
              loading="lazy"></iframe>
    </div>
    <div class="slide-caption">
      <h3 class="slide-title">Project Name</h3>
      <p class="slide-desc">What this app does and the stack behind it.</p>
    </div>
  </div>
</article>
```

---

## 4. Adding or removing slides

### Adding a slide

1. Copy any existing `<article class="carousel-slide">…</article>` block within the section.
2. Paste it immediately before the closing `</div></div>` of the `.carousel-track`.
3. Update the content inside the new slide.
4. Add one more dot button to the section's `.carousel-dots` div:

```html
<button class="carousel-dot" role="tab"
        aria-label="Slide 5" aria-selected="false"></button>
```

### Removing a slide

1. Delete the entire `<article class="carousel-slide">…</article>` block.
2. Remove one `<button class="carousel-dot">` from the section's `.carousel-dots` div.

> **Keep counts in sync:** the number of `.carousel-slide` elements must always equal the number of `.carousel-dot` buttons in the same section.

---

## 5. Writing More Info modal content

By default the modal shows the slide's title and the short caption description. To add extended copy — methodology, tools used, client context — add a `data-modal-detail` attribute to the `<article>` tag:

```html
<article class="carousel-slide"
         data-modal-detail="Adirondack Park boundary rendered using LiDAR-derived
elevation data. Produced in QGIS with a custom hillshade layer and contour styling
at 50m intervals. Final output at 24×36 inches, 300 DPI, for print.">
```

The modal title is always pulled from the `.slide-title` element — no separate attribute needed for that.

> **Multi-paragraph text:** Use two newlines between paragraphs inside the attribute value and they'll render as visual line breaks in the modal.

---

## 6. Updating titles and descriptions

Inside each `<article class="carousel-slide">` block, the caption lives at the bottom:

```html
<div class="slide-caption">
  <h3 class="slide-title">Your Title Here</h3>
  <p class="slide-desc">One or two sentences shown under the image.</p>
</div>
```

The `slide-title` also populates the modal heading automatically, so keeping it accurate matters for both places.

The section subtitles ("Cartographic design and print-ready map production", etc.) are in the `.section-sub` paragraph just below each section's `<h2>` — find the section by its comment and edit the text directly.
