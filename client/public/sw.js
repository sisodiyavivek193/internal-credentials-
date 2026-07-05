// Minimal service worker: sirf push notifications ke liye.
// Ye file public/ mein honi zaroori hai taaki root scope (/) pe register ho sake.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Server se push event aane par OS-level notification dikhao
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (err) {
    payload = { title: "New notification", message: event.data.text() };
  }

  const title = payload.title || "New notification";
  const options = {
    body: payload.message || "",
    icon: "/img/Logo.svg",
    badge: "/img/Logo.svg",
    data: {
      credentialId: payload.credentialId || null,
      notificationId: payload.notificationId || null,
      url: "/", // click pe kahan navigate karna hai — chaho toh route specific bana sakte ho
    },
    tag: payload.notificationId || undefined, // same id = purani notification replace ho jayegi, duplicate stack nahi hongi
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification pe click karne se app tab open/focus ho jaye
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
