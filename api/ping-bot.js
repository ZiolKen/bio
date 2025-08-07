export default async function handler(req, res) {
  try {
    const [botRes, statusRes] = await Promise.all([
      fetch('https://discord-bot-us.onrender.com'),
      fetch('https://discord-bot-us.onrender.com/status'),
    ]);

    const botText = await botRes.text();
    const statusText = await statusRes.text();

    res.status(200).send(
      `✅ Pinged bot. Got response: ${botText}\n✅ Pinged status. Got response: ${statusText}`
    );
  } catch (err) {
    res.status(500).send(`❌ Failed to ping bot or status: ${err.message}`);
  }
}