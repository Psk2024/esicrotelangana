/* ================= CONFIG ================= */
const headerColors = [
  "Tomato",
  "DodgerBlue",
  "SlateBlue",
  "#8e24aa",
  "#2e7d32"
];

const apiKey = "AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc";
const spreadsheetId = "1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48";
const employeeRange = "Employees2!A1:K";

/* ================= DOM ================= */
const select = document.getElementById("cadreSelect");
const searchInput = document.getElementById("searchInput");
const container = document.getElementById("employeeTableContainer");
const totalCountEl = document.getElementById("totalCount");
const branchSummaryEl = document.getElementById("branchSummary");

const modal = document.getElementById("employeeModal");
const modalBody = document.getElementById("modalBody");
const closeBtn = document.querySelector(".close-btn");

/* ================= STATE ================= */
let allData = [];
let filteredData = [];

/* ================= FETCH DATA ================= */
async function fetchData() {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${employeeRange}?key=${apiKey}`
    );
    const json = await res.json();
    const rows = json.values || [];

    if (!rows.length) {
      container.innerHTML = "<p>No data available</p>";
      return;
    }

    allData = rows.slice(1);
    filteredData = [...allData];

    totalCountEl.textContent = new Set(allData.map(r => r[0])).size;

    populateCadreOptions();
    filterAndDisplay();
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>⚠ Unable to load data</p>";
  }
}

/* ================= DROPDOWN ================= */
function populateCadreOptions() {
  const cadres = [...new Set(allData.map(r => r[4]).filter(Boolean))].sort();
  select.innerHTML = `<option value="">All Branches</option>`;

  cadres.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });

  // ✅ DEFAULT SELECTION
  const defaultBranch = "Regional Director Cell";
  if (cadres.includes(defaultBranch)) {
    select.value = defaultBranch;
    filterAndDisplay(); // auto-load data for default branch
  }
}

/* ================= FILTER ================= */
function filterAndDisplay() {
  const cadre = select.value;
  const term = searchInput.value.trim().toLowerCase();

  filteredData = allData.filter(r => {
    const matchCadre = cadre ? r[4] === cadre : true;
    const matchSearch =
      !term ||
      r[0]?.toLowerCase().includes(term) ||
      r[1]?.toLowerCase().includes(term) ||
      r[4]?.toLowerCase().includes(term);

    return matchCadre && matchSearch;
  });

  renderTables();
  renderBranchSummary();
}

/* ================= TABLE RENDER ================= */
function renderTables() {
  if (!filteredData.length) {
    container.innerHTML = `
      <div style="padding:40px;background:#fff;border-radius:16px">
        🔍 No employees found
      </div>`;
    return;
  }

  const grouped = {};
  filteredData.forEach((r, i) => {
    const place = r[3] || "Unknown";
    grouped[place] ??= [];
    grouped[place].push({ row: r, index: i });
  });

  let html = "";
  let colorIndex = 0;

  for (const [place, list] of Object.entries(grouped)) {
    const count = new Set(list.map(o => o.row[0])).size;
    const color = headerColors[colorIndex++ % headerColors.length];

    html += `
      <div class="place-section">
        <h2 style="color:${color}">
          ${place}
          <span style="font-size:.75em;color:#666">(${count})</span>
        </h2>

        <table class="employee-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Branch</th>
              <th>Date of Joining</th>
            </tr>
          </thead>
          <tbody>
    `;

    list.forEach(o => {
      const r = o.row;
      html += `
        <tr class="clickable-row" data-index="${o.index}">
          <td>${r[0] || "-"}</td>
          <td>${r[1] || "-"}</td>
          <td>${r[2] || "-"}</td>
          <td>${r[4] || "-"}</td>
          <td>${r[8] || "-"}</td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
  }

  container.innerHTML = html;

  document.querySelectorAll(".clickable-row").forEach(row => {
    row.addEventListener("click", () =>
      showEmployeeModal(+row.dataset.index)
    );
  });
}

/* ================= BRANCH SUMMARY ================= */
function renderBranchSummary() {
  if (!select.value) {
    branchSummaryEl.innerHTML = "";
    return;
  }

  const counts = {};
  const ids = new Set();

  filteredData.forEach(r => {
    counts[r[2]] = (counts[r[2]] || 0) + 1;
    ids.add(r[0]);
  });

  branchSummaryEl.innerHTML = `
    <div class="branch-summary">
      <div class="branch-summary-title">Branch Summary</div>
      <div class="branch-summary-items">
        ${Object.entries(counts)
          .map(
            ([d, c]) =>
              `<div class="summary-pill">${d}<span>${c}</span></div>`
          )
          .join("")}
      </div>
      <div class="branch-summary-total">
        Total Employees: <strong>${ids.size}</strong>
      </div>
    </div>
  `;
}

/* ================= MODAL ================= */
function showEmployeeModal(index) {
  const e = filteredData[index];
  if (!e) return;

  const imageUrl = e[0] ? `images/${e[0]}.jpg` : "images/default.png";

  modalBody.innerHTML = `
    <div class="emp-modal-header">
      <h3>${e[1] || "-"}</h3>
      <p>${e[2] || "-"}</p>
    </div>

    <div class="emp-modal-body">
      <div class="emp-photo">
        <img src="${imageUrl}" onerror="this.src='images/default.png'">
      </div>

      <div class="emp-details">
        <div class="detail-grid">
          <div class="label">Employee ID</div><div class="value">${e[0] || "-"}</div>
          <div class="label">Branch</div><div class="value">${e[4] || "-"}</div>
          <div class="label">Place</div><div class="value">${e[3] || "-"}</div>
          <div class="label">Gender</div><div class="value">${e[5] || "-"}</div>
          <div class="label">Date of Birth</div><div class="value">${e[6] || "-"}</div>
          <div class="label">Date of Joining</div><div class="value">${e[8] || "-"}</div>
          <div class="label">Date of Retirement</div><div class="value">${e[7] || "-"}</div>
          <div class="label">Contact</div><div class="value">${e[10] || "-"}</div>
        </div>
      </div>
    </div>
  `;

  modal.style.display = "block";
}

/* ================= MODAL CLOSE ================= */
closeBtn.onclick = () => (modal.style.display = "none");

window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};

window.addEventListener("keydown", e => {
  if (e.key === "Escape") modal.style.display = "none";
});

/* ================= EVENTS ================= */
select.addEventListener("change", filterAndDisplay);
searchInput.addEventListener("input", filterAndDisplay);

/* ================= INIT ================= */
fetchData();
