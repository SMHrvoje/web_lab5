let btnNotif = document.getElementById("btnEnableNotifications");
if ("Notification" in window && "serviceWorker" in navigator) {
    console.log("ima notification")
    btnNotif.addEventListener("click", function () {
        Notification.requestPermission(async function (res) {
            //console.log("Request permission result:", res);
            if (res === "granted") {
                await setupPushSubscription();
            } else {
               // console.log("User denied push notifs:", res);
            }
        });
    });
} else {
    btnNotif.setAttribute("disabled", "");
    btnNotif.classList.add("btn-outline-danger");
}

function urlBase64ToUint8Array(base64String) {
    var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function setupPushSubscription() {
    try {
        //provjera a je okej
        let reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (sub === null) {
            var publicKey =
                "BMGggaWcSgQVZwyccQn1HzSJtyYufRkHFkWwIqfSM8uCA-BEvvA_-NyKltsygvZTpT3THaj-mgzT_K5aeux3Eos";
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });
            let res = await fetch("/saveSubscription", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",     //definiraj koji tip bude
                    Accept: "application/json",
                },
                body: JSON.stringify({ sub }),
            });
            if (res.ok) {
                alert(
                    "You have successfully saved the subscription"

                );
            }
        } else {
            alert("You are already subscribed");
        }
    } catch (error) {
       // console.log(error);
    }
}
