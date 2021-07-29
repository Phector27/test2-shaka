// const manifestUri =
//     'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd';

const manifestUri =
    'https://storage.googleapis.com/shaka-demo-assets/sintel-widevine/dash.mpd';
    // const licenseServer = 'https://cwip-shaka-proxy.appspot.com/no_auth';

    // const licenseServer = 'https://cwip-shaka-proxy.appspot.com/header_auth';

    // const licenseServer = 'https://cwip-shaka-proxy.appspot.com/param_auth';

    // const licenseServer = 'https://cwip-shaka-proxy.appspot.com/param_auth';

    const licenseServer = 'https://cwip-shaka-proxy.appspot.com/header_auth';
    const authTokenServer = 'https://cwip-shaka-proxy.appspot.com/get_auth_token';
    const authToken = null;

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

  // player.configure({
  //   drm: {
  //     servers: {
  //       'com.widevine.alpha': 'https://foo.bar/drm/widevine',
  //       'com.microsoft.playready': 'https://foo.bar/drm/playready'
  //     }
  //   }
  // });
    

player.configure({
  drm: {
    servers: { 'com.widevine.alpha': licenseServer }
  }
});

player.getNetworkingEngine().registerRequestFilter(function(type, request) {
  // Only add headers to license requests:
  if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
    // This is the specific header name and value the server wants:
    request.headers['CWIP-Auth-Header'] = 'VGhpc0lzQVRlc3QK';
  }
});

player.getNetworkingEngine().registerRequestFilter(function(type, request) {
  // Only add headers to license requests:
  if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
    // This is the specific parameter name and value the server wants:
    // Note that all network requests can have multiple URIs (for fallback),
    // and therefore this is an array. But there should only be one license
    // server URI in this tutorial.
    request.uris[0] += '?CWIP-Auth-Param=VGhpc0lzQVRlc3QK';
  }
});
player.getNetworkingEngine().registerRequestFilter(function(type, request) {
  if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
    request.allowCrossSiteCredentials = true;
  }
});
  
player.getNetworkingEngine().registerRequestFilter(function(type, request) {
  // Only add headers to license requests:
  if (type != shaka.net.NetworkingEngine.RequestType.LICENSE) return;

  // If we already know the token, attach it right away:
  if (authToken) {
    console.log('Have auth token, attaching to license request.');
    request.headers['CWIP-Auth-Header'] = authToken;
    return;
  }

  console.log('Need auth token.');
  // Start an asynchronous request, and return a Promise chain based on that.
  const authRequest = {
    uris: [authTokenServer],
    method: 'POST',
  };
  const requestType = shaka.net.NetworkingEngine.RequestType.APP;
  return player.getNetworkingEngine().request(requestType, authRequest)
      .promise.then(function(response) {
        // This endpoint responds with the value we should use in the header.
        authToken = shaka.util.StringUtils.fromUTF8(response.data);
        console.log('Received auth token', authToken);
        request.headers['CWIP-Auth-Header'] = authToken;
        console.log('License request can now continue.');
      });
});
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