const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/style.css', express.static(path.join(__dirname, 'style.css')));
app.use('/script.js', express.static(path.join(__dirname, 'script.js')));

const DATA_FILE = './data.json';

const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], lavages: [] }));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE));
};

const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readData();
    const user = db.users.find(u => u.nom.toLowerCase() === username.toLowerCase() && u.pass === password);
    user ? res.json({ success: true, user }) : res.status(401).json({ success: false, message: "Invalide" });
});

app.get('/api/users', (req, res) => {
    res.json(readData().users);
});

app.get('/api/lavages', (req, res) => {
    const { agentId } = req.query;
    const db = readData();
    const result = agentId ? db.lavages.filter(l => l.agentId == agentId) : db.lavages;
    res.json(result);
});

app.post('/api/lavages', (req, res) => {
    const db = readData();
    const item = { id: Date.now(), ...req.body };
    db.lavages.push(item);
    writeData(db);
    res.json(item);
});

app.put('/api/lavages/:id', (req, res) => {
    const db = readData();
    const idx = db.lavages.findIndex(l => l.id == req.params.id);
    if (idx !== -1) {
        db.lavages[idx] = { ...db.lavages[idx], ...req.body };
        writeData(db);
        res.json(db.lavages[idx]);
    }
});

app.delete('/api/lavages/:id', (req, res) => {
    const db = readData();
    db.lavages = db.lavages.filter(l => l.id != req.params.id);
    writeData(db);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Serveur prêt : http://localhost:${PORT}/login.html`));