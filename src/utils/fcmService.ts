import admin from 'firebase-admin';
import { DeviceToken } from '../models/DeviceToken';
import Notification from '../models/Notification';

// Safely initialize Firebase so it only happens once
if (process.env.FIREBASE_PROJECT_ID && !admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace hardcoded newlines in the string
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log("Firebase Admin Initialized Successfully");
    } catch (e) {
        console.error("Firebase Admin Initialization Error:", e);
    }
}

export const sendPushNotification = async (userId: number, title: string, body: string, data: Record<string, string> = {}) => {
    try {
        // Save notification record regardless of FCM result
        await Notification.create({ userId, title, body, data });

        // Skip FCM send if Firebase wasn't initialized
        if (!admin.apps.length) {
            console.warn(`[FCM] Firebase not initialized — notification saved to DB only (userId=${userId})`);
            return;
        }

        // Fetch user's device tokens
        const deviceTokens = await DeviceToken.find({ userId });
        if (!deviceTokens || deviceTokens.length === 0) {
            console.warn(`[FCM] No device tokens found for userId=${userId} — notification saved to DB only`);
            return;
        }

        const tokens = deviceTokens.map(dt => dt.token);

        // FCM data values must all be strings
        const stringData: Record<string, string> = Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
        );

        const message: admin.messaging.MulticastMessage = {
            notification: { title, body },
            data: stringData,
            tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`[FCM] Sent to userId=${userId} — tokens=${tokens.length}, success=${response.successCount}, failed=${response.failureCount}`);

        // Clean up stale tokens
        response.responses.forEach((res, idx) => {
            if (!res.success) {
                console.warn(`[FCM] Token failed (userId=${userId}): ${res.error?.code} — token: ${tokens[idx].slice(0, 20)}...`);
                if (res.error?.code === 'messaging/registration-token-not-registered') {
                    DeviceToken.deleteOne({ token: tokens[idx] }).exec();
                }
            }
        });
    } catch (error) {
        console.error('[FCM] Error sending push notification:', error);
    }
};
