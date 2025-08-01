// API Express/Node per invio notifiche push FCM

const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Service Account Key da variabile ambiente (Render)
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
  // fallback: file locale (sviluppo)
  serviceAccount = require('../lucini-ferramenta-292446000fa2.json');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

app.post('/send-fcm', async (req, res) => {
  const { token, title, body } = req.body;
  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Parametri mancanti' });
  }
  try {
    const message = {
      notification: { title, body },
      token
    };
    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('Errore invio FCM:', error);
    return res.status(500).json({ error: 'Errore invio FCM', details: error });
  }
});

// Usa la porta fornita da Render o 4000 in locale
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API FCM attiva su http://localhost:${PORT}/send-fcm`);
});
