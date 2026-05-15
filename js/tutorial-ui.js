export class TutorialUI {
  constructor(config, steps) {
    this.config = config;
    this.steps = steps;
    this.currentStepIndex = 0;
    this.isActive = false;
    this.spotlightEl = null;
    this.modalEl = null;
    this.overlayEl = null;
    this.loadedHTMLs = {};

    this.init();
  }

  init() {
    this.createOverlay();
    this.createSpotlight();
    this.createModal();
    this.loadAllStepHTMLs();
    this.restoreProgress();
  }

  createOverlay() {
    this.overlayEl = document.createElement("div");
    this.overlayEl.className = "tutorial-overlay";
    Object.assign(this.overlayEl.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.6)",
      zIndex: this.config.modalZIndex - 1,
      opacity: "0",
      pointerEvents: "none",
      transition: "opacity 0.3s ease-in-out"
    });
    document.body.appendChild(this.overlayEl);
  }

  createSpotlight() {
    this.spotlightEl = document.createElement("div");
    this.spotlightEl.className = "tutorial-spotlight";
    Object.assign(this.spotlightEl.style, {
      position: "fixed",
      border: this.config.spotlightBorder,
      background: this.config.spotlightColor,
      borderRadius: "12px",
      zIndex: this.config.spotlightZIndex,
      pointerEvents: "none",
      transition: this.config.spotlightTransition,
      boxShadow: "0 0 0 9999px rgba(5, 20, 36, 0.85)",
      opacity: "0"
    });
    document.body.appendChild(this.spotlightEl);
  }

  createModal() {
    this.modalEl = document.createElement("div");
    this.modalEl.className = "tutorial-modal";
    Object.assign(this.modalEl.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "450px",
      width: "90%",
      maxHeight: "85vh",
      overflow: "auto",
      padding: "0",
      margin: "0",
      border: "none",
      borderRadius: "0",
      background: "transparent",
      backdropFilter: "none",
      zIndex: this.config.modalZIndex + 1,
      opacity: "0",
      pointerEvents: "none",
      transition: "opacity 0.3s ease-in-out"
    });
    document.body.appendChild(this.modalEl);
  }

  async loadAllStepHTMLs() {
    for (const step of this.steps) {
      try {
        const response = await fetch(step.htmlFile);
        if (response.ok) {
          this.loadedHTMLs[step.id] = await response.text();
        }
      } catch (e) {
        console.warn(`Could not load HTML for step ${step.id}:`, e);
      }
    }
  }

  start() {
    const savedStep = this.getSavedProgress();
    this.currentStepIndex = savedStep ? savedStep.stepIndex : 0;
    this.isActive = true;
    this.showStep(this.steps[this.currentStepIndex]);
  }

  showStep(step) {
    const html = this.loadedHTMLs[step.id];
    if (html) {
      const bodyContent = this.extractBodyContent(html);
      this.modalEl.innerHTML = bodyContent;
      this.applyStyles(bodyContent);
      this.attachStepListeners(step);
    }

    this.positionSpotlight(step);
    this.showElements();
    this.saveProgress();
  }

  extractBodyContent(html) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }
    const bodyWithoutTags = html.replace(/<[^>]+>/g, '');
    return html;
  }

  applyStyles(html) {
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) {
      const styleContent = styleMatch[1];
      const existingStyle = document.getElementById('tutorial-dynamic-styles');
      if (existingStyle) {
        existingStyle.textContent = styleContent;
      } else {
        const styleEl = document.createElement('style');
        styleEl.id = 'tutorial-dynamic-styles';
        styleEl.textContent = styleContent;
        document.head.appendChild(styleEl);
      }
    }
  }

  positionSpotlight(step) {
    if (step.spotlightTarget) {
      const targets = step.spotlightTarget.split(",").map(s => s.trim());
      let rects = [];

      for (const selector of targets) {
        const el = document.querySelector(selector);
        if (el) {
          rects.push(el.getBoundingClientRect());
        }
      }

      if (rects.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
        for (const rect of rects) {
          minX = Math.min(minX, rect.left);
          minY = Math.min(minY, rect.top);
          maxX = Math.max(maxX, rect.right);
          maxY = Math.max(maxY, rect.bottom);
        }

        const padding = 8;
        Object.assign(this.spotlightEl.style, {
          left: `${minX - padding}px`,
          top: `${minY - padding}px`,
          width: `${maxX - minX + padding * 2}px`,
          height: `${maxY - minY + padding * 2}px`,
          opacity: "1"
        });
      }
    } else {
      Object.assign(this.spotlightEl.style, {
        left: "50%",
        top: "50%",
        width: "90%",
        height: "80%",
        transform: "translate(-50%, -50%)",
        opacity: "1"
      });
    }
  }

  showElements() {
    this.overlayEl.style.opacity = "1";
    this.overlayEl.style.pointerEvents = "auto";
    this.modalEl.style.opacity = "1";
    this.modalEl.style.pointerEvents = "auto";
  }

  hideElements() {
    this.overlayEl.style.opacity = "0";
    this.overlayEl.style.pointerEvents = "none";
    this.spotlightEl.style.opacity = "0";
    this.modalEl.style.opacity = "0";
    this.modalEl.style.pointerEvents = "none";
  }

  attachStepListeners(step) {
    const modal = this.modalEl;
    const navButtons = modal.querySelectorAll(".nav-btn, .action-btn, button");

    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const text = btn.textContent.trim().toLowerCase();

        if (text.includes("saltar") || text.includes("skip")) {
          this.skip();
        } else if (text.includes("finalizar") || text.includes("finish")) {
          this.finish();
        } else if (text.includes("siguiente") || text.includes("next") || text.includes("comenzar")) {
          this.next();
        } else {
          this.next();
        }
      });
    });

    const primaryBtn = modal.querySelector(".nav-btn.primary, .action-btn");
    if (primaryBtn) {
      primaryBtn.style.background = "linear-gradient(135deg, var(--primary), var(--primary-container))";
      primaryBtn.style.color = "var(--on-primary)";
    }
  }

  next() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.showStep(this.steps[this.currentStepIndex]);
    } else {
      this.finish();
    }
  }

  skip() {
    this.finish();
  }

  finish() {
    this.hideElements();
    this.isActive = false;
    this.clearProgress();
    this.showSimulator();
  }

  showSimulator() {
    const tutorialModal = document.getElementById("tutorial-modal");
    if (tutorialModal) {
      tutorialModal.style.display = "none";
    }
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.style.display = "flex";
    }
  }

  saveProgress() {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify({
        stepIndex: this.currentStepIndex,
        completed: false,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn("Could not save tutorial progress:", e);
    }
  }

  getSavedProgress() {
    try {
      const saved = localStorage.getItem(this.config.storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  clearProgress() {
    try {
      localStorage.removeItem(this.config.storageKey);
    } catch (e) {
      console.warn("Could not clear tutorial progress:", e);
    }
  }

  restoreProgress() {
    const saved = this.getSavedProgress();
    if (saved && !saved.completed) {
      this.currentStepIndex = saved.stepIndex;
    }
  }

  updateSpotlight() {
    const step = this.steps[this.currentStepIndex];
    if (step) {
      this.positionSpotlight(step);
    }
  }
}