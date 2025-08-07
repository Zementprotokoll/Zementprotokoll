
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

function generatePDF(onlyNew) {
    const doc = new jspdf.jsPDF();
    doc.setFontSize(12);
    doc.text("Zementprotokoll – Tagesbericht", 14, 15);
    const lastReport = parseInt(localStorage.getItem("lastReportDate")) || 0;
    const now = Date.now();
    let filteredEntries = entries;
    if (onlyNew) {
        filteredEntries = entries.filter(e => e.createdAt && e.createdAt > lastReport);
    }
    if (filteredEntries.length === 0) {
        alert("Keine neuen Einträge seit dem letzten Bericht.");
        return;
    }
    const headers = [["Pfahl", "Datum", "Verpress (kg)", "Spülung (kg)", "Druck (bar)", "Menge ges.", "Befüllung", "Rest Silo"]];
    const data = filteredEntries.map(e => [
        e.pile, e.date, e.press, e.flush, e.pressure, e.total, e.refill, e.restSilo.toFixed(2)
    ]);
    doc.autoTable({
        startY: 20,
        head: headers,
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220] }
    });
    doc.save("zementbericht.pdf");
    if (onlyNew) {
        localStorage.setItem("lastReportDate", now);
    }
    if (navigator.canShare) {
        doc.output("blob").then(blob => {
            const file = new File([blob], "zementbericht.pdf", { type: "application/pdf" });
            navigator.share({
                files: [file],
                title: "Zementbericht",
                text: "Tagesbericht vom Zementprotokoll"
            }).catch(err => console.log("Teilen abgebrochen:", err));
        });
    }
}

function toggleOldEntries(hideOld) {
    const lastReport = parseInt(localStorage.getItem("lastReportDate")) || 0;
    const table = document.getElementById('logTable');
    table.innerHTML = '';
    [...entries].reverse().forEach((entry, index) => {
        const isOld = entry.createdAt <= lastReport;
        if (hideOld && isOld) return;
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


// jsPDF + AutoTable für PDF-Erstellung
document.getElementById("export-pdf").addEventListener("click", () => {
  if (typeof window.jspdf === "undefined" || typeof window.jspdf.autoTable === "undefined") {
    alert("PDF-Export funktioniert nicht – jsPDF fehlt!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const table = document.getElementById("entry-table");
  if (!table) {
    alert("Keine Tabelle gefunden.");
    return;
  }

  const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.innerText);
  const rows = Array.from(table.querySelectorAll("tbody tr")).map(tr => 
    Array.from(tr.querySelectorAll("td")).map(td => td.innerText)
  );

  doc.text("Zementprotokoll – Einträge", 14, 16);
  doc.autoTable({
    startY: 20,
    head: [headers],
    body: rows,
  });

  doc.save("zementprotokoll.pdf");
});
