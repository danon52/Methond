const db = require('./db');
const express = require('express');
const bodyParser = require('body-parser');
// Отдельный файл для тестов (test.js)
async function testDatabase() {
    try {
        await db.initialize();

        const userId = await db.createUser(
            'test@example.com',
            '+1234567890',
            'securepassword123',
            'Test User'
        );
        console.log('Created user with ID:', userId);

        const userByEmail = await db.getUserByEmail('test@example.com');
        console.log('User by email:', userByEmail);

        const userByPhone = await db.getUserByPhone('+1234567890');
        console.log('User by phone:', userByPhone);

        const verifiedUser = await db.verifyUser('test@example.com', 'securepassword123');
        console.log('Verified user:', verifiedUser ? 'Success' : 'Failed');

        const failedVerification = await db.verifyUser('test@example.com', 'wrongpassword');
        console.log('Failed verification:', failedVerification ? 'Success' : 'Failed');

    } catch (error) {
        console.error('Error in test:', error);
    } finally {
        await db.close();
    }
}
// Серверный код (server.js)
function setupServer() {
    const app = express();
    const PORT = 3000;

    app.use(bodyParser.json());

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

    app.post('/api/register', async (req, res) => {
        try {
            const { email, phone, password, username } = req.body;
            const userId = await db.createUser(email, phone, password, username);
            res.json({ success: true, userId });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    });

    app.post('/api/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await db.verifyUser(email, password);
            if (user) {
                res.json({ success: true, user });
            } else {
                res.status(401).json({ success: false, error: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return app;
}

// Запуск (main.js)
(async () => {
    try {
        await db.initialize();

        // Если нужно выполнить тесты
        // await testDatabase();
        // await db.initialize(); // Повторная инициализация после тестоы
        const app = setupServer();
        app.listen(3000, () => {
            console.log('Server running on http://localhost:3000');
        });
        // Для graceful shutdown
        process.on('SIGTERM', async () => {
            await db.close();
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to start:', error);
        process.exit(1);
    }
})();