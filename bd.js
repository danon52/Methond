require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

class Database {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    async initialize() {
        try {
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    phone VARCHAR(20) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }
    async createUser(email, phone, password, username) {
        try {
            // Хеширование пароля перед сохранением
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await this.pool.query(
                'INSERT INTO users (email, phone, password, username) VALUES (?, ?, ?, ?)',
                [email, phone, hashedPassword, username]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    async getUserByEmail(email) {
        try {
            const [rows] = await this.pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }

    async getUserByPhone(phone) {
        try {
            const [rows] = await this.pool.query(
                'SELECT * FROM users WHERE phone = ?',
                [phone]
            );
            return rows[0];
        } catch (error) {
            console.error('Error getting user by phone:', error);
            throw error;
        }
    }
    async verifyUser(email, password) {
        try {
            const user = await this.getUserByEmail(email);
            if (!user) return false;
            const isMatch = await bcrypt.compare(password, user.password);
            return isMatch ? user : false;
        } catch (error) {
            console.error('Error verifying user:', error);
            throw error;
        }
    }
    async close() {
        await this.pool.end();
    }
}

module.exports = new Database();