const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "ksshop2026";
const WA_TOKEN = "EAAezeZCAWDQQBRizYHyLkIBw89wOXb11ykW8gK7FDfBIPJbvZB8lFgZA7WnL6t6HIDVSR4UunEW84mUZBwZA4UAnHBKR88LCbRlwzA3yw5SGnmZAKaSE02RLluSpD5hICZCmPC0pTAadZAiRJzfZAQuhKxQIGrlHduyegZCdDUZAZAe1lcGiLpVPZBcePZCTmZCVQ8vSZAWgdT96Cs8GnqA6ZBZCeH9ZBas9AXLxBBdGNooBWutZAx2FhJu0kkaFWwZDZD";
const PHONE_ID = "1051210511418528";
const GEMINI_KEY = "AIzaSyASoARrNcaWWL7gzcvogCL_LCqFunvgJH8";

const SYSTEM = `Tu es l'assistant WhatsApp officiel de KS Shop, boutique de vêtements à Bafoussam et Mbouda (marché Mbangang). Réponds toujours en français, poliment et brièvement. Produits: homme (S-XXL), femme (XS-XL), enfant 5-14ans. Prix: 5000-25000 FCFA. Promo: -20% sur 2ème pièce le weekend. Livraison: 24-48h ville 1500 FCFA, 3-5j national 3000 FCFA, gratuit dès 30000 FCFA. Paiement: livraison/Mobile Money/Orange Money. Échange sous 7j. Lun-Sam 9h-19h. Contact: 640552195/671438279. Si info manque: "Je vérifie et je te reviens 🙏"`;

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg || msg.type !== 'text') return res.sendStatus(200);
  const from = msg.from;
  const text = msg.text.body;
  try {
    const ai = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        system_instruction: {parts: [{text: SYSTEM}]},
        contents: [{role: 'user', parts: [{text}]}]
      })
    });
    const data = await ai.json();
    const reply = data.candidates[0].content.parts[0].text;
    await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {'Authorization': `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({messaging_product: 'whatsapp', to: from, type: 'text', text: {body: reply}})
    });
  } catch(e) { console.error(e); }
  res.sendStatus(200);
});

app.listen(3000, () => console.log('KS Shop Bot actif!'));
