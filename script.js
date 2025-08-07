
const supabase = supabase.createClient(
  "https://zfhylghomiranivhemek.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaHlsZ2hvbWlyYW5pdmhlbWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTg2NjcsImV4cCI6MjA3MDEzNDY2N30.9ZklUAdbUozGi78PhIzoFAhVmkLRWXlknBgHOlf1WVM"
);

let entries = [];
let editingId = null;
let restSilo = 0;
const allowedUsers = ["David", "Michael", "Roman"];

window.onload = () => {
  const user = localStorage.getItem("loggedInUser");
  if (user && allowedUsers.includes(user)) showApp();
};

function login() {
  const user = document.getElementById("username").value.trim();
  const pw = document.getElementById("password").value.trim();
  if (allowedUsers.includes(user) && pw === user) {
    localStorage.setItem("loggedInUser", user);
    showApp();
  } else {
    document.getElementById("loginError").textContent = "Falscher Benutzername oder Passwort";
  }
}

function logout() {
  localStorage.removeItem("loggedInUser");
  location.reload();
}

function showApp() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("appContainer").style.display = "block";
  loadEntries();
}

document.getElementById("entryForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const pile = document.getElementById("pileNumber").value;
  const date = document.getElementById("date").value;
  const flush = parseFloat(document.getElementById("flushAmount").value);
  const press = parseFloat(document.getElementById("pressAmount").value);
  const pressure = parseFloat(document.getElementById("pressure").value);
  const refill = parseFloat(document.getElementById("refill").value) || 0;
  const total = flush + press;
  const createdAt = Date.now();

  if (editingId) {
    supabase
      .from("entries")
      .update({ pile, date, flush, press, pressure, refill, total, createdAt })
      .eq("id", editingId)
      .then(() => {
        editingId = null;
        loadEntries();
        this.reset();
      });
  } else {
    restSilo += refill - total;
    supabase
      .from("entries")
      .insert({ pile, date, flush, press, pressure, refill, total, restSilo, createdAt })
      .then(() => {
        loadEntries();
        this.reset();
      });
  }
});

function loadEntries() {
  supabase
    .from("entries")
    .select("*")
    .order("createdAt", { ascending: true })
    .then(({ data, error }) => {
      if (error) return alert("Fehler beim Laden");
      entries = data || [];
      recalculateRestSilo();
      updateTable();
    });
}

function recalculateRestSilo() {
  restSilo = 0;
  entries.forEach((e) => {
    restSilo += e.refill - e.total;
    e.restSilo = restSilo;
  });
}

function updateTable() {
  const table = document.getElementById("logTable");
  table.innerHTML = "";
  [...entries].reverse().forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.pile}</td>
      <td>${entry.date}</td>
      <td>${entry.flush}</td>
      <td>${entry.press}</td>
      <td>${entry.total}</td>
      <td>${entry.restSilo.toFixed(2)}</td>
      <td>${entry.refill}</td>
      <td>
        <button onclick="editEntry('${entry.id}')">Bearbeiten</button>
        <button onclick="deleteEntry('${entry.id}')">Löschen</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function deleteEntry(id) {
  supabase
    .from("entries")
    .delete()
    .eq("id", id)
    .then(() => loadEntries());
}

function editEntry(id) {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;
  document.getElementById("pileNumber").value = entry.pile;
  document.getElementById("date").value = entry.date;
  document.getElementById("flushAmount").value = entry.flush;
  document.getElementById("pressAmount").value = entry.press;
  document.getElementById("pressure").value = entry.pressure;
  document.getElementById("refill").value = entry.refill;
  editingId = id;
}
