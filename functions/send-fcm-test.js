// Script di test per invio notifica push FCM
const { sendPushFCM } = require('./send-fcm');

// Inserisci qui il token FCM del destinatario
const token = '<FCM_TOKEN_UTENTE>'; // <-- Sostituisci con il token reale
const title = 'Messaggio di prova';
const body = 'Questa è una notifica push inviata da Firebase!';

sendPushFCM(token, title, body)
  .then((res) => {
    console.log('Risposta FCM:', res);
  })
  .catch((err) => {
    console.error('Errore:', err);
  });
