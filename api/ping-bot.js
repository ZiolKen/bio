export default async function handler(req, res) {
  try {
    const response = await fetch('https://discord-bot-e6f7.onrender.com');
    const text = await response.text();
    res.status(200).send(`✅ Pinged bot. Got response: ${text}`);
  } catch (err) {
    res.status(500).send(`❌ Failed to ping bot: ${err.message}`);
  }
}