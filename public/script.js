let currentUser = JSON.parse(localStorage.getItem('activeUser'));

document.addEventListener('DOMContentLoaded', () => {
    const entryBtn = document.getElementById('entryBtn');
    if (entryBtn) entryBtn.addEventListener('click', verifierAcces);

    const dashBtn = document.getElementById('dashBtn');
    if (dashBtn) dashBtn.addEventListener('click', allerAuDash);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', sortir);

    if (document.getElementById('listData')) {
        if (!currentUser || currentUser.role !== 'agent') {
            window.location.href = 'login.html';
        } else {
            document.getElementById('nameLabel').innerText = currentUser.nom;
            loadLavages();
        }
    }

    if (document.getElementById('adminTableBody')) {
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'login.html';
        } else {
            const monthInput = document.getElementById('monthPick');
            monthInput.value = new Date().toISOString().slice(0, 7);
            monthInput.addEventListener('change', calculerRapport);
            calculerRapport();
        }
    }

    const openAddBtn = document.getElementById('openAddBtn');
    if (openAddBtn) openAddBtn.addEventListener('click', ouvrir);

    const closeFormBtn = document.getElementById('closeFormBtn');
    if (closeFormBtn) closeFormBtn.addEventListener('click', fermer);

    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', sauver);
});

async function verifierAcces() {
    const n = document.getElementById('userInput').value.trim();
    const p = document.getElementById('passInput').value.trim();
    const e = document.getElementById('errorTxt');

    if (n === "" || p === "") {
        e.innerText = "Champs requis.";
        e.style.display = "block";
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: n, password: p })
        });
        const result = await response.json();
        if (result.success) {
            localStorage.setItem('activeUser', JSON.stringify(result.user));
            currentUser = result.user; 
            document.getElementById('logCont').style.display = 'none';
            document.getElementById('succesCont').style.display = 'block';
            document.getElementById('greetMsg').innerText = "Bonjour " + result.user.nom;
        } else {
            e.innerText = result.message;
            e.style.display = "block";
        }
    } catch (err) {
        e.innerText = "Erreur serveur.";
        e.style.display = "block";
    }
}

function allerAuDash() {
    const active = JSON.parse(localStorage.getItem('activeUser'));
    window.location.href = active.role === "admin" ? "admin.html" : "agent.html";
}

async function loadLavages() {
    const response = await fetch(`http://localhost:3000/api/lavages?agentId=${currentUser.id}`);
    const data = await response.json();
    const box = document.getElementById('listData');
    box.innerHTML = '';
    data.forEach(l => {
        box.innerHTML += `<tr>
            <td>${l.date}</td>
            <td>${l.typeVehicule}</td>
            <td>${l.typeVehicule === 'SUV' ? '1.5' : '1.0'}</td>
            <td>
                <button class="btn-action" onclick="preparerEdition(${l.id}, '${l.typeVehicule}', '${l.date}')">Modifier</button>
                <button class="btn-action" style="color:red;" onclick="supprimer(${l.id})">Supprimer</button>
            </td>
        </tr>`;
    });
}

async function calculerRapport() {
    const selMonth = document.getElementById('monthPick').value;
    const resUsers = await fetch('http://localhost:3000/api/users');
    const allUsers = await resUsers.json();
    const agents = allUsers.filter(u => u.role === 'agent');
    const resLavages = await fetch('http://localhost:3000/api/lavages');
    const allLavages = await resLavages.json();
    const table = document.getElementById('adminTableBody');
    table.innerHTML = '';
    agents.forEach(agent => {
        const mine = allLavages.filter(l => l.agentId == agent.id && l.date.startsWith(selMonth));
        let totalUnits = 0;
        let workDays = new Set();
        mine.forEach(l => {
            totalUnits += (l.typeVehicule === 'SUV' ? 1.5 : 1.0);
            workDays.add(l.date);
        });
        const nbDays = workDays.size;
        const avg = nbDays > 0 ? (totalUnits / nbDays) : 0;
        const quota = 6;
        let bonus = 0;
        let badge = '';
        if (avg > quota) {
            bonus = (totalUnits - (quota * nbDays)) * 50;
            badge = '<span class="badge badge-success">Quota Atteint</span>';
        } else if (nbDays > 0) {
            badge = '<span class="badge badge-fail">Sous Quota</span>';
        }
        table.innerHTML += `<tr>
            <td style="font-weight:bold;">${agent.nom}</td>
            <td>${nbDays} j</td>
            <td>${totalUnits.toFixed(1)}</td>
            <td>${avg.toFixed(2)}</td>
            <td>${badge}</td>
            <td class="bonus-amt">${bonus.toFixed(2)} DH</td>
        </tr>`;
    });
}

function ouvrir() {
    document.getElementById('editId').value = '';
    document.getElementById('formTitle').innerText = "Nouveau Lavage";
    document.getElementById('vDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('sideForm').classList.add('active');
}

function fermer() {
    document.getElementById('sideForm').classList.remove('active');
}

async function sauver() {
    const t = document.getElementById('vType').value;
    const d = document.getElementById('vDate').value;
    const id = document.getElementById('editId').value;
    const payload = { agentId: currentUser.id, typeVehicule: t, date: d };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:3000/api/lavages/${id}` : 'http://localhost:3000/api/lavages';
    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    fermer();
    loadLavages();
}

async function supprimer(id) {
    if (confirm('Supprimer cet élément ?')) {
        await fetch(`http://localhost:3000/api/lavages/${id}`, { method: 'DELETE' });
        loadLavages();
    }
}

function preparerEdition(id, type, date) {
    document.getElementById('editId').value = id;
    document.getElementById('vType').value = type;
    document.getElementById('vDate').value = date;
    document.getElementById('formTitle').innerText = "Modifier Lavage";
    document.getElementById('sideForm').classList.add('active');
}

function sortir() {
    localStorage.removeItem('activeUser');
    window.location.href = 'login.html';
}