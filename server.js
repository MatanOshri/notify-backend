require('dotenv').config();
const express = require('express');
const webPush = require('web-push');
const cors = require('cors');  // Import CORS
const bodyParser = require('body-parser');

const app = express();

app.use(cors({
    origin: 'https://matanoshri.github.io'  // Replace with your client origin
}));
app.use(bodyParser.json());

// VAPID keys (public and private)
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

// Configure web-push with VAPID details
webPush.setVapidDetails(
    'mailto:your-email@example.com', // Change this to your contact email
    vapidPublicKey,
    vapidPrivateKey
);

// In-memory storage for subscriptions (for testing only)
const subscriptions = [];

// Endpoint to get the VAPID public key
app.get('/vapidPublicKey', (req, res) => {
    res.json({ publicKey: vapidPublicKey });
});

// Endpoint to register a new subscription
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    console.log(subscription)
    console.log("Subscription added successfully")
    res.status(201).json({ message: 'Subscription added successfully' });
});

// Endpoint to send a test notification to all registered subscriptions
app.post('/sendNotification', (req, res) => {
    const notificationPayload = JSON.stringify({
        title: 'Test Notification',
        body: 'This is a test notification from the server',
    });

    const promises = subscriptions.map(subscription =>
        webPush.sendNotification(subscription, notificationPayload)
            .catch(error => console.error('Notification error:', error))
    );

    Promise.all(promises)
        .then(() => res.status(200).json({ message: 'Test notification sent successfully' }))
        .catch(error => res.sendStatus(500).json({ error }));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});