import { del, entries } from "./idb_keyval.js";
const staticCache = 'cache-v1';
const cachedFiles = [
    '/',
    '/index.html', // glavni index
    '/manifest.json', // manifest
    '/images/icons/icon-72x72.png', // ikone
    '/images/icons/icon-96x96.png', // ikone
    '/images/icons/icon-128x128.png', // ikone
    '/images/icons/icon-144x144.png', // ikone
    '/images/icons/icon-152x152.png', // ikone
    '/images/icons/icon-192x192.png', // ikone
    '/images/icons/icon-384x384.png', // ikone
    '/images/icons/icon-512x512.png', // ikone
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
    // Add more files to cache as needed
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticCache)
            .then(cache => cache.addAll(cachedFiles))
    );
});

self.addEventListener("activate", (event) => {
    console.log(
        "*************************************************************************************"
    );
    console.log(
        "******************   Activating new service worker... *******************************"
    );
    console.log(
        "*************************************************************************************"
    );

    const cacheWhitelist = [staticCache];
    // Ovako možemo obrisati sve ostale cacheve koji nisu naš
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


self.addEventListener('fetch', event => {
    if (navigator.onLine) {
        // When online, check for updates and serve from cache if available
        event.respondWith(
            caches.open(staticCache).then(cache => {
                return fetch(event.request).then(networkResponse => {
                    if (networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    return cache.match(event.request);
                });
            })
        );
    } else {
        // When offline, serve from cache
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                return cachedResponse || fetch(event.request).catch(() => {
                    // Optionally, return a custom offline page or a fallback response here
                });
            })
        );
    }
});

self.addEventListener('sync', function (event) {
    console.log('Background sync!', event);
    if (event.tag === 'sync-snaps') {
        event.waitUntil(
            syncSnaps()
        );
    }
});

let syncSnaps = async function () {
    entries().then((entries) => {
        entries.forEach((entry) => {
            let story = entry[1]; //  Each entry is an array of [key, value].
            console.log(story)
            fetch("/saveStory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json" // Specify the content type
                },
                body: JSON.stringify(story),
            })
                .then(function (res) {
                    console.log(res)
                    if (res.ok) {
                        res.json().then(function (data) {
                            console.log("Deleting from idb:", data.title);
                            del(data.title);
                        });
                    } else {
                        console.log(res);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    });
}
self.addEventListener("notificationclick", (event) => {
    let notification = event.notification;
    notification.close();
    //console.log("notificationclick", notification);
    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then(function (clis) {
                clis.forEach((client) => {
                    if (client.url === notification.data.redirectUrl)
                        return client.focus();
                });
                if (clients.openWindow)
                    return clients.openWindow(notification.data.redirectUrl);
            })
    );
});

self.addEventListener("notificationclose", function (event) {
   // console.log("notificationclose", event);
});

self.addEventListener("push", function (event) {

    var data = { title: "title", body: "body", redirectUrl: "/" };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.body,
        icon: "assets/img/android/android-launchericon-96-96.png",
        badge: "assets/img/android/android-launchericon-96-96.png",
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        data: {
            redirectUrl: data.redirectUrl,
        },
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
            .catch(err => {
                //console.error('Notification error:', err);
                // Handle error or perform other actions
            })
    );

});


