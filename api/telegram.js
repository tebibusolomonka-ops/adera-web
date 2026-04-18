import admin from 'firebase-admin';

// Initialize Firebase Admin (Singleton)
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (e) {
        console.error('Firebase Admin Init Error:', e);
    }
}

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 🔒 STEP 1: Verify Auth
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        let uid;
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            uid = decodedToken.uid;
        } catch {
            return res.status(401).json({ error: 'Invalid Token' });
        }

        // 🛡️ STEP 2: Rate Limiting
        const db = admin.firestore();
        const rateLimitRef = db.collection('rate-limits-telegram').doc(uid);
        const rateLimitDoc = await rateLimitRef.get();
        const now = Date.now();
        const windowMs = 60 * 60 * 1000; // 1 hour

        if (!rateLimitDoc.exists) {
            await rateLimitRef.set({ count: 1, lastReset: now });
        } else {
            const data = rateLimitDoc.data();
            const timePassed = now - data.lastReset;
            if (timePassed > windowMs) {
                await rateLimitRef.update({ count: 1, lastReset: now });
            } else {
                if (data.count >= 20) { // Limit to 20 notifications per hour
                    return res.status(429).json({ error: 'Too many notifications. Try again in an hour.' });
                }
                await rateLimitRef.update({ count: admin.firestore.FieldValue.increment(1) });
            }
        }

        const { chat_id, text } = req.body;
        
        // Strictly grabs the token from the Vercel Encrypted Vault. 
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        
        if (!botToken) {
            console.error("CRITICAL: TELEGRAM_BOT_TOKEN environment variable is missing on Vercel server");
            return res.status(500).json({ error: 'Bot Token missing from server environment' });
        }
        
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id,
                text,
                parse_mode: 'Markdown'
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Telegram API rejected the request:", data);
            return res.status(response.status).json({ error: 'Failed to send message', details: data });
        }

        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Server crashing error in Telegram API webhook:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
