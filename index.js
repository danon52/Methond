// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const resultDiv = document.getElementById('result');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            const data = await response.json();
            resultDiv.innerHTML = data.success
                ? `User registered with ID: ${data.userId}`
                : `Error: ${data.error}`;
        } catch (error) {
            resultDiv.innerHTML = `Error: ${error.message}`;
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const credentials = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
        };

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await response.json();
            if (data.success) {
                resultDiv.innerHTML = `Welcome, ${data.user.username}!`;
            } else {
                resultDiv.innerHTML = `Login failed: ${data.error}`;
            }
        } catch (error) {
            resultDiv.innerHTML = `Error: ${error.message}`;
        }
    });
});