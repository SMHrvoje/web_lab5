import { del, entries } from "./idb_keyval.js";
const staticCache = 'cache-v1';
const cachedFiles = [
    '/',
    '/index.html', // glavni index
    '/manifest.json', // manifest
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticCache)
            .then(cache => cache.addAll(cachedFiles))
    );
});

self.addEventListener("activate", (event) => {
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


//ako smo online gettaj i update cache da uvijek imamo latest data inače daj iz cachea
self.addEventListener('fetch', event => {
    //ako smo online
    if (navigator.onLine) {

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
        // ako smo offline
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                return cachedResponse || fetch(event.request).catch(() => {
                   //catchanje errora ako ništa ne radi
                });
            })
        );
    }
});

//sinkronizacija na net
self.addEventListener('sync', function (event) {
    if (event.tag === 'sync-stories') {
        event.waitUntil(
            syncStories()
        );
    }
});

let syncStories = async function () {
    entries().then((entries) => {
        entries.forEach((entry) => {
            let story = entry[1]
            fetch("/saveStory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json" // da ne cita krivo
                },
                body: JSON.stringify(story),
            })
                .then(function (res) {
                    if (res.ok) {
                        res.json().then(function (data) {
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



self.addEventListener("push", function (event) {

    var data = { title: "title", body: "body", redirectUrl: "/" };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.body,
        icon: "assets/img/android/android-launchericon-96-96.png",
        badge: "assets/img/android/android-launchericon-96-96.png",
        data: {
            redirectUrl: data.redirectUrl,
        },
    };
    //javi notif
    event.waitUntil(
        self.registration.showNotification(data.title, options)
            .catch(err => {
                //ako je greska
            })
    );

});


