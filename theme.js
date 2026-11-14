(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var key = 'pknk-theme';

  function stored() {
    try {
      var value = localStorage.getItem(key);
      if (value === 'light' || value === 'dark') return value;
    } catch (e) {}
    return null;
  }

  function systemDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function effective() {
    return stored() || (systemDark() ? 'dark' : 'light');
  }

  function apply() {
    var value = stored();
    if (value) root.setAttribute('data-theme', value);
    else root.removeAttribute('data-theme');

    if (btn) {
      btn.setAttribute(
        'aria-label',
        effective() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  apply();

  if (!btn) return;

  btn.addEventListener('click', function () {
    var next = effective() === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(key, next);
    } catch (e) {}
    apply();
  });
})();
