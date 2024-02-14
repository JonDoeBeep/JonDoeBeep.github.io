let root = document.documentElement;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let velocityX = 0;
let velocityY = 0;
let circleHidden = true;
let animationFrameId = null;

const lerpFactor = 0.05; // Smoothing factor for movement
const easeFactor = 0.75; // Adjust for "easiness" of the movement
const stopThreshold = 0.5; // Threshold for considering the movement stopped
const minVelocity = 0.5; // Minimum velocity to keep the animation smooth
const baseCircleWidth = 30; // Base width of the circle
const baseCircleHeight = 30; // Base height of the circle


class TextScramble {
  constructor(el) {
    this.el = el
    this.chars = '!<>-_\\/[]{}—=+*^?#________'
    this.update = this.update.bind(this)
  }
  setText(newText) {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise((resolve) => this.resolve = resolve)
    this.queue = []
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }
    cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    this.update()
    return promise
  }
  update() {
    let output = ''
    let complete = 0
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar()
          this.queue[i].char = char
        }
        output += `<span class="dud">${char}</span>`
      } else {
        output += from
      }
    }
    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)]
  }
}

function animateCircle() {
  // Difference between target and current positions
  let dx = targetX - currentX;
  let dy = targetY - currentY;

  // Increment velocity towards the target
  velocityX = (dx * lerpFactor) + (velocityX * easeFactor);
  velocityY = (dy * lerpFactor) + (velocityY * easeFactor);

  // Update position
  currentX += velocityX;
  currentY += velocityY;

  // Calculate speed for the squishy effect
  let speed = Math.min(Math.sqrt(velocityX * velocityX + velocityY * velocityY), 100) / 20;

  // Adjust circle size based on speed
  let adjustedWidth = baseCircleWidth + speed * 4; // Increase width with speed
  let adjustedHeight = baseCircleHeight - speed; // Decrease height with speed, keeping volume constant
  adjustedHeight = Math.max(adjustedHeight, 10); // Ensure minimum height to avoid disappearing

  // Apply position and size to the element
  root.style.setProperty('--mouse-x', `${currentX}px`);
  root.style.setProperty('--mouse-y', `${currentY}px`);
  root.style.setProperty('--circle-width', `${adjustedWidth}px`);
  root.style.setProperty('--circle-height', `${adjustedHeight}px`);

  // Check if animation should continue
  if (Math.abs(dx) > stopThreshold || Math.abs(dy) > stopThreshold || Math.abs(velocityX) > minVelocity || Math.abs(velocityY) > minVelocity) {
    animationFrameId = requestAnimationFrame(animateCircle);
  } else {
    // Ensure final position and reset size exactly to the target and base size
    root.style.setProperty('--mouse-x', `${targetX}px`);
    root.style.setProperty('--mouse-y', `${targetY}px`);
    root.style.setProperty('--circle-width', `${baseCircleWidth}px`);
    root.style.setProperty('--circle-height', `${baseCircleHeight}px`);
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

document.addEventListener('DOMContentLoaded', function (event) {

  const mphrases = [
    'Michael Beecher',
    'Frontend Developer',
  ]

  const top = ['About']
  const left = ['Contact']
  const bottom = ['Projects']
  const right = ['Blog']

  const el = document.querySelector('.text');
  const topEl = document.querySelector('.top');
  const leftEl = document.querySelector('.left');
  const bottomEl = document.querySelector('.bottom');
  const rightEl = document.querySelector('.right');
  const circle = document.querySelector('.mouseCircle');
  const mfx = new TextScramble(el);
  const topfx = new TextScramble(topEl);
  const leftfx = new TextScramble(leftEl);
  const bottomfx = new TextScramble(bottomEl);
  const rightfx = new TextScramble(rightEl);

  let counter = 0;
  let isTextScrambling = false; // Flag to know if text scramble is active

  let nextTimeoutId = null; // To store timeout reference
  /*
  const nextPhrase = () => { 
    fx.setText(phrases[counter]).then(() => {
      counter = (counter + 1) % phrases.length; 
      nextTimeoutId = setTimeout(nextPhrase, 8000); // Schedule next phrase
    });
  };
  */
  function nextPhrase(phrases, fx) {
    clearTimeout(nextTimeoutId);
    isTextScrambling = true;
    fx.setText(phrases[counter]).then(() => {
      counter = (counter + 1) % phrases.length;
      nextTimeoutId = setTimeout(nextPhrase, 8000); // Schedule next phrase
      isTextScrambling = false;
    });
  }

  function handleTextScramble(phrases, fx) {
    return function() { // Return an event listener function
      nextPhrase(phrases, fx); 
    }
  }

  function clearScrambleTimeout() {
    clearTimeout(nextTimeoutId);
  }

  document.onmousemove = function (e) {
    // i don't know why, but everything breaks if this is unindented.
      if (!circle.style.opacity) {
        circle.style.opacity = '1';
      }
      targetX = e.clientX - baseCircleWidth / 2;
      targetY = e.clientY - baseCircleHeight / 2;

      if (!animationFrameId) {
        animateCircle();
      }
  };

  nextPhrase(mphrases, mfx);

  el.addEventListener('mouseenter', handleTextScramble(mphrases, mfx));
  topEl.addEventListener('mouseenter', handleTextScramble(top, topfx));
  leftEl.addEventListener('mouseenter', handleTextScramble(left, leftfx));
  bottomEl.addEventListener('mouseenter', handleTextScramble(bottom, bottomfx));
  rightEl.addEventListener('mouseenter', handleTextScramble(right, rightfx));

  // Adding mouseleave listeners
  el.addEventListener('mouseleave', clearScrambleTimeout);
  topEl.addEventListener('mouseleave', clearScrambleTimeout);
  leftEl.addEventListener('mouseleave', clearScrambleTimeout);
  bottomEl.addEventListener('mouseleave', clearScrambleTimeout);
  rightEl.addEventListener('mouseleave', clearScrambleTimeout);

});

window.transitionToPage = function (href) {
  document.querySelector('body').style.opacity = 0
  setTimeout(function () {
    window.location.href = href
  }, 500)
}

document.addEventListener('DOMContentLoaded', function (event) {
  document.querySelector('body').style.opacity = 1
})

