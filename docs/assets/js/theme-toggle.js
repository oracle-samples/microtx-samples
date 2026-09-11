(function () {
  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');

  if (!toggle) return;

  function render() {
    var isDark = root.dataset.theme === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.textContent = isDark ? 'Light theme' : 'Dark theme';
    toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  toggle.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('microtx-theme', root.dataset.theme); } catch (error) {}
    render();
  });

  render();
}());
