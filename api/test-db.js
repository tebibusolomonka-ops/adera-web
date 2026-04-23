import admin from 'firebase-admin';

// Initialize Firebase Admin (Singleton)
if (!admin.apps.length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null;
        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            admin.initializeApp(); // Fallback
        }
    } catch (e) {
        console.error('Firebase Admin Init Error:', e);
    }
}

export default async function handler(req, res) {
    try {
        const db = admin.firestore();
        const testId = `test_123456`;
        const userRef = db.collection('users').doc(testId);
        await userRef.set({
            displayName: "Debug Test User",
            email: "debug@test.com",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            source: 'telegram'
        });
        
        return res.status(200).json({ ok: true, msg: "Saved successfully!" });
    } catch (err) {
        return res.status(500).json({ error: err.message, stack: err.stack });
    }
}
