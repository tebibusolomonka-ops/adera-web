export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { chat_id, text } = req.body;
        
        // Strictly grabs the token from the Vercel Encrypted Vault. 
        // Notice it does NOT use VITE_ prefix.
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
