// src/utils/cacheAudio.ts
export const cacheAudioFile = async (audioUrl: string) => {
    if ('caches' in window) {
      const cacheName = 'notification-sounds';
      try {
        const cache = await caches.open(cacheName);
        const response = await cache.match(audioUrl);
        if (!response) {
          await cache.add(audioUrl); // Caches the audio file
          console.log('Notification sound cached successfully!');
        } else {
          console.log('Notification sound is already cached.');
        }
      } catch (error) {
        console.error('Failed to cache the audio file:', error);
      }
    } else {
      console.warn('Cache Storage API is not supported in this browser.');
    }
  };