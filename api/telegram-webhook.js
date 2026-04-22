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
                const welcomeMessage = `🌟 *Adera Masterclass: እንዴት በ 1 ደቂቃ Safe Trade እናደርጋለን?* 🚀
_How to instantly List, Verify, Buy, ena securely Transfer accounts without getting scammed._

👇 *Tap a button below to watch a quick tutorial!*`;

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
                                    { text: "📹 How to List (አካዉንት ለመሸጥ)", callback_data: "vid_list" }
                                ],
                                [
                                    { text: "📹 How to Buy (አካዉንት ለመግዛት)", callback_data: "vid_buy" }
                                ],
                                [
                                    { text: "🛡️ Verification Process (የማረጋገጥ ሂደት)", callback_data: "vid_verify" }
                                ],
                                [
                                    { text: "🔄 Safe Transfer (አስተማማኝ ርክክብ)", callback_data: "vid_transfer" }
                                ],
                                [
                                    { text: "⚖️ Dispute Resolution (ቅሬታ አፈታት)", callback_data: "vid_dispute" }
                                ],
                                [
                                    { text: "🚀 Open Web App (አፕሊኬሽኑን ክፈት)", web_app: { url: "https://adera-web.vercel.app/" } }
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
                    url: 'https://res.cloudinary.com/drabvwots/video/upload/c_scale,w_480/q_auto:low/f_mp4/v1776881208/adera_tutorial_list_online-video-cutter.com_i11tyg.mp4',
                    caption: '📹 *Tutorial: How to List your Account* (የራስህ ዋጋ fix አድርግ)'
                },
                'vid_buy': {
                    url: 'https://res.cloudinary.com/drabvwots/video/upload/c_scale,w_480/q_auto:low/f_mp4/v1776881220/adera_tutorial_buy_online-video-cutter.com_myy4lo.mp4',
                    caption: '📹 *Tutorial: How to Buy*'
                },
                'vid_verify': {
                    url: 'https://res.cloudinary.com/drabvwots/video/upload/c_scale,w_480/q_auto:low/f_mp4/v1776881508/adera_tutorial_verify_online-video-cutter.com_wvn6xn.mp4',
                    caption: '🛡️ *Tutorial: Buying & Verification* (ገንዘብህ ይረጋገጣል)'
                },
                'vid_transfer': {
                    url: 'https://res.cloudinary.com/drabvwots/video/upload/c_scale,w_480/q_auto:low/f_mp4/v1776881211/adera_tutorial_transfer_online-video-cutter.com_vuepfn.mp4',
                    caption: '🔄 *Tutorial: Safe Transfer* (Accountun ስታስረክብ ብሩ direct ይለቀቃል)'
                },
                'vid_dispute': {
                    url: 'https://res.cloudinary.com/drabvwots/video/upload/c_scale,w_480/q_auto:low/f_mp4/v1776881154/adera_tutorial_dispute_online-video-cutter.com_wzkkwi.mp4',
                    caption: '⚖️ *Tutorial: Dispute Resolution*'
                }
            };

            const videoInfo = videoMap[data];
            
            if (videoInfo) {
                // Send the requested video
                const response = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        video: videoInfo.url,
                        caption: videoInfo.caption,
                        parse_mode: 'Markdown'
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error("Telegram sendVideo failed:", errorData);
                    // Send a fallback message to the user
                    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: `⚠️ *Error Loading Video*\n\nThe video is currently unavailable or too large for Telegram to process. You can watch it directly here:\n[Click to watch](${videoInfo.url})`,
                            parse_mode: 'Markdown'
                        })
                    });
                }
            }
        }

        // Return a successful 200 response back to Telegram so they don't retry the request
        return res.status(200).json({ ok: true });
        
    } catch (err) {
        console.error("Webhook Error:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
