"use strict";

/**
 * Files: img/edo/001-119.jpg
 * Seasons:
 * 001–042 spring
 * 043–072 summer
 * 073–098 autumn
 * 099–119 winter
 */

const TOTAL = 119;

function pad3(n) {
  return String(n).padStart(3, "0");
}

function seasonOf(i) {
  if (i >= 1 && i <= 42) return "spring";
  if (i >= 43 && i <= 72) return "summer";
  if (i >= 73 && i <= 98) return "autumn";
  return "winter";
}

function seasonLabel(season) {
  return { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" }[season] || "All";
}

function buildItems() {
  const items = [];
  for (let i = 1; i <= TOTAL; i++) {
    const id = pad3(i);
    items.push({
      i,
      id,
      season: seasonOf(i),
      src: `img/edo/${id}.jpg`,
      alt: `One Hundred Famous Views of Edo — Print ${id}`
    });
  }
  return items;
}

const state = {
  items: buildItems(),
  filter: "all",
  sort: "order",
  visibleList: [],
  viewerIndex: -1
};

const els = {
  gallery: document.getElementById("gallery"),
  statusLine: document.getElementById("statusLine"),

  filterLinks: Array.from(document.querySelectorAll(".filter-link")),
  sortLinks: Array.from(document.querySelectorAll(".sort-link")),

  viewer: document.getElementById("viewer"),
  viewerImg: document.getElementById("viewerImg"),
  viewerId: document.getElementById("viewerId"),
  viewerScrim: document.getElementById("viewerScrim"),

  aboutOpen: document.getElementById("aboutOpen"),
  aboutDialog: document.getElementById("aboutDialog"),
  aboutClose: document.getElementById("aboutClose")
};

function setActive(links, predicate) {
  for (const a of links) {
    const active = predicate(a);
    a.classList.toggle("is-active", active);
    if (active) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  }
}

function applyFilterSort() {
  let list = [...state.items];

  if (state.filter !== "all") {
    list = list.filter(it => it.season === state.filter);
  }

  if (state.sort === "order") {
    list.sort((a, b) => a.i - b.i);
  } else if (state.sort === "random") {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }

  state.visibleList = list;
  return list;
}

function updateStatusLine(count) {
  const f = state.filter === "all" ? "All" : seasonLabel(state.filter);
  const s = state.sort === "order" ? "Order" : "Random";
  els.statusLine.textContent = `Filter: ${f} • Sort: ${s} • ${count} items`;
}

function render() {
  const list = applyFilterSort();
  updateStatusLine(list.length);

  els.gallery.innerHTML = "";
  const frag = document.createDocumentFragment();

  for (let idx = 0; idx < list.length; idx++) {
    const it = list[idx];

    const fig = document.createElement("figure");
    fig.className = "card";
    fig.dataset.season = it.season;
    fig.setAttribute("role", "listitem");

    const link = document.createElement("a");
    link.href = "#";
    link.setAttribute("aria-label", `Open print ${it.id} in full-screen`);
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openViewerByVisibleIndex(idx);
    });

    const img = document.createElement("img");
    img.className = "thumb";
    img.loading = "lazy";
    img.src = it.src;
    img.alt = it.alt;

    const meta = document.createElement("div");
    meta.className = "card-meta";

    const num = document.createElement("span");
    num.className = "mono";
    num.textContent = `#${it.id}`;

    const season = document.createElement("span");
    season.className = "mono";
    season.textContent = seasonLabel(it.season);

    meta.appendChild(num);
    meta.appendChild(season);

    link.appendChild(img);
    fig.appendChild(link);
    fig.appendChild(meta);
    frag.appendChild(fig);
  }

  els.gallery.appendChild(frag);
}

/* Fullscreen viewer */
function openViewerByVisibleIndex(visibleIdx) {
  state.viewerIndex = visibleIdx;
  updateViewer();
  openViewer();
}

function openViewer() {
  els.viewer.hidden = false;
  els.viewer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeViewer() {
  els.viewer.hidden = true;
  els.viewer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function updateViewer() {
  const list = state.visibleList;
  if (!list.length) return;

  if (state.viewerIndex < 0) state.viewerIndex = 0;
  if (state.viewerIndex >= list.length) state.viewerIndex = list.length - 1;

  const it = list[state.viewerIndex];
  els.viewerImg.src = it.src;
  els.viewerImg.alt = it.alt;

  // number + season in fullscreen
  els.viewerId.textContent = `#${it.id} • ${seasonLabel(it.season)}`;

  const prev = list[state.viewerIndex - 1];
  const next = list[state.viewerIndex + 1];
  if (prev) new Image().src = prev.src;
  if (next) new Image().src = next.src;
}

function viewerNext() {
  if (!state.visibleList.length) return;
  state.viewerIndex = Math.min(state.viewerIndex + 1, state.visibleList.length - 1);
  updateViewer();
}

function viewerPrev() {
  if (!state.visibleList.length) return;
  state.viewerIndex = Math.max(state.viewerIndex - 1, 0);
  updateViewer();
}

/* About modal helpers */
function openModal(modalEl) {
  modalEl.hidden = false;
  document.body.style.overflow = "hidden";
  const focusable = modalEl.querySelector('a, [tabindex]:not([tabindex="-1"])');
  if (focusable) focusable.focus();
}

function closeModal(modalEl) {
  modalEl.hidden = true;
  document.body.style.overflow = "";
}

function onKeyDown(e) {
  if (!els.viewer.hidden) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeViewer();
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      viewerNext();
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      viewerPrev();
      return;
    }
  }

  if (!els.aboutDialog.hidden) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal(els.aboutDialog);
      return;
    }
  }
}

function wireControls() {
  for (const a of els.filterLinks) {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      state.filter = a.dataset.filter;
      setActive(els.filterLinks, (x) => x.dataset.filter === state.filter);
      render();
    });
  }

  for (const a of els.sortLinks) {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      state.sort = a.dataset.sort;
      setActive(els.sortLinks, (x) => x.dataset.sort === state.sort);
      render();
    });
  }

  els.viewerScrim.addEventListener("click", closeViewer);
  els.viewer.addEventListener("click", (e) => {
    if (e.target === els.viewer) closeViewer();
  });

  els.aboutOpen.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(els.aboutDialog);
  });

  els.aboutClose.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(els.aboutDialog);
  });

  for (const scrim of document.querySelectorAll(".modal-scrim")) {
    scrim.addEventListener("click", () => {
      const parent = scrim.closest(".modal");
      if (parent) closeModal(parent);
    });
  }

  document.addEventListener("keydown", onKeyDown);
}

function init() {
  setActive(els.filterLinks, (x) => x.dataset.filter === "all");
  setActive(els.sortLinks, (x) => x.dataset.sort === "order");
  wireControls();
  render();
}

init();
