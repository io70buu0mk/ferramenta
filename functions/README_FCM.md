# Invio notifiche push FCM da Node.js

## Come funziona

- La funzione `send-fcm.js` usa la Service Account Key (`lucini-ferramenta-292446000fa2.json`) per autenticarsi con Firebase.
- Puoi inviare notifiche push FCM agli utenti usando il loro token FCM.

## Come inviare una notifica

1. Ottieni il token FCM dell'utente dal frontend.
2. Modifica `send-fcm-test.js` inserendo il token FCM reale.
3. Esegui il test:

```bash
cd functions
node send-fcm-test.js
```

## Esempio di codice

```js
const { sendPushFCM } = require('./send-fcm');

sendPushFCM('<FCM_TOKEN_UTENTE>', 'Titolo', 'Testo della notifica')
  .then((res) => console.log('Risposta FCM:', res))
  .catch((err) => console.error('Errore:', err));
```

## Note
- Puoi integrare questa funzione in una API REST, in una funzione Supabase Edge (se usi la Server Key), o in qualsiasi backend Node.js.
- Il file `.json` della Service Account deve essere mantenuto privato.
