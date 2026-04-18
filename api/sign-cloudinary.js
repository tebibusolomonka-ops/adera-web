import crypto from 'crypto';

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
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        const apiKey = process.env.CLOUDINARY_API_KEY;

        if (!apiSecret || !apiKey) {
            console.error('Missing Cloudinary env vars');
            return res.status(500).json({ error: 'Cloudinary configuration missing on server' });
        }

        const timestamp = Math.round((new Date()).getTime() / 1000);
        const { folder, upload_preset } = req.body || {};

        // Build params to sign
        // Order is alphabetical — MUST match what the client sends to Cloudinary
        const paramsToSign = {
            timestamp: timestamp.toString(),
            ...(folder && { folder }),
            ...(upload_preset && { upload_preset }),
        };

        const sortedParams = Object.keys(paramsToSign)
            .sort()
            .map(key => `${key}=${paramsToSign[key]}`)
            .join('&');

        const signature = crypto
            .createHash('sha1')
            .update(sortedParams + apiSecret)
            .digest('hex');

        return res.status(200).json({
            signature,
            timestamp,
            api_key: apiKey,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drabvwots',
        });

    } catch (error) {
        console.error('Signing Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
