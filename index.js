const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "ksshop2026";
const WA_TOKEN = "EAAezeZCAWDQQBRizYHyLkIBw89wOXb11ykW8gK7FDfBIPJbvZB8lFgZA7WnL6t6HIDVSR4UunEW84mUZBwZA4UAnHBKR88LCbRlwzA3yw5SGnmZAKaSE02RLluSpD5hICZCmPC0pTAadZAiRJzfZAQuhKxQIGrlHduyegZCdDUZAZAe1lcGiLpVPZBcePZCTmZCVQ8vSZAWgdT96Cs8GnqA6ZBZCeH9ZBas9AXLxBBdGNooBWutZAx2FhJu0kkaFWwZDZD";
const PHONE_ID = "1051210511418528";
const ANTHROPIC_KEY = "METS_TA_CLE_ICI";

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
    const ai = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {'Content-Type':'application/json','x-api-key':ANTHROPIC_KEY,'anthropic-version':'2023-06-01'},
      body: JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:500,system:`Tu es l'assistant WhatsApp de KS Shop. Réponds poliment et brièvement en français. Produits homme/femme/enfant. Prix 5000-25000 FCFA. Livraison 24-48h ville 1500 FCFA, 3-5j national 3000 FCFA, gratuit dès 30000 FCFA. Paiement livraison/Mobile Money/Orange Money. Échange sous 7 jours. Lun-Sam 9h-19h. Contact 640552195.`,messages:[{role:'user',content:text}]})
    });
    const data = await ai.json();
    const reply = data.content[0].text;
    await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
      method:'POST',
      headers:{'Authorization':`Bearer ${WA_TOKEN}`,'Content-Type':'application/json'},
      body:JSON.stringify({messaging_product:'whatsapp',to:from,type:'text',text:{body:reply}})
    });
  } catch(e){console.error(e);}
  res.sendStatus(200);
});

app.listen(3000,()=>console.log('Bot KS Shop actif!'));
