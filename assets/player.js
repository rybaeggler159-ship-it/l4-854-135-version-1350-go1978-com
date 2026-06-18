import { H as Hls } from './video-dru42stk.js';

function setupPlayer(player) {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const status = player.querySelector('[data-player-status]');
  const sourceUrl = player.getAttribute('data-src');
  let hlsInstance = null;
  let attached = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function attachSource() {
    if (!video || !sourceUrl) {
      setStatus('当前影片未配置播放源。');
      return Promise.resolve(false);
    }

    if (attached) {
      return Promise.resolve(true);
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      attached = true;
      setStatus('已使用浏览器原生 HLS 播放能力。');
      return Promise.resolve(true);
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('HLS 播放清单加载完成，可以播放。');
      });

      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放源加载异常，请刷新页面或稍后重试。');
        }
      });

      attached = true;
      return Promise.resolve(true);
    }

    video.src = sourceUrl;
    attached = true;
    setStatus('浏览器不支持 HLS.js，已尝试直接加载播放源。');
    return Promise.resolve(true);
  }

  function playVideo() {
    attachSource().then(function (ready) {
      if (!ready) {
        return;
      }

      if (button) {
        button.classList.add('is-hidden');
      }

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击视频控件播放。');
        });
      }
    });
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(setupPlayer);
});
