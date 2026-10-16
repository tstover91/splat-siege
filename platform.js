/* Small Godot-to-Playgama adapter. SDK stays external and unmodified.
   Official API: https://github.com/Playgama/bridge-godot-4
   Local play starts independently of SDK/network availability. */
(() => {
  let sdk = null;
  let callback = null;
  const messages = [];
  const flags = { focus: !document.hidden, pause: false, audio: true };
  function emit(type, value) {
    flags[type] = value;
    if (callback) callback(type, value);
  }
  window.splatPlatform = {
    listen(fn) {
      callback = fn;
      for (const [type, value] of Object.entries(flags)) callback(type, value);
    },
    message(type) {
      if (sdk) sdk.platform.sendMessage(type);
      else messages.push(type);
    }
  };
  document.addEventListener('visibilitychange', () => emit('focus', !document.hidden));
  window.addEventListener('blur', () => emit('focus', false));
  window.addEventListener('focus', () => emit('focus', !document.hidden));
  const script = document.createElement('script');
  script.src = 'https://bridge.playgama.com/v2/stable/playgama-bridge.js';
  script.onload = async () => {
    try {
      const bridge = window.bridge;
      bridge.engine = 'godot-4';
      await bridge.initialize();
      sdk = bridge;
      bridge.platform.on('pause_state_changed', value => emit('pause', !!value));
      bridge.platform.on('audio_state_changed', value => emit('audio', !!value));
      emit('audio', bridge.platform.isAudioEnabled !== false);
      for (const message of messages.splice(0)) sdk.platform.sendMessage(message);
    } catch (error) { console.warn('Platform unavailable; local prototype remains playable.', error); }
  };
  script.onerror = () => console.info('Local prototype: Playgama Bridge is offline.');
  document.head.appendChild(script);
})();
