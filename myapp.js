// const manifestUri =
//     'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd';

const manifestUri =
    'https://storage.googleapis.com/shaka-demo-assets/sintel-widevine/dash.mpd';
    const licenseServer = 'https://cwip-shaka-proxy.appspot.com/no_auth';

function initApp() {

  // Debug logs, when the default of INFO isn't enough:
  // shaka.log.setLevel(shaka.log.Level.V1);

  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  // Check to see if the browser supports the basic APIs Shaka needs.
  if (shaka.Player.isBrowserSupported()) {
    // Everything looks good!
    initPlayer();
  } else {
    // This browser does not have the minimum set of APIs we need.
    console.error('Browser not supported!');
  }
}

async function initPlayer() {
  // Create a Player instance.
  const video = document.getElementById('video');
  const player = new shaka.Player(video);

  // Attach player to the window to make it easy to access in the JS console.
  window.player = player;

  // Listen for error events.
  player.addEventListener('error', onErrorEvent);

  player.configure({
    drm: {
      servers: {
        'com.widevine.alpha': 'https://foo.bar/drm/widevine',
        'com.microsoft.playready': 'https://foo.bar/drm/playready'
      }
    }
  });
    

// player.configure({
//   drm: {
//     servers: { 'com.widevine.alpha': licenseServer }
//   }
// });
  // Try to load a manifest.
  // This is an asynchronous process.
  try {
    await player.load(manifestUri);
    // This runs if the asynchronous load is successful.
    console.log('The video has now been loaded!');
  } catch (e) {
    // onError is executed if the asynchronous load fails.
    onError(e);
  }
}

function onErrorEvent(event) {
  // Extract the shaka.util.Error object from the event.
  onError(event.detail);
}

function onError(error) {
  // Log the error.
  console.error('Error code', error.code, 'object', error);
}

document.addEventListener('DOMContentLoaded', initApp);