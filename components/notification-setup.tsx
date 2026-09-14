"use client";

import { useEffect } from "react";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import { registerPushToken } from "@/lib/api";

export function NotificationSetup() {
  useEffect(() => {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey || Object.values(config).some((value) => !value) || !("Notification" in window)) return;
    void (async () => {
      if (!(await isSupported()) || (await Notification.requestPermission()) !== "granted") return;
      const app = initializeApp(config);
      const messaging = getMessaging(app);
      const registration = await navigator.serviceWorker.ready;
      const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
      if (token) await registerPushToken(token, /Android/i.test(navigator.userAgent) ? "android" : "desktop");
      onMessage(messaging, (payload) => { if (payload.notification?.title) new Notification(payload.notification.title, { body: payload.notification.body }); });
    })().catch(() => undefined);
  }, []);
  return null;
}
