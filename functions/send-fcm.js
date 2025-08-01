// Funzione Node.js per inviare notifiche push FCM usando la Service Account Key
const admin = require('firebase-admin');
const serviceAccount = require('../lucini-ferramenta-292446000fa2.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Invia una notifica push FCM
 * @param {string} token - Token FCM destinatario
 * @param {string} title - Titolo della notifica
 * @param {string} body - Corpo della notifica
 */
async function sendPushFCM(token, title, body) {
  const message = {
    notification: { title, body },
    token
  };
  try {
    const response = await admin.messaging().send(message);
    console.log('Notifica inviata:', response);
    return response;
  } catch (error) {
    console.error('Errore invio FCM:', error);
    throw error;
  }
}

// Esempio di utilizzo:
// sendPushFCM('<FCM_TOKEN_UTENTE>', 'Titolo', 'Testo della notifica');

module.exports = { sendPushFCM };
