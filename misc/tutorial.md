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
        ├── static-maps/        ← drop map images here
        ├── data-engineering/   ← pipeline diagrams, architecture charts
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

### Image dimensions and display mode

The slide media area is a **5:3 landscape ratio** (close to 16:10). On a 1920×1080 display it's roughly 1300×780px; on 1440×900 it's closer to 970×600px. Exporting at **1600×960** covers both without upscaling.

The site is currently set to `object-fit: contain`, which shows the entire image with neutral padding on the sides or top/bottom when the image ratio doesn't match the slide. This is the safest choice for maps where cropping any part is undesirable.

The alternative is `object-fit: cover`, which fills the slide completely but crops anything outside the ratio. If you switch back to cover, you can control exactly which part of the image stays visible using `object-position` on each `<img>` tag:

```html
<!-- default: center of image (no attribute needed) -->
<img src="..." alt="...">

<!-- keep top of image visible — good for north-up maps with a title block at top -->
<img src="..." alt="..." style="object-position: top center">

<!-- keep left side visible -->
<img src="..." alt="..." style="object-position: left center">

<!-- fine-grained control: x% from left, y% from top -->
<img src="..." alt="..." style="object-position: 60% 30%">
```

To switch between modes, find this line in `css/style.css` and change the value:

```css
.slide-media img {
  object-fit: contain; /* change to "cover" to fill and crop */
}
```

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

### Allowing the portfolio to iframe a Django app (PythonAnywhere)

Django blocks iframing by default via its clickjacking protection middleware. Rather than opening it up to everyone, the cleanest approach is a custom middleware that whitelists only this portfolio's domain.

In your Django project, create a `middleware.py` file (or add to an existing one):

```python
class EmbedAllowlistMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['X-Frame-Options'] = 'ALLOWFROM https://your-github-username.github.io'
        response['Content-Security-Policy'] = "frame-ancestors 'self' https://your-github-username.github.io"
        return response
```

Then in `settings.py`:

```python
MIDDLEWARE = [
    # remove or comment out the default clickjacking middleware:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # add your allowlist middleware (adjust path to match your app):
    'yourapp.middleware.EmbedAllowlistMiddleware',
    ...
]
```

After saving, go to the **Web** tab in PythonAnywhere and hit **Reload**.

A few notes:
- `X-Frame-Options: ALLOWFROM` is the older header — browser support is inconsistent, but it's harmless to include
- `Content-Security-Policy: frame-ancestors` is what modern browsers actually enforce — this is the one that matters
- For local testing, add `http://localhost:5500` (or whatever port you use) as a space-separated value: `"frame-ancestors 'self' https://your-github-username.github.io http://localhost:5500"`
- Third-party sites you don't control (e.g. `fractracker.org`) set their own headers and cannot be iframed regardless of what you do here

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

### Building interactive maps without an Esri account

For the Custom Widgets section in particular, a common goal is embedding an interactive map built with the ArcGIS Maps SDK. Here's how to do it without needing ArcGIS Online.

**Skip Experience Builder** — it's a hosted no-code tool that requires an ArcGIS Online account to open. Instead, use the **ArcGIS Maps SDK for JavaScript** directly. It's more flexible, has no builder dependency, and produces a plain HTML/JS app you can host anywhere.

**Replace Esri services with free alternatives:**

| What you'd normally use Esri for | Free alternative |
|---|---|
| Basemap | Mapbox (free tier: 50k loads/month) or OpenStreetMap (unlimited) |
| Hosted feature layers | Your own GeoJSON — served as a static file or a Django endpoint |

A minimal account-free map setup:

```javascript
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer.js";

// Mapbox basemap (swap in your token)
const basemap = new WebTileLayer({
  urlTemplate: "https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=YOUR_TOKEN",
  tileInfo: /* standard 256px tile info */
});

// Your own GeoJSON — static file or Django endpoint
const dataLayer = new GeoJSONLayer({
  url: "https://your-site.com/api/data.geojson"
});

const map = new Map({ layers: [basemap, dataLayer] });
const view = new MapView({ container: "viewDiv", map });
```

The resulting app is a self-contained HTML/JS project you host on GitHub Pages or PythonAnywhere and embed in the portfolio via iframe — same as any other slide. The only credential involved is the Mapbox token, which can be restricted to your domain in the Mapbox dashboard.

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

By default the modal shows the slide's title and the short caption text. To add extended copy — methodology, tools used, client context, multiple paragraphs — add a hidden `<div class="slide-modal">` inside the `<article>` tag:

```html
<article class="carousel-slide">
  <div class="slide-content">
    <!-- ...media and caption as normal... -->
  </div>

  <div class="slide-modal" hidden>
    <p>First paragraph — overview of the project or map.</p>
    <p>Second paragraph — methodology, tools used, data sources.</p>
    <p>Third paragraph — outcome, client context, anything else relevant.</p>
  </div>
</article>
```

The `hidden` attribute keeps the div invisible on the page. When the More Info button is clicked, its `innerHTML` is read directly into the modal body, so any valid HTML works — paragraphs, lists, etc.:

```html
<div class="slide-modal" hidden>
  <p>Adirondack Park boundary rendered using LiDAR-derived elevation data.</p>
  <p>Produced in QGIS with a custom hillshade layer and contour styling at 50m intervals.</p>
  <ul>
    <li>Software: QGIS 3.28</li>
    <li>Data: NYS LiDAR 2019</li>
    <li>Output: 24×36 in, 300 DPI</li>
  </ul>
</div>
```

The modal title is always pulled from the `.slide-title` element — no separate attribute needed for that. If no `.slide-modal` div is present, the modal falls back to showing the short caption description.

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
