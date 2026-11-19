(function () {
  var root = document.getElementById('phone-demo');
  var caption = document.getElementById('demo-caption');
  var dotsRoot = document.getElementById('demo-dots');
  if (!root) return;

  var frames = Array.prototype.slice.call(root.querySelectorAll('.demo-frame'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var labels = [
    'Home',
    'Create',
    'Add',
    'Invite',
    'Slots',
    'Complete',
    'Reveal',
  ];
  var dwell = [2300, 2400, 2500, 2500, 2600, 2600, 3200];
  var stepCount = labels.length;
  var step = 0;
  var timer = null;
  var running = false;
  var dots = [];

  if (dotsRoot) {
    for (var i = 0; i < stepCount; i += 1) {
      var dot = document.createElement('span');
      dot.className = 'demo-dot' + (i === 0 ? ' is-active' : '');
      dotsRoot.appendChild(dot);
      dots.push(dot);
    }
  }

  function setCaption(text) {
    if (!caption) return;
    if (reduceMotion) {
      caption.textContent = text;
      return;
    }
    caption.classList.add('is-swap');
    setTimeout(function () {
      caption.textContent = text;
      caption.classList.remove('is-swap');
    }, 160);
  }

  function show(n) {
    step = ((n % stepCount) + stepCount) % stepCount;
    frames.forEach(function (frame) {
      frame.classList.toggle(
        'is-active',
        Number(frame.getAttribute('data-step')) === step
      );
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === step);
    });
    setCaption(labels[step]);
  }

  function tick() {
    if (!running) return;
    show(step + 1);
    timer = setTimeout(tick, dwell[step]);
  }

  function start() {
    if (running) return;
    running = true;
    show(step);
    if (reduceMotion) return;
    timer = setTimeout(tick, dwell[step]);
  }

  function stop() {
    running = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  frames.forEach(function (img) {
    if (img && img.decode) img.decode().catch(function () {});
  });

  if (typeof IntersectionObserver === 'function') {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) start();
          else stop();
        });
      },
      { threshold: 0.35 }
    );
    observer.observe(root);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });
})();
