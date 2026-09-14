(function() {
  const style = document.createElement('style');
  style.innerHTML = `
    .setupod-toast-container {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 99999;
      pointer-events: none;
    }
    .setupod-toast {
      background: rgba(17, 12, 34, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #fff;
      padding: 12px 24px;
      border-radius: 99px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-align: center;
      white-space: nowrap;
    }
    .setupod-toast.show {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  // Wait for body if not ready
  const init = () => {
    if (document.querySelector('.setupod-toast-container')) return;
    const container = document.createElement('div');
    container.className = 'setupod-toast-container';
    document.body.appendChild(container);

    window.showToast = function(message) {
      const toast = document.createElement('div');
      toast.className = 'setupod-toast';
      toast.textContent = message;
      container.appendChild(toast);

      // Trigger reflow
      void toast.offsetWidth;
      toast.classList.add('show');

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    };
  };

  if (document.body) {
    init();
  } else {
    window.addEventListener('DOMContentLoaded', init);
  }
})();
