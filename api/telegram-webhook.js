export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!botToken) {
            console.error("TELEGRAM_BOT_TOKEN is missing");
            return res.status(500).json({ error: 'Bot Token missing' });
        }

        // --- HANDLE INCOMING TEXT MESSAGES ---
        if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text;

            if (text === '/start') {
                const welcomeMessage = `*Adera Trading Guide: The Scam-Free Process 🛡️*

1. *Listing* (የራስህ ዋጋ fix አድርግ)
2. *Buying & Verification* (ገንዘብህ ይረጋገጣል)
3. *Safe Transfer* (Accountun ስታስረክብ ብሩ direct ይለቀቃል)

Select a tutorial video below to learn how it works!`;

                // Send the welcome text with an inline keyboard menu
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: welcomeMessage,
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "📹 How to List", callback_data: "vid_list" },
                                    { text: "📹 How to Buy", callback_data: "vid_buy" }
                                ],
                                [
                                    { text: "🛡️ Verification Process", callback_data: "vid_verify" }
                                ],
                                [
                                    { text: "🔄 Safe Transfer", callback_data: "vid_transfer" },
                                    { text: "⚖️ Dispute Resolution", callback_data: "vid_dispute" }
                                ],
                                [
                                    { text: "🚀 Open Web App", web_app: { url: "https://adera-web.vercel.app/" } }
                                ]
                            ]
                        }
                    })
                });
            }
        } 
        
        // --- HANDLE BUTTON CLICKS (CALLBACK QUERIES) ---
        else if (update.callback_query) {
            const chatId = update.callback_query.message.chat.id;
            const data = update.callback_query.data;
            const callbackQueryId = update.callback_query.id;

            // Answer the callback query to remove the loading state on the button
            await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: callbackQueryId })
            });

            // Video Directory Map
            const videoMap = {
                'vid_list': {
                    url: 'https://res.cloudinary.com/drabvwots/video/upload/q_auto/f_auto/v1776857303/adera_tutorial_list_eqagnr.mp4',
                    caption: '📹 *Tutorial: How to List your Account* (የራስህ ዋጋ fix አድርግ)'
                },
                'vid_buy': {
                    url: 'https://res.cloudinary.com/drabvwots/video/upload/q_auto/f_auto/v1776857552/adera_tutorial_buy_ib3eaz.mp4',
                    caption: '📹 *Tutorial: How to Buy*'
                },
                'vid_verify': {
                    url: 'https://res.cloudinary.com/drabvwots/video/upload/q_auto/f_auto/v1776857478/adera_tutorial_verify_gq9vc0.mp4',
                    caption: '🛡️ *Tutorial: Buying & Verification* (ገንዘብህ ይረጋገጣል)'
                },
                'vid_transfer': {
                    url: 'https://res.cloudinary.com/drabvwots/video/upload/q_auto/f_auto/v1776857347/adera_tutorial_transfer_jux9yf.mp4',
                    caption: '🔄 *Tutorial: Safe Transfer* (Accountun ስታስረክብ ብሩ direct ይለቀቃል)'
                },
                'vid_dispute': {
                    url: 'https://res.cloudinary.com/drabvwots/video/upload/q_auto/f_auto/v1776857459/adera_tutorial_dispute_ypowqs.mp4',
                    caption: '⚖️ *Tutorial: Dispute Resolution*'
                }
            };

            const videoInfo = videoMap[data];
            
            if (videoInfo) {
                // Send the requested video
                await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        video: videoInfo.url,
                        caption: videoInfo.caption,
                        parse_mode: 'Markdown'
                    })
                });
            }
        }

        // Return a successful 200 response back to Telegram so they don't retry the request
        return res.status(200).json({ ok: true });
        
    } catch (err) {
        console.error("Webhook Error:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
