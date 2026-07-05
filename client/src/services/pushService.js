import api from "./api_axios";

// VAPID public key ek base64url string hoti hai — PushManager.subscribe() ko
// Uint8Array chahiye, isliye convert karna padta hai.
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function isPushSupported() {
    return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function getPushPermission() {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission; // "default" | "granted" | "denied"
}

async function registerServiceWorker() {
    return navigator.serviceWorker.register("/sw.js");
}

/**
 * Permission maangta hai, VAPID key backend se leta hai, browser ko subscribe
 * karta hai, aur subscription backend mein save karta hai.
 * Returns true on success, false otherwise (never throws — caller ko simple
 * boolean chahiye taaki UI mein easily handle ho sake).
 */
export async function enablePushNotifications() {
    if (!isPushSupported()) return false;

    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return false;

        const registration = await registerServiceWorker();
        await navigator.serviceWorker.ready;

        const { data } = await api.get("/notifications/push/vapid-public-key");
        if (!data?.publicKey) return false;

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(data.publicKey),
            });
        }

        await api.post("/notifications/push/subscribe", subscription.toJSON());
        return true;
    } catch (err) {
        console.error("Enable push notifications failed:", err);
        return false;
    }
}

/**
 * Browser subscription cancel karo aur backend ko bhi bata do.
 */
export async function disablePushNotifications() {
    if (!isPushSupported()) return;

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (!subscription) return;

        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await api.post("/notifications/push/unsubscribe", { endpoint });
    } catch (err) {
        console.error("Disable push notifications failed:", err);
    }
}

/**
 * App load hone par silently check karta hai ki subscription already active
 * hai ya nahi — UI mein toggle ka sahi initial state dikhane ke liye.
 */
export async function isPushSubscribed() {
    if (!isPushSupported()) return false;
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        return Boolean(subscription);
    } catch {
        return false;
    }
}
