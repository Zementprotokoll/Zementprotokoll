
document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section");
  const appSection = document.getElementById("app-section");
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("login-error");

  const entryForm = document.getElementById("entry-form");
  const pfahlInput = document.getElementById("pfahl");
  const datumInput = document.getElementById("datum");
  const spuelungInput = document.getElementById("spuelung");
  const verpressungInput = document.getElementById("verpressung");
  const siloInput = document.getElementById("silo");
  const tableBody = document.querySelector("#entry-table tbody");

  let restSilo = 0;

  const allowedUsers = ["David", "Michael", "Roman"];

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (allowedUsers.includes(username) && password === username) {
      loginSection.style.display = "none";
      appSection.style.display = "block";
      loginError.textContent = "";
    } else {
      loginError.textContent = "Benutzername oder Passwort falsch.";
    }

    usernameInput.value = "";
    passwordInput.value = "";
  });

  entryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const pfahl = pfahlInput.value.trim();
    const datum = datumInput.value;
    const spuelung = parseFloat(spuelungInput.value) || 0;
    const verpressung = parseFloat(verpressungInput.value) || 0;
    const silo = parseFloat(siloInput.value) || 0;
    const gesamt = spuelung + verpressung;

    restSilo = restSilo + silo - gesamt;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${pfahl}</td>
      <td>${datum}</td>
      <td>${spuelung}</td>
      <td>${verpressung}</td>
      <td>${gesamt}</td>
      <td>${restSilo}</td>
      <td>${silo > 0 ? silo : ""}</td>
      <td><button class="delete-btn">🗑</button></td>
    `;
    tableBody.appendChild(row);

    pfahlInput.value = "";
    datumInput.value = "";
    spuelungInput.value = "";
    verpressungInput.value = "";
    siloInput.value = "";
  });

  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const row = e.target.closest("tr");
      tableBody.removeChild(row);
    }
  });
});
