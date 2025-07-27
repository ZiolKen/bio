export default async function handler(req, res) {
  try {
    const response = await fetch('https://discord-bot-us.onrender.com');
    const text = await response.text();
    res.status(200).send(`✅ Pinged bot. Got response: ${text}`);
  } catch (err) {
    res.status(500).send(`❌ Failed to ping bot: ${err.message}`);
  }
  try {
    const response = await fetch('https://discord-bot-us.onrender.com/status');
    const text = await response.text();
    res.status(200).send(`✅ Pinged status. Got response: ${text}`);
  } catch (err) {
    res.status(500).send(`❌ Failed to ping status: ${err.message}`);
  }
}