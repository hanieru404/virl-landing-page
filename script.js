document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // ---------- MOBILE DRAWER GSAP TIMELINE ----------
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const mobileLogoBox = document.getElementById('mobile-logo-box');
  const body = document.body;

  let menuTl = gsap.timeline({ paused: true, reversed: true });
  let sequenceTl; // Globally declare for nav access

  // 1. Shift the navbar-wrapper UP solidly to ensure the close button avoids any overlapping visual weight
  menuTl.to(".navbar-wrapper", {
    y: -16, duration: 0.4, ease: "back.out(1.2)"
  }, 0)
  // 2. Hide Launch Button
  .to("#launch-btn-mobile", { 
    y: 20, opacity: 0, duration: 0.3, ease: "power2.in", display: "none" 
  }, 0)
  // 3. Hide Hamburger Icon
  .to("#hamburger-btn", { 
    width: 0, opacity: 0, padding: 0, margin: 0, duration: 0.3, ease: "power2.in", display: "none" 
  }, 0)
  // 4. Pill background goes clear
  .to("#mobile-pill", { 
    backgroundColor: "transparent", duration: 0.3 
  }, 0)
  // 5. Logo Box turns into Close Button (scales up a bit, centers)
  .to("#mobile-logo-box", { 
    scale: 1.25, cursor: "pointer", duration: 0.4, ease: "back.out(1.5)" 
  }, 0.2)
  // Morph inner icons
  .to("#mobile-ghost", { 
    rotation: 90, opacity: 0, duration: 0.2, display: "none" 
  }, 0.1)
  .fromTo("#mobile-close-icon", 
    { rotation: -90, opacity: 0 }, 
    { rotation: 0, opacity: 1, duration: 0.3, display: "block" }, 0.3
  )
  // Overlay pops up from bottom
  .to("#drawer-overlay", { 
    opacity: 1, pointerEvents: "auto", duration: 0.4 
  }, 0.2)
  // Drawer Box slides up
  .fromTo(".drawer-box", 
    { y: 40, scale: 0.98 }, 
    { y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" }, 0.2
  );

  function toggleMenu() {
    if (menuTl.reversed()) {
      body.style.overflow = 'hidden';
      menuTl.play();
    } else {
      body.style.overflow = '';
      menuTl.reverse();
    }
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMenu);
  if (mobileLogoBox) {
    mobileLogoBox.addEventListener('click', () => {
      if (!menuTl.reversed()) {
        toggleMenu(); // only closes if already open
      }
    });
  }

  // Close bg overlay click
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', (e) => {
      if (e.target === drawerOverlay && !menuTl.reversed()) toggleMenu();
    });
  }

  // Escape key close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menuTl.reversed()) toggleMenu();
  });

  // ---------- HOVER & ACTIVE HIGHLIGHT LOGIC ----------
  const navLinks = document.querySelectorAll('.nav-links-wrapper .nav-link');
  const activeHighlight = document.getElementById('nav-highlight');
  const hoverHighlight = document.getElementById('nav-hover-highlight');
  const wrapper = document.getElementById('nav-links-wrapper');
  
  function setHighlight(element, targetBlock) {
    if(!element || !targetBlock) return;
    const offsetLeft = element.offsetLeft;
    const width = element.offsetWidth;
    targetBlock.style.transform = `translateX(${offsetLeft}px)`;
    targetBlock.style.width = `${width}px`;
  }
  
  // Initialize Active Position
  const startActive = document.querySelector('.nav-links-wrapper .nav-link.active');
  if (startActive) {
    setTimeout(() => {
      setHighlight(startActive, activeHighlight);
    }, 50);
  }

  function updateNavHighlight(index) {
    const targetLink = navLinks[index];
    if (!targetLink) return;
    
    navLinks.forEach(l => l.classList.remove('active'));
    targetLink.classList.add('active');
    setHighlight(targetLink, activeHighlight);
  }

  // Hover & Click Events
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      if (link.classList.contains('dropdown')) return;
      setHighlight(link, hoverHighlight);
      if (hoverHighlight) hoverHighlight.style.opacity = "1";
    });
    
    link.addEventListener('click', (e) => {
      if (link.classList.contains('dropdown')) return;
      e.preventDefault();
      
      const index = parseInt(link.getAttribute('data-index'));
      let target = 0;

      if (index === 0) {
        target = document.querySelector('#gameplay').offsetTop;
      } else if (index === 1) {
        const st = ScrollTrigger.getById('gameplay-trigger');
        if (st && sequenceTl) {
          const progress = sequenceTl.labels["missions-setup"] / sequenceTl.duration();
          target = st.start + (st.end - st.start) * progress;
        } else {
          const gameplaySect = document.querySelector('#gameplay');
          target = gameplaySect.offsetTop + (gameplaySect.offsetHeight * 0.45);
        }
      } else if (index === 2) {
        target = document.querySelector('#intel').offsetTop;
      }

      gsap.to(window, {
        duration: 1.5,
        scrollTo: target,
        ease: "power2.inOut"
      });

      updateNavHighlight(index);
    });
  });

  if (wrapper && hoverHighlight) {
    wrapper.addEventListener('mouseleave', () => {
      hoverHighlight.style.opacity = "0";
    });
  }

  // ---------- HERO SCROLL ANIMATION TIMELINE ----------
  if (document.getElementById('mission')) {
    // 1. Fade the text out as we scroll away from the top naturally
    gsap.to(".hero-text-content", {
      scrollTrigger: {
        trigger: "#mission",
        start: "top top",
        end: "100% top", // Slower fade out along the transition
        scrub: true
      },
      y: -100,
      opacity: 0
    });

    // 2. Pin the shapes in the center and fold them
    const shapesTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".colorful-shapes-container",
        start: "center center",
        end: "+=220%", // Pin for longer during the full blank screen scroll
        pin: true,
        scrub: 1
      }
    });

    // Fold into the center staggeringly
    shapesTl.to(".gsap-shape", {
      x: (index) => (2 - index) * 196, // 180px width + 16px gap
      duration: 1.5,
      ease: "power2.inOut",
      stagger: 0.15 // First goes first
    })
    // Shrink down towards ~50px squarely
    .to(".gsap-shape", {
      scale: 50 / 180, 
      duration: 0.8,
      ease: "power2.inOut",
      stagger: 0.1
    }, "+=0.3")
    // Fade completely out right after shrinking
    .to(".gsap-shape", {
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      stagger: 0.1
    }, "-=0.2"); 
  }

  // ---------- CONTINUOUS WAVE ANIMATION FOR SOCIAL ICONS ----------
  gsap.to(".gsap-inner-shape", {
    scale: 0.75, // Deepen scale down for a bigger animation effect
    duration: 0.8,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    stagger: {
      each: 0.2,
      yoyo: true,
      repeat: -1
    }
  });

  // ---------- NEW SCROLLYTELLING SEQUENCE: SECTION 2 (SPLIT LAYOUT) ----------
  if (document.getElementById('gameplay')) {
    sequenceTl = gsap.timeline({
      scrollTrigger: {
        id: "gameplay-trigger",
        trigger: ".problem-sticky-wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        onUpdate: (self) => {
          if (!sequenceTl) return;
          const missionProgress = sequenceTl.labels["missions-setup"] / sequenceTl.duration();
          if (self.progress < missionProgress) {
            updateNavHighlight(0); // Mission highlight for first half
          } else {
            updateNavHighlight(1); // Gameplay highlight for second half
          }
        }
      }
    });

    // Also highlight Intel section when scrolled into
    ScrollTrigger.create({
      trigger: "#intel",
      start: "top center",
      end: "bottom center",
      onEnter: () => updateNavHighlight(2),
      onEnterBack: () => updateNavHighlight(2)
    });

    // 0. Manual Word & Letter Split for Right Col Text (Premium & Responsive)
    const splitLetters = (el) => {
      if(!el) return;
      const html = el.innerHTML;
      el.innerHTML = "";
      
      // Split by <br> tags first
      const lines = html.split(/<br\s*\/?>/i);
      
      lines.forEach((line, lineIndex) => {
        // Split line into words
        const words = line.trim().split(/\s+/);
        
        words.forEach((word) => {
          const wordSpan = document.createElement("span");
          wordSpan.style.display = "inline-block";
          wordSpan.style.whiteSpace = "nowrap"; // Keep the word whole
          
          word.split("").forEach(char => {
            const span = document.createElement("span");
            span.innerText = char;
            span.className = "letter";
            span.style.display = "inline-block";
            wordSpan.appendChild(span);
          });
          
          el.appendChild(wordSpan);
          // Add a standard space after each word
          el.appendChild(document.createTextNode(" "));
        });
        
        // Restore <br> if it's not the last line
        if (lineIndex < lines.length - 1) {
          el.appendChild(document.createElement("br"));
        }
      });
    }
    const probTitle = document.querySelector('.problem-summary-title');
    const probDesc = document.querySelector('.problem-summary-desc');
    const introTitle = document.querySelector('#virl-intro-block .virl-intro-title');
    const introDesc = document.querySelector('#virl-intro-block .virl-intro-desc');
    const missionsTitle = document.querySelector('#virl-missions-block .virl-intro-title');
    const missionsDesc = document.querySelector('#virl-missions-block .virl-intro-desc');
    const streaksTitle = document.querySelector('#virl-streaks-block .virl-intro-title');
    const streaksDesc = document.querySelector('#virl-streaks-block .virl-intro-desc');
    const badgesTitle = document.querySelector('#virl-badges-block .virl-intro-title');
    const badgesDesc = document.querySelector('#virl-badges-block .virl-intro-desc');
    
    const phoneBody = document.querySelector('.virl-phone-body');
    const phoneWrapper = document.querySelector('.virl-phone-wrapper');

    splitLetters(probTitle);
    splitLetters(probDesc);
    splitLetters(introTitle);
    splitLetters(introDesc);
    splitLetters(missionsTitle);
    splitLetters(missionsDesc);
    splitLetters(streaksTitle);
    splitLetters(streaksDesc);
    splitLetters(badgesTitle);
    splitLetters(badgesDesc);

    // ---------- SECTION 2 ENTRANCE & EXIT ANIMATIONS (Container Expansion) ----------
    const expandingContainer = document.getElementById('expanding-container');
    
    // 1. Entrance: Grows from 90% wide with 60px corners to 100% sharp
    gsap.fromTo(expandingContainer, 
      { 
        width: "90%", 
        borderRadius: "60px",
      },
      { 
        width: "100%", 
        borderRadius: "0px",
        scrollTrigger: {
          trigger: "#gameplay",
          start: "top bottom",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true
        }
      }
    );

    // 2. Exit: Shrinks back to 80% wide with 60px corners as you scroll away
    gsap.to(expandingContainer, {
      width: "80%",
      borderRadius: "60px",
      scrollTrigger: {
        trigger: "#gameplay",
        start: "bottom bottom", 
        end: "bottom top", 
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    const items = [1, 2, 3, 4];
    
    // ... existing card formation code ...

    // 1. APPEARING TRANSITION: Fade in and slide up the whole split layout
    sequenceTl.to(".stats-sequence-layout-split", {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out"
    });

    // 2. INITIAL PHASE: Expand summary cards (pills) width
    sequenceTl.to(".summary-card", {
      width: "100%",
      stagger: 0.1,
      duration: 1,
      ease: "power2.inOut"
    }, "-=0.5");

    sequenceTl.to(".summary-info, .summary-icon-box", {
      opacity: 1,
      duration: 0.5
    }, "-=0.3");

    // 3. SEQUENTIAL REVEAL PHASES
    items.forEach((id) => {
      const label = `phase-${id}`;
      
      // Activate current pill
      sequenceTl.to(`#seq-${id} .summary-card`, {
        className: "summary-card active",
        duration: 0.3
      }, label);

      // Expand Detail Card
      sequenceTl.to(`#seq-${id} .detail-card`, {
        height: "auto",
        duration: 1,
        ease: "power2.inOut",
        visibility: "visible",
        borderColor: "#111"
      }, label);

      // Reveal Detail Content
      sequenceTl.to(`#seq-${id} .detail-card > *`, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.8
      }, `${label}+=0.2`);

      // Trigger micro-animations
      if (id === 1) {
        const segments = [
          { id: "purple", offset: 125.6 }, // 50%
          { id: "green", offset: 188.5 },  // 25%
          { id: "orange", offset: 213.6 }, // 15%
          { id: "yellow", offset: 226.2 }  // 10%
        ];
        segments.forEach((seg, i) => {
          sequenceTl.fromTo(`#donut-${seg.id}`, 
            { strokeDashoffset: 251.3 }, 
            { strokeDashoffset: seg.offset, duration: 1.2, ease: "power2.out" }, 
            `${label}+=0.4`
          );
        });
      } else if (id === 2) {
        sequenceTl.from("#seq-2 .bar-fill", {
          width: "0%",
          duration: 1.5,
          stagger: 0.2,
          ease: "power4.out"
        }, `${label}+=0.5`);
      } else if (id === 3) {
        sequenceTl.to("#social-decline-path", {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power1.inOut"
        }, `${label}+=0.5`);
        
        sequenceTl.to("#arrowhead-dot", {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out"
        }, `${label}+=2.2`);
      }

      // Hold state
      sequenceTl.to({}, { duration: 2.5 });

      // Close if not last
      if (id < 4) {
        sequenceTl.to(`#seq-${id} .detail-card`, {
          height: 0,
          duration: 1,
          ease: "power2.in",
          visibility: "hidden",
          borderColor: "transparent"
        });
        sequenceTl.to(`#seq-${id} .summary-card`, {
          className: "summary-card",
          duration: 0.5
        }, "-=0.5");
      }
    });

    // --- NEW TRANSITION: FROM PROBLEM TO INTRO ---
    
    const transitionLabel = "transition-start";

    // 1. Close 4th detail
    sequenceTl.to("#seq-4 .detail-card", {
      height: 0,
      duration: 1,
      ease: "power2.in",
      visibility: "hidden",
      borderColor: "transparent"
    }, transitionLabel);

    // 2. Make all active and morph to circles
    sequenceTl.to(".summary-card", {
      className: "summary-card active circle-mode",
      duration: 1.5,
      stagger: 0.15,
      ease: "power3.inOut"
    }, `${transitionLabel}+=0.5`);

    // 3. Formation Move: Collapse vertical stack into a horizontal line
    // Animating the wrapper containers to overlap at the center
    sequenceTl.to("#seq-1", { y: 150, duration: 1.2, ease: "power2.inOut" }, `${transitionLabel}+=1.2`);
    sequenceTl.to("#seq-2", { y: 50, duration: 1.2, ease: "power2.inOut" }, `${transitionLabel}+=1.2`);
    sequenceTl.to("#seq-3", { y: -50, duration: 1.2, ease: "power2.inOut" }, `${transitionLabel}+=1.2`);
    sequenceTl.to("#seq-4", { y: -150, duration: 1.2, ease: "power2.inOut" }, `${transitionLabel}+=1.2`);

    // Spread the circles horizontally now that they are baseline-aligned
    sequenceTl.to("#seq-4 .summary-card", { x: 120, duration: 1.2, ease: "back.out(1.5)" }, `${transitionLabel}+=1.2`);
    sequenceTl.to("#seq-3 .summary-card", { x: 40, duration: 1.2, ease: "back.out(1.5)" }, `${transitionLabel}+=1.2`);
    sequenceTl.to("#seq-2 .summary-card", { x: -40, duration: 1.2, ease: "back.out(1.5)" }, `${transitionLabel}+=1.2`);
    sequenceTl.to("#seq-1 .summary-card", { x: -120, duration: 1.2, ease: "back.out(1.5)" }, `${transitionLabel}+=1.2`);

    // 4. Fade problem text by letter
    sequenceTl.to("#problem-text-block .letter", {
      opacity: 0,
      y: -20,
      stagger: 0.015,
      duration: 0.8,
      ease: "power2.in"
    }, transitionLabel);

    // 5. Circles overlap and pop out
    sequenceTl.to(".summary-card", {
      x: 0,
      opacity: 0,
      scale: 0.5,
      duration: 1,
      stagger: 0.1,
      ease: "power2.in"
    }, "+=0.5");

    // 6. Slide problem block away and hide formation container
    sequenceTl.to("#problem-text-block", {
      y: -150,
      opacity: 0,
      duration: 1.2,
      display: "none"
    }, "-=0.8");

    sequenceTl.to("#cards-formation-container", {
      display: "none",
      duration: 0
    });

    // 7. Reveal Intro Block (Better centered + Letter Stagger)
    sequenceTl.to("#virl-intro-block", {
      opacity: 1,
      pointerEvents: "auto",
      duration: 0.1
    }, "+=0.2");

    sequenceTl.fromTo("#virl-intro-block .virl-intro-title .letter", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, stagger: 0.02, duration: 0.8, ease: "power4.out" }
    );

    sequenceTl.fromTo(".virl-intro-accent",
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.8, ease: "expo.out" },
      "-=0.4"
    );

    sequenceTl.fromTo("#virl-intro-block .virl-intro-desc .letter", 
      { opacity: 0, y: 10 }, 
      { opacity: 1, y: 0, stagger: 0.005, duration: 0.6, ease: "power2.out" },
      "-=0.6"
    );

    // 1. Zoom in the phone (Perfectly centered for intro/subsection 2)
    sequenceTl.to(".virl-phone-wrapper", {
      opacity: 1,
      scale: 1,
      y: 0, 
      duration: 1.5,
      ease: "power3.out"
    }, "-=1");

    // Reveal sparkles with a pop
    sequenceTl.from(".sparkle", {
      scale: 0,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: "back.out(2)"
    }, "-=0.5");

    // 8. TRANSITION TO ALL MISSION ICONS REVEAL
    const missionSetupLabel = "missions-setup";

    // 6. Fade intro text and slide the entire right column down for flat stage
    sequenceTl.to("#virl-intro-block .letter", { opacity: 0, y: -20, stagger: 0.01, duration: 0.5 }, missionSetupLabel);
    sequenceTl.to(".virl-intro-accent", { scaleX: 0, opacity: 0, duration: 0.5 }, missionSetupLabel);

    // 7. Coordinate layout: Shift entire right half down as we enter mission sequence
    sequenceTl.to(".sequence-right-col", { y: 100, duration: 1.5, ease: "power2.inOut" }, missionSetupLabel);
    sequenceTl.to(".virl-phone-body", {
      rotateX: 55, 
      rotateY: 0,
      rotateZ: 0,
      y: 20, 
      duration: 1.5,
      ease: "power2.inOut",
      onStart: () => phoneBody.classList.add('is-flat'),
      onReverseComplete: () => phoneBody.classList.remove('is-flat')
    }, missionSetupLabel);

    // ALL ICONS ZOOM OUT: Relative to phone height (Moved up slightly)
    sequenceTl.to("#mission-item-1", { opacity: 1, scale: 1, x: -180, y: -110, duration: 1, ease: "power2.out" }, `${missionSetupLabel}+=0.5`);
    sequenceTl.to("#mission-item-2", { opacity: 1, scale: 1, x: -100, y: -210, duration: 1, ease: "power2.out" }, `${missionSetupLabel}+=0.7`);
    sequenceTl.to("#mission-item-3", { opacity: 1, scale: 1, x: 60, y: -150, duration: 1, ease: "power2.out" }, `${missionSetupLabel}+=0.9`);

    sequenceTl.to({}, { duration: 1 }); // Brief pause before sequences start

    // --- STAGE 1: MISSIONS EXPANSION ---
    const stage1Label = "stage-1";
    
    // Fade in Stage 1 Text
    sequenceTl.fromTo("#virl-missions-block", { opacity: 0, y: 30 }, { opacity: 1, y: -70, pointerEvents: "auto", duration: 0.2 }, stage1Label);
    sequenceTl.fromTo("#virl-missions-block .letter", { opacity: 0, y: 20 }, { opacity: 1, y: -70, stagger: 0.005, duration: 0.8 }, stage1Label);

    // Expand Icon 1: Pill Width then Body Height
    sequenceTl.to("#mission-pill-1", {
      width: 180,
      borderRadius: "16px",
      duration: 0.6,
      ease: "power2.inOut"
    }, stage1Label);

    sequenceTl.to("#mission-pill-1 .circle-detail-content", { opacity: 1, duration: 0.3 }, "-=0.3");

    sequenceTl.to("#mission-body-1", {
      height: 140,
      opacity: 1,
      paddingTop: 15,
      paddingBottom: 15,
      duration: 0.6,
      ease: "power2.inOut"
    });

    sequenceTl.to({}, { duration: 4 }); // Hold

    // --- STAGE 2: STREAKS EXPANSION ---
    const stage2Label = "stage-2";

    // Text Swap
    sequenceTl.to("#virl-missions-block .letter", { opacity: 0, y: -20, stagger: 0.003, duration: 0.5 }, stage2Label);
    sequenceTl.fromTo("#virl-streaks-block", { opacity: 0, y: 30 }, { opacity: 1, y: -70, pointerEvents: "auto", duration: 0.2 }, stage2Label);
    sequenceTl.fromTo("#virl-streaks-block .letter", { opacity: 0, y: 20 }, { opacity: 1, y: -70, stagger: 0.005, duration: 0.8 }, stage2Label);

    // Collapse Icon 1 Body AND Pill
    sequenceTl.to("#mission-body-1", { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, duration: 0.4 }, stage2Label);
    sequenceTl.to("#mission-pill-1 .circle-detail-content", { opacity: 0, duration: 0.2 }, stage2Label);
    sequenceTl.to("#mission-pill-1", { width: 50, borderRadius: "100px", duration: 0.4, ease: "power2.inOut" }, stage2Label);

    // Expand Icon 2: Pill Width then Body Height
    sequenceTl.to("#mission-pill-2", {
      width: 180,
      borderRadius: "16px",
      duration: 0.6,
      ease: "power2.inOut"
    });

    sequenceTl.to("#mission-pill-2 .circle-detail-content", { opacity: 1, duration: 0.3 }, "-=0.3");

    sequenceTl.to("#mission-body-2", {
      height: 180,
      opacity: 1,
      paddingTop: 15,
      paddingBottom: 15,
      duration: 0.6,
      ease: "power2.inOut"
    });

    sequenceTl.to({}, { duration: 4 }); // Hold

    // --- STAGE 3: BADGES EXPANSION ---
    const stage3Label = "stage-3";

    // Text Swap
    sequenceTl.to("#virl-streaks-block .letter", { opacity: 0, y: -20, stagger: 0.003, duration: 0.5 }, stage3Label);
    sequenceTl.fromTo("#virl-badges-block", { opacity: 0, y: 30 }, { opacity: 1, y: -70, pointerEvents: "auto", duration: 0.2 }, stage3Label);
    sequenceTl.fromTo("#virl-badges-block .letter", { opacity: 0, y: 20 }, { opacity: 1, y: -70, stagger: 0.005, duration: 0.8 }, stage3Label);

    // Collapse Icon 2 Body AND Pill
    sequenceTl.to("#mission-body-2", { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, duration: 0.4 }, stage3Label);
    sequenceTl.to("#mission-pill-2 .circle-detail-content", { opacity: 0, duration: 0.2 }, stage3Label);
    sequenceTl.to("#mission-pill-2", { width: 50, borderRadius: "100px", duration: 0.4, ease: "power2.inOut" }, stage3Label);

    // Expand Icon 3: Pill Width then Body Height
    sequenceTl.to("#mission-pill-3", {
      width: 180,
      borderRadius: "16px",
      duration: 0.6,
      ease: "power2.inOut"
    });

    sequenceTl.to("#mission-pill-3 .circle-detail-content", { opacity: 1, duration: 0.3 }, "-=0.3");

    sequenceTl.to("#mission-body-3", {
      height: 160,
      opacity: 1,
      paddingTop: 15,
      paddingBottom: 15,
      duration: 0.6,
      ease: "power2.inOut"
    });

    sequenceTl.to({}, { duration: 5 }); // Final Hold

    // --- OUTRO SEQUENCE ---
    const outroLabel = "section-2-outro";

    // 1. Fade out the last text block
    sequenceTl.to("#virl-badges-block .letter", { opacity: 0, y: -20, stagger: 0.003, duration: 0.5 }, outroLabel);

    // 2. Collapse the last card
    sequenceTl.to("#mission-body-3", { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, duration: 0.4 }, outroLabel);
    sequenceTl.to("#mission-pill-3 .circle-detail-content", { opacity: 0, duration: 0.2 }, outroLabel);
    sequenceTl.to("#mission-pill-3", { width: 50, borderRadius: "100px", duration: 0.4, ease: "power2.inOut" }, outroLabel);

    // 3. Icons suck back into the phone (Center of the phone)
    sequenceTl.to(".mission-item-container", {
      x: 0,
      y: 0,
      scale: 0,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "back.in(1.2)"
    }, outroLabel);

    // 5. Final exit: Phone rises back out (Let the outer ScrollTrigger handle the fade/scale of container)
    sequenceTl.to(".virl-phone-body", {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      y: 0,
      scale: 0.8,
      duration: 1.2,
      ease: "power3.inOut"
    }, `${outroLabel}+=0.5`);

    // 6. Transition body background back to dark for next section
    sequenceTl.to("body", { backgroundColor: "#111", duration: 1 }, "-=0.5");
  }

  // ---------- INTERACTIVE MOUSE TILT FOR PHONE ----------
  const phoneWrapperEl = document.querySelector('#intro-phone-wrapper');
  const phoneBodyEl = document.querySelector('.virl-phone-body');

  if (phoneWrapperEl && phoneBodyEl) {
    phoneWrapperEl.addEventListener('mousemove', (e) => {
      // Strictly block tilt if phone is flat
      if (phoneBodyEl.classList.contains('is-flat')) return;
      
      const rect = phoneWrapperEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotX = ((y - centerY) / centerY) * -15; 
      const rotY = ((x - centerX) / centerX) * 15;
      
      gsap.to(phoneBodyEl, {
        rotateX: 15 + rotX,
        rotateY: -25 + rotY,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto"
      });
    });

    phoneWrapperEl.addEventListener('mouseleave', () => {
      if (phoneBodyEl.classList.contains('is-flat')) return;
      
      gsap.to(phoneBodyEl, {
        rotateX: 15,
        rotateY: -25,
        rotateZ: 0,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
  }


  // ---------- SCROLLTRIGGER FOR INTEL SECTION BACKGROUND MATCHING ----------
  if (document.querySelector('#intel')) {
    ScrollTrigger.create({
      trigger: "#intel",
      start: "top center", 
      end: "bottom center",
      onEnter: () => gsap.to("body", { backgroundColor: "#111", duration: 0.5 }),
      onLeaveBack: () => gsap.to("body", { backgroundColor: "#ff5100", duration: 0.5 })
    });
  }

  // ---------- INTRO ANIMATIONS ----------
  gsap.from(".hero-text-content", {
    y: 50, opacity: 0, duration: 1, ease: "power3.out"
  });
  
  gsap.from(".gsap-shape", {
    y: 80, scale: 0.5, opacity: 0, duration: 1, stagger: 0.1, delay: 0.3, ease: "back.out(1.5)"
  });

  // ---------- SMOOTH SCROLLING FOR NAVBAR ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      if (this.getAttribute('href') === '#') return;
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Mobile drawer close if open
        if (!menuTl.reversed()) {
          toggleMenu();
        }
        
        gsap.to(window, { 
            duration: 1.2, 
            scrollTo: {y: targetElement, offsetY: 40}, 
            ease: "power3.inOut" 
        });
      }
    });
  });
});
