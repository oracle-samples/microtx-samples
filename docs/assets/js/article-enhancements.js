(function () {
  document.querySelectorAll('a[href^="http"]').forEach(function (link) {
    if (link.origin !== window.location.origin) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });

  document.querySelectorAll('.post-content pre').forEach(function (pre) {
    var button = document.createElement('button');
    button.className = 'copy-code';
    button.type = 'button';
    button.textContent = 'Copy';
    button.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = code ? code.innerText : pre.innerText;
      var copied = navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject();
      copied.catch(function () {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }).then(function () {
        button.textContent = 'Copied';
        setTimeout(function () { button.textContent = 'Copy'; }, 1500);
      });
    });
    pre.appendChild(button);
  });

  document.querySelectorAll('.post-content img').forEach(function (image) {
    if (!image.closest('a')) {
      var link = document.createElement('a');
      link.href = image.currentSrc || image.src;
      link.className = 'full-size-image';
      link.setAttribute('aria-label', 'View image at full size');
      image.parentNode.insertBefore(link, image);
      link.appendChild(image);
    }
  });

  document.querySelectorAll('.post-content iframe[src*="youtube.com"], .post-content iframe[src*="youtu.be"]').forEach(function (iframe) {
    var wrapper = document.createElement('div');
    wrapper.className = 'video-embed';
    iframe.parentNode.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);
  });
}());
