self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (!event.data) {
    console.error('Push event has no data');
    return;
  }

  try {
    // Attempt to parse the data
    const message = event.data.json();
    console.log('Parsed message:', message);

    const options = {
      body: message.body || 'Default notification body', // Use a default value if body is missing
      icon: message.icon || '', // Replace with actual path to your icon
      badge: message.badge || '', // Replace with actual path to your badge icon
    };

    event.waitUntil(
      self.registration.showNotification(message.title || 'New Notification', options)
    );
  } catch (error) {
    console.error('Failed to parse push event data as JSON:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('http://localhost:5173') // Replace with your app's URL
  );
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('notification-sounds').then((cache) => {
      return cache.add('public/simple-notification-152054.mp3');
    })
  );
});

self.dispatchEvent(new PushEvent('push', {
  data: JSON.stringify({ title: 'Test', body: 'This is a test notification.' }),
}));