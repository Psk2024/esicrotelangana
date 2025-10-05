const headerColors = ['#808000', '#ffa500', '#ff00ff', '#fce4ec', '#ede7f6', '#e8eaf6'];
const apiKey = 'AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc';
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48';
const employeeRange = 'Employees2!A1:K';

let allData = [];
let filteredData = [];

const select = document.getElementById('cadreSelect');
const searchInput = document.getElementById('searchInput');
const container = document.getElementById('employeeTableContainer');

// Fetch and initialize data
async function fetchData() {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${employeeRange}?key=${apiKey}`);
    const data = await res.json();
    const rows = data.values || [];
    if (!rows.length) {
      container.innerHTML = '<p>No employee data found.</p>';
      return;
    }

    allData = rows.slice(1); // exclude header row

    const cadreSet = new Set(allData.map(row => row[7]).filter(Boolean));
    populateCadreOptions([...cadreSet].sort());

    filterAndDisplay();
  } catch (error) {
    console.error('Fetch error:', error);
    container.innerHTML = '<p>⚠️ Unable to load employee data.</p>';
  }
}

// Populate cadre select options
function populateCadreOptions(cadres) {
  select.innerHTML = '<option value="">All Branches</option>';
  cadres.forEach(cadre => {
    const option = document.createElement('option');
    option.value = cadre;
    option.textContent = cadre;
    select.appendChild(option);
  });
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Highlight search term in text
function highlight(text, searchTerm) {
  if (!searchTerm) return text;
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[]\\]/g, '\\$&'); // escape RegExp special chars
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Filter and display employees based on search and cadre
function filterAndDisplay() {
  const selectedCadre = select.value;
  const searchTerm = searchInput.value.trim().toLowerCase();

  filteredData = allData.filter(row => {
    const matchesCadre = selectedCadre ? row[7] === selectedCadre : true;
    const matchesSearch = searchTerm ? 
      (row[0]?.toLowerCase().includes(searchTerm) || row[1]?.toLowerCase().includes(searchTerm) || row[3]?.toLowerCase().includes(searchTerm))
      : true;
    return matchesCadre && matchesSearch;
  });

  if (!filteredData.length) {
    container.innerHTML = '<p>No employees found.</p>';
    return;
  }

  displayAll();
}

// Display employees grouped by place with clickable rows
function displayAll() {
  const searchTerm = searchInput.value.trim();
  const grouped = filteredData.reduce((group, row) => {
    const place = row[3] || 'Unknown';
    (group[place] ||= []).push(row);
    return group;
  }, {});

  let colorIndex = 0;
  let html = '';
  let globalIndex = 0;
for (const [place, placeData] of Object.entries(grouped)) {
  const bgColor = headerColors[colorIndex % headerColors.length];
  colorIndex++;
  html += `<h2 style="color:${bgColor}">${place}</h2>`;
  html += `<table role="table" aria-label="Employees in ${place}"><thead><tr>`;
  ['S.No.', 'Employee ID', 'Name', 'Designation', 'Branch'].forEach(header => {
    html += `<th scope="col">${header}</th>`;
  });
  html += '</tr></thead><tbody>';
  placeData.forEach((row, index) => {
    html += `<tr tabindex="0" class="clickable-row" data-index="${globalIndex}">`;
    html += `<td>${index + 1}</td>`;
    html += `<td>${highlight(row[0] || '', searchTerm)}</td>`;
    html += `<td>${highlight(row[1] || '', searchTerm)}</td>`;
    html += `<td>${row[2] || ''}</td>`;
    html += `<td>${highlight(row[7] || '', searchTerm)}</td>`;
    html += `</tr>`;
    globalIndex++;
  });
  html += '</tbody></table>';
}

  container.innerHTML = html;

  // Attach click event listeners to open modal
  document.querySelectorAll('.clickable-row').forEach(row => {
    row.addEventListener('click', () => {
      const idx = Number(row.getAttribute('data-index'));
      showEmployeeModal(idx);
    });
  });
}

function showEmployeeModal(index) {
  const emp = filteredData[index];
  if (!emp) return;

  const modal = document.getElementById('employeeModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  const employeeId = emp[0] || '';
  const imageUrl = employeeId ? `images/${employeeId}.jpg` : 'images/png.jpg';
  const name = emp[1] || 'Employee Details';
  const des = emp[2] || 'Employee Details';
  
  // Modal body: image left, table-like details right
 modalBody.innerHTML = `
  <div style=" text-align: left; padding: 5px; ">
    <h3 style="margin: 0; font-size: 2.5em; color: #333;">${name}</h3>
    <span style="font-size: 1em; color: #666;">${des}</span>
  </div>
  <div style="
    display:flex; 
    gap:16px; 
    align-items:flex-start; 
  justify-content: center;
    height:auto; 
    background: #fff; 
    padding: 24px; 
    border-radius: 12px; 
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    max-width: 500px;
    width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  ">
 
    <div style="flex:0 0 140px; display:flex; align-items:flex-start; justify-content:center;">
      <img src="${imageUrl}" alt="${name}" 
           style="width:140px; height:140px; border-radius: 16px; object-fit: cover; border: 1px solid #ddd;" 
           onerror="this.src='images/default.png'">
    </div>
    <div style="
      flex:1; 
      display:grid; 
      grid-template-columns: minmax(120px, 25%) 1fr; 
      row-gap: 14px; 
      column-gap: 24px; 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      font-size: 1em; 
      color: #444; 
      text-align: left; 
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-word;
    ">
      <div style="font-weight:600; color:#666;">Employee ID</div>
      <div>${emp[0] || ''}</div>

      <div style="font-weight:600; color:#666;">Contact Details</div>
      <div>${emp[10] || ''}</div>

      <div style="font-weight:600; color:#666;">Gender</div>
      <div>${emp[4] || ''}</div>

      <div style="font-weight:600; color:#666;">Branch</div>
      <div>${emp[7] || ''}</div>

      <div style="font-weight:600; color:#666;">DoJ in Branch</div>
      <div>${emp[8] || ''}</div>

      <div style="font-weight:600; color:#666;">Date of Birth</div>
      <div>${emp[5] || ''}</div>

      <div style="font-weight:600; color:#666;">Date of Retirement</div>
      <div>${emp[6] || ''}</div>
    </div>
  </div>
`;
  modal.style.display = 'block';
} 
// Modal close handlers
const modal = document.getElementById('employeeModal');
const closeBtn = modal.querySelector('.close-btn');

closeBtn.onclick = () => {
  modal.style.display = 'none';
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
};

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modal.style.display = 'none';
  }
});

// Initialize fetch and setup event listeners
select.addEventListener('change', filterAndDisplay);
searchInput.addEventListener('input', debounce(filterAndDisplay, 300));

fetchData();
