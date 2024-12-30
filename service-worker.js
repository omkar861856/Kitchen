self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  // Extract plain text data from the push event
  const message = event.data ? event.data.json() : 'Default notification text';

  // Display the notification
  const options = {
    body: message, // Use the plain text as the notification body
    icon: '', // Replace with the actual path to your icon
    badge: '', // Replace with the actual path to your badge icon
  };

  event.waitUntil(
    self.registration.showNotification('New Notification', options)
  );
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

