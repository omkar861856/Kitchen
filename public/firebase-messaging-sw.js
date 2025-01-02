importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js");

const firebaseConfig = {
    apiKey: "AIzaSyAnNhBcwCHm3bOMaLbtGHgVNCiTqrLArE8",
    authDomain: "canteen-3d920.firebaseapp.com",
    projectId: "canteen-3d920",
    storageBucket: "canteen-3d920.firebasestorage.app",
    messagingSenderId: "954550180838",
    appId: "1:954550180838:web:4b7d9eacc8bf79061a9427",
    measurementId: "G-9BKJCPKQXY"
  };
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});