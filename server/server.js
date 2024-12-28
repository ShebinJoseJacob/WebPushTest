const express = require('express');
const webPush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Generate VAPID keys using `web-push generate-vapid-keys`
const vapidKeys = {
    publicKey: 'BG88JGfZ36naDj2eX_bgCyA46pNiJXqu1m4yHQ_3y0WIPOlB_Pa5cJBikj7PQFc0KbecDmbK8OEz6PnmXuRNJB4',
    privateKey: '9zdgj4zeHTYUaKweDm7JrKv5Hj_GEt7de9nQdmV5c4s',
};

// Configure web-push
webPush.setVapidDetails(
    'mailto:example@yourdomain.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// Store subscriptions (use a database in production)
let subscriptions = [];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({});
});

app.post('/notify', (req, res) => {
    // Extract the title and body from the request body
    const { title, body } = req.body;

    // Check if title and body are provided
    if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
    }

    // Create the notification payload
    const notificationPayload = JSON.stringify({ title, body });

    // Send notifications to all subscriptions
    const promises = subscriptions.map((subscription) =>
        webPush.sendNotification(subscription, notificationPayload)
    );

    Promise.all(promises)
        .then(() => res.status(200).json({ message: 'Notifications sent' }))
        .catch((error) => {
            console.error('Error sending notification', error);
            res.sendStatus(500);
        });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
