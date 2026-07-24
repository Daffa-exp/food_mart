// Service worker khusus Web Push — file ini HARUS ada di root /public
// (bukan di dalam subfolder), supaya scope-nya mencakup seluruh situs.

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "FoodMart", body: event.data.text() };
  }

  const title = payload.title || "FoodMart";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: payload.url || "/" },
    // Tag sama = notifikasi baru menimpa yang lama (bukan numpuk banyak
    // notifikasi terpisah kalau ada beberapa update dalam waktu dekat),
    // kecuali untuk chat yang memang wajar numpuk per percakapan.
    tag: payload.tag || undefined,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Klik notifikasi -> fokus ke tab yang sudah terbuka (kalau ada), atau
// buka tab baru ke URL yang relevan.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
