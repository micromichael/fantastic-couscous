// Simple lightbox for all pages
(function () {
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;

  const lightboxImage = lightbox.querySelector(".lightbox-image");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");
  const closeBtn = lightbox.querySelector(".lightbox-close");

  function openLightbox(src, alt, caption) {
    if (!src) return;
    lightboxImage.src = src;
    lightboxImage.alt = alt || "";
    if (lightboxCaption) {
      lightboxCaption.textContent = caption || "";
    }
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    lightboxImage.alt = "";
    if (lightboxCaption) {
      lightboxCaption.textContent = "";
    }
  }

  document.querySelectorAll(".gallery-thumb").forEach((btn) => {
    btn.addEventListener("click", (evt) => {
      evt.preventDefault();
      const img = btn.querySelector("img");
      const fallbackSrc = img ? img.src : "";
      // 优先 data-full，如果没有就用 img.src
      const src = btn.getAttribute("data-full") || fallbackSrc;
      const alt = img ? img.alt : "";
      const captionAttr = btn.getAttribute("data-caption");
      const caption = captionAttr || alt || "";
      openLightbox(src, alt, caption);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeLightbox());
  }

  lightbox.addEventListener("click", (evt) => {
    if (evt.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
})();
