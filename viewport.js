/* Fit a fixed Godot render buffer to the actual visible browser area.
   Never multiply CSS dimensions or offsets by devicePixelRatio: the canvas
   already has a 1440 x 900 backing buffer and Godot maps pointer coordinates
   through its displayed bounding rectangle. */
(() => {
  const frame = document.getElementById('game-frame');
  const canvas = document.getElementById('canvas');
  const gameWidth = 1440;
  const gameHeight = 900;
  let pending = false;

  function fit() {
    pending = false;
    const visible = window.visualViewport;
    const width = Math.max(1, Math.min(window.innerWidth, visible ? visible.width : window.innerWidth));
    const height = Math.max(1, Math.min(window.innerHeight, visible ? visible.height : window.innerHeight));
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    frame.style.left = `${visible ? visible.offsetLeft : 0}px`;
    frame.style.top = `${visible ? visible.offsetTop : 0}px`;
    // Explicit dimensions replace inset:0's right/bottom constraints.
    frame.style.right = 'auto';
    frame.style.bottom = 'auto';
    const style = window.getComputedStyle(frame);
    const horizontalInset = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    const verticalInset = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
    const scale = Math.max(0, Math.min((width - horizontalInset) / gameWidth, (height - verticalInset) / gameHeight));
    canvas.style.width = `${gameWidth * scale}px`;
    canvas.style.height = `${gameHeight * scale}px`;
  }

  function schedule() {
    if (!pending) {
      pending = true;
      window.requestAnimationFrame(fit);
    }
  }

  fit();
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  window.addEventListener('pageshow', schedule);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedule);
    window.visualViewport.addEventListener('scroll', schedule);
  }
})();
