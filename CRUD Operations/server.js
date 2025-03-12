const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require('fs');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const config = {
    user: "Vishwa",
    password: "1234",
    server: "DESKTOP-N6QQHD7\\SQLEXPRESS",
    database: "Credentials",
    options: { encrypt: false, trustServerCertificate: true },
};

app.get('/welcome', (req, res) => {
    res.send('welcome, Node.js with Express!');
});
app.get('/Cal', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Mark.html'));
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT * FROM Users WHERE username = ${username} AND password = ${password}`;
        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            if (username === 'admin') {
                return res.redirect(`/admin-dashboard?userId=${user.userId}&username=${user.username}&password=${password}`);
            }
            res.redirect(`/Mark?userId=${user.userId}&username=${user.username}&password=${password}`);
        } else {
            res.send("Invalid credentials. Please try again.");
        }
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Error while verifying credentials.");
    } finally {
        await sql.close();
    }
});

app.get("/Mark", (req, res) => {
    const { userId, username, password } = req.query;
    if (userId && username) {
        const filePath = path.join(__dirname, "Mark.html");
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send("Error reading HTML file");
            }
            let updatedHtml = data.replace('${username}', username)
                .replace('${userId}', userId)
                .replace('${password}', password);
            res.send(updatedHtml);
        });
    } else {
        res.status(400).send("User ID and Username are required.");
    }
});

app.get("/admin-dashboard", (req, res) => {
    const { userId, username, password } = req.query;
    if (userId && username) {
        const filePath = path.join(__dirname, "admin-dashboard.html");
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send("Error reading HTML file");
            }
            let updatedHtml = data.replace('${username}', username)
                .replace('${userId}', userId)
                .replace('${password}', password);
            res.send(updatedHtml);
        });
    } else {
        res.status(400).send("User ID and Username are required.");
    }
});

app.get("/list", async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query("SELECT * FROM Users");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/add", async (req, res) => {
    const { username, password } = req.body;
    try {
        await sql.connect(config);
        await sql.query`INSERT INTO Users (username, password) VALUES (${username}, ${password})`;
        res.json({ message: "Added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'content.html'));
});

app.get("/edit/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT * FROM Users WHERE userId = ${userId}`;
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put("/update/:userId", async (req, res) => {
    const { userId } = req.params;
    const { username, password } = req.body;
    try {
        await sql.connect(config);
        await sql.query`UPDATE Users SET username = ${username}, password = ${password} WHERE userId = ${userId}`;
        console.log(`Updated userId: ${userId} with username: ${username}, password: ${password}`);
        const result = await sql.query`SELECT * FROM Users WHERE userId = ${userId}`;
        if (result.recordset.length > 0) {
            const updatedUser = result.recordset[0];
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete("/delete/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        await sql.connect(config);
        const result = await sql.query`DELETE FROM Users WHERE userId = ${userId}`;
        if (result.rowsAffected[0] > 0) {
            res.json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
