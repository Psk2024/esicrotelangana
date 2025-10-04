const headerColors = ['#808000', '#ffa500', '#ff00ff', '#fce4ec', '#ede7f6', '#e8eaf6'];
const apiKey = 'AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc';
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48';
const employeeRange = 'Employees2!A1:J';

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
  ['S.No.', 'Employee ID', 'Name', 'Designation', 'Branch', 'Date of Joining'].forEach(header => {
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
    html += `<td>${row[8] || ''}</td>`;
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

  const imageUrl = emp[9] || ''; // Assuming image URL is in column 10
  const name = (emp[1] || 'Employee Details').toUpperCase();

  // Combine name + image in title area
  const titleHtml = `
    <div style="display:flex; align-items:center; justify-content:left; gap:12px; flex-wrap:wrap;">
      ${imageUrl ? `
        <img src="${imageUrl}" alt="Photo of ${name}"
          style="
            width:120px;
            height:120px;
            border-radius:20%;
            object-fit:cover;
            box-shadow:0 3px 8px rgba(0,0,0,0.2);
            border:3px solid #fff;
          ">`
        : `<div style="
            width:80px;
            height:80px;
            border-radius:50%;
            background:#ccc;
          "></div>`}
      <h3 style="margin:0; font-size:1.2em; color:#333; text-align:center;">${name}</h3>
  </div>
  `;

  modalTitle.innerHTML = titleHtml;

  modalBody.innerHTML = `
    <table style="width:100%; border-collapse:collapse; margin-top:10px;">
      <tr><td style="padding:4px 8px;"><strong>Employee ID:</strong></td><td style="padding:4px 8px;">${emp[0] || ''}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Designation:</strong></td><td style="padding:4px 8px;">${emp[2]||''}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Branch:</strong></td><td style="padding:4px 8px;">${emp[7]||''}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Gender:</strong></td><td style="padding:4px 8px;">${emp[4]||''}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Date of Birth:</strong></td><td style="padding:4px 8px;">${emp[5]||''}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Date of Retirement:</strong></td><td style="padding:4px 8px;">${emp[6]||''}</td></tr>
    </table>
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
