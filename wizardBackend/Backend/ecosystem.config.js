module.exports = {
  apps: [
    {
      name: 'service-worker-checker',
      script: './ServiceWorkerChecker.js',
      watch: true,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'xml-streamer',
      script: './XMLStreamer.js',
      watch: true,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'offline-event-checker',
      script: './OfflineEventChecker.js',
      watch: true,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'event-tracker',
      script: './EventTracker.js',
      watch: true,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'webpush-script-checker',
      script: './WebPushScriptChecker.js',
      watch: true,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'server-side-request-checker',
      script: './ServerSideRequestChecker.js',
      watch: true,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
}; 