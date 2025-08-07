
let entries = JSON.parse(localStorage.getItem("zementEntries")) || [];
let restSilo = 0;
let allowedUsers = ["David", "Michael", "Roman"];

window.onload = function() {
    const user = localStorage.getItem("loggedInUser");
    if (user && allowedUsers.includes(user)) {
        showApp();
    }
}

function login() {
    const user = document.getElementById("username").value;
    const pw = document.getElementById("password").value;
    if (allowedUsers.includes(user) && pw === user) {
        localStorage.setItem("loggedInUser", user);
        showApp();
    } else {
        document.getElementById("loginError").style.display = "block";
    }
}

function logout() {
    localStorage.removeItem("loggedInUser");
    location.reload();
}

function showApp() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("appContainer").style.display = "block";
    recalculateRestSilo();
    updateTable();
}

document.getElementById('entryForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const pile = document.getElementById('pileNumber').value;
    const date = document.getElementById('date').value;
    const press = parseFloat(document.getElementById('pressAmount').value);
    const flush = parseFloat(document.getElementById('flushAmount').value);
    const pressure = parseFloat(document.getElementById('pressure').value);
    const refill = parseFloat(document.getElementById('siloRefill').value) || 0;
    const total = press + flush;
    const createdAt = Date.now();
    restSilo += refill - total;
    entries.push({ pile, date, press, flush, pressure, total, refill, restSilo, createdAt });
    saveAndRefresh();
    this.reset();
});

function updateTable() {
    const table = document.getElementById('logTable');
    table.innerHTML = '';
    [...entries].reverse().forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.pile}</td>
            <td>${entry.date}</td>
            <td>${entry.press}</td>
            <td>${entry.flush}</td>
            <td>${entry.pressure}</td>
            <td>${entry.total}</td>
            <td>${entry.refill}</td>
            <td>${entry.restSilo.toFixed(2)}</td>
            <td>
                <button onclick="editEntry(${index})">Bearbeiten</button>
                <button onclick="deleteEntry(${index})">Löschen</button>
            </td>
        `;
        table.appendChild(row);
    });
}

function deleteEntry(index) {
    entries.splice(index, 1);
    saveAndRefresh();
}

function editEntry(index) {
    const entry = entries[index];
    document.getElementById('pileNumber').value = entry.pile;
    document.getElementById('date').value = entry.date;
    document.getElementById('pressAmount').value = entry.press;
    document.getElementById('flushAmount').value = entry.flush;
    document.getElementById('pressure').value = entry.pressure;
    document.getElementById('siloRefill').value = entry.refill;
    deleteEntry(index);
}

function recalculateRestSilo() {
    restSilo = 0;
    entries.forEach(e => {
        restSilo += e.refill - e.total;
        e.restSilo = restSilo;
    });
}

function saveAndRefresh() {
    recalculateRestSilo();
    localStorage.setItem("zementEntries", JSON.stringify(entries));
    updateTable();
}
