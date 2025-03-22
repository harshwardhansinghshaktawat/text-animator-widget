class TextAnimator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return [
      'before-text', 'static-text', 'after-text', 'repeating-text', 'heading-tag',
      'font-size', 'font-family', 'text-color', 'fill-color', 'cursor-symbol',
      'cursor-color', 'background-color', 'animation-duration'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.handleResize = () => this.render();
    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    if (this.cursorTl) this.cursorTl.kill();
    if (this.boxTl) this.boxTl.kill();
    if (this.masterTl) this.masterTl.kill();
  }

  render() {
    const beforeText = this.getAttribute('before-text') || '';
    const staticText = this.getAttribute('static-text') || 'Hello, I’m';
    const afterText = this.getAttribute('after-text') || '';
    const repeatingText = this.getAttribute('repeating-text') || 'Creative.,Coder.';
    const headingTag = this.getAttribute('heading-tag') || 'h1';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 5.4; // In vw
    const fontFamily = this.getAttribute('font-family') || 'Poppins';
    const textColor = this.getAttribute('text-color') || '#26A69A'; // Teal
    const fillColor = this.getAttribute('fill-color') || '#F4A261'; // Orange
    const cursorSymbol = this.getAttribute('cursor-symbol') || '_';
    const cursorColor = this.getAttribute('cursor-color') || '#FFFFFF'; // White
    const backgroundColor = this.getAttribute('background-color') || '#1A1A1A'; // Dark gray
    const animationDuration = parseFloat(this.getAttribute('animation-duration')) || 1; // Seconds

    // Load GSAP dynamically
    if (!window.gsap) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.5/gsap.min.js';
      script.onload = () => this.animate();
      document.head.appendChild(script);
    } else {
      this.animate();
    }

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');

        :host {
          width: 100vw;
          height: 100vh;
          margin: 0;
          display: flex;
          align-items: center;
          background: ${backgroundColor};
          overflow: hidden;
        }

        ${headingTag} {
          position: relative;
          font-size: ${fontSize}vw;
          font-family: ${fontFamily}, sans-serif;
          font-weight: bold;
          padding-left: 15vw;
          color: ${textColor};
          display: inline-block;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          line-height: 1.2;
        }

        .box {
          position: absolute;
          bottom: 0;
          left: 15vw;
          display: inline-block;
          background: ${fillColor};
          height: 1vw;
          width: 0;
          z-index: -1;
        }

        .before, .static, .after, .text {
          display: inline-block;
        }

        .cursor {
          display: inline-block;
          color: ${cursorColor};
          font-size: ${fontSize}vw;
        }
      </style>
      <${headingTag}>
        <span class="before">${beforeText}</span>
        <span class="box"></span>
        <span class="static">${staticText}</span>
        <span class="text"></span>
        <span class="after">${afterText}</span>
        <span class="cursor">${cursorSymbol}</span>
      </${headingTag}>
    `;

    this.animate = () => {
      // Clean up previous animations
      if (this.cursorTl) this.cursorTl.kill();
      if (this.boxTl) this.boxTl.kill();
      if (this.masterTl) this.masterTl.kill();

      const staticElement = this.shadowRoot.querySelector('.static');
      const boxElement = this.shadowRoot.querySelector('.box');

      // Wait for DOM to render, then calculate dimensions
      requestAnimationFrame(() => {
        const staticWidth = staticElement.offsetWidth; // Pixels
        const staticHeight = staticElement.offsetHeight; // Pixels
        const vwWidth = (staticWidth / window.innerWidth) * 100; // Convert to vw
        const vwHeight = (staticHeight / window.innerHeight) * 100; // Convert to vw

        // Cursor blink animation
        this.cursorTl = gsap.to(this.shadowRoot.querySelector('.cursor'), {
          opacity: 0,
          ease: "power2.inOut",
          repeat: -1
        });

        // Box animation
        this.boxTl = gsap.timeline();
        this.boxTl
          .to(boxElement, {
            duration: animationDuration,
            width: `${vwWidth}vw`,
            delay: 0.5,
            ease: "power4.inOut"
          })
          .from(staticElement, {
            duration: animationDuration,
            y: "7vw",
            ease: "power3.out",
            onComplete: () => this.masterTl.play()
          })
          .to(boxElement, {
            duration: animationDuration,
            height: `${vwHeight}vw`,
            ease: "elastic.out(1, 0.3)"
          });

        // Repeating text animation
        const words = repeatingText.split(',').map(word => word.trim());
        this.masterTl = gsap.timeline({ repeat: -1 }).pause();
        words.forEach(word => {
          const tl = gsap.timeline({ repeat: 1, yoyo: true, repeatDelay: 1 });
          tl.to(this.shadowRoot.querySelector('.text'), {
            duration: animationDuration,
            text: word
          });
          this.masterTl.add(tl);
        });
      });
    };
  }
}

customElements.define('text-animator', TextAnimator);
