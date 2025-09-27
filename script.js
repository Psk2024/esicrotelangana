const headerColors = [
  '#808000', '#ffa500', '#ff00ff', '#fce4ec', '#ede7f6', '#e8eaf6'
];

const apiKey = 'AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc';
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48';

const employeeRange = 'Employees2!A1:J';
const sanctionedRange = 'SanctionedStrength!A2:C';

let allData = [];
let sanctionedStrength = {};

async function fetchSanctionedStrength() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sanctionedRange}?key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const rows = data.values || [];

    sanctionedStrength = {};
    rows.forEach(row => {
      const place = row[0];
      const cadre = row[1];
      const sanctioned = parseInt(row[2]) || 0;

      if (!sanctionedStrength[place]) {
        sanctionedStrength[place] = {};
      }
      sanctionedStrength[place][cadre] = sanctioned;
    });
  } catch (err) {
    console.error("Error loading sanctioned strength data:", err);
  }
}

async function fetchData() {
  await fetchSanctionedStrength();

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${employeeRange}?key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const rows = data.values || [];

    if (rows.length === 0) return;

    allData = rows.slice(1);

    const cadreSet = new Set();
    allData.forEach(row => {
      if (row[1]) cadreSet.add(row[1]);
    });

    const select = document.getElementById('cadreSelect');
    [...cadreSet].sort().forEach(cadre => {
      const option = document.createElement('option');
      option.value = cadre;
      option.textContent = cadre;
      select.appendChild(option);
    });

    document.getElementById('cadreSelect').addEventListener('change', filterAndDisplay);
    document.getElementById('searchInput').addEventListener('input', filterAndDisplay);

    filterAndDisplay();

  } catch (err) {
    console.error("Error loading employee data:", err);
    document.getElementById('cadreSelect').innerHTML = '<option>Error loading</option>';
  }
}

function filterAndDisplay() {
  const selectedCadre = document.getElementById('cadreSelect').value;
  const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
  const container = document.getElementById('employeeTableContainer');

  let filtered = allData;

  if (selectedCadre) {
    filtered = filtered.filter(row => row[1] === selectedCadre);
  }

  if (searchTerm) {
    filtered = filtered.filter(row =>
      (row[0] || '').toLowerCase().includes(searchTerm) ||
      (row[4] || '').toLowerCase().includes(searchTerm)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p>No employees found.</p>';
    return;
  }

  const grouped = {};
  filtered.forEach(row => {
    const place = row[3] || 'Unknown';
    if (!grouped[place]) grouped[place] = [];
    grouped[place].push(row);
  });

  const displayHeaders = ['S.No.', 'Employee ID', 'Name', 'Designation', 'Branch', 'Date of Joining'];
  let html = '';
  let colorIndex = 0;

  const preferredOrder = ['RO, Telangana', 'MCH, Sanathnagar', 'SSH, Sanathnagar'];
const orderedPlaces = Object.keys(grouped).sort((a, b) => {
  const aIndex = preferredOrder.indexOf(a);
  const bIndex = preferredOrder.indexOf(b);

  if (aIndex !== -1 && bIndex !== -1) {
    return aIndex - bIndex;
  } else if (aIndex !== -1) {
    return -1;
  } else if (bIndex !== -1) {
    return 1;
  } else {
    return a.localeCompare(b);
  }
});

orderedPlaces.forEach(place => {
    const placeData = grouped[place];
    const cadreCount = {};

    placeData.forEach(row => {
      const cadre = row[1];
      if (!cadreCount[cadre]) cadreCount[cadre] = 0;
      cadreCount[cadre]++;
    });

    const sanctioned = sanctionedStrength[place] || {};
    if (!searchTerm) {
      const cadresToShow = selectedCadre
        ? [selectedCadre]
        : [...new Set([...Object.keys(sanctioned), ...Object.keys(cadreCount)])];
      
html += `<div class="summary-container">
            <div class="summary-header">
              <span class="toggle-icon">►</span> ${place} (Sanction & In-position)
            </div>
            <div class="summary-content" style="display: none;">
              <table class="summary-table">
              <thead>
                <tr><th>Cadre</th><th>Sanctioned</th><th>In-position</th><th>Vacancy</th><th>Vacancy %</th></tr>
              </thead><tbody>`;
      

      cadresToShow.forEach(cadre => {
        const sanctionedVal = sanctioned[cadre] || 0;
        const inPosition = cadreCount[cadre] || 0;
        const vacancy = sanctionedVal - inPosition;
        const vacancyPercent = sanctionedVal ? ((vacancy / sanctionedVal) * 100).toFixed(1) : '0.0';

        const vacancyStyle = vacancy > 0 ? 'color: red;' : '';
        const vacancyPercentStyle = vacancy > 0 ? 'color: red;' : '';

        html += `<tr>
                  <td>${cadre}</td>
                  <td>${sanctionedVal}</td>
                  <td>${inPosition}</td>
                  <td style="${vacancyStyle}">${vacancy}</td>
                  <td style="${vacancyPercentStyle}">${vacancyPercent}%</td>
                </tr>`;
      });

      html += '</tbody></table></div></div>';
    }

    const bgColor = headerColors[colorIndex % headerColors.length];
    colorIndex++;

    html += `<table><thead><tr>`;
    
    html += `</tr></thead><tbody>`;
    html += `<tr class="place-header" style="background-color: ${bgColor};"><td colspan="${displayHeaders.length}">${place}</td></tr>`;
  displayHeaders.forEach(h => html += `<th style="background-color: #DCDCDC">${h}</th>`);

    placeData.forEach((row, index) => {
      html += '<tr>';
      html += `<td>${index + 1}</td>`;
      html += `<td>${row[0] || ''}</td>`;
      html += `<td>${row[1] || ''}</td>`;
      html += `<td>${row[2] || ''}</td>`;
      html += `<td>${row[7] || ''}</td>`;
      html += `<td>${row[8] || ''}</td>`;
      html += '</tr>';
    });

    html += '</tbody></table>';
  });

  container.innerHTML = html;
  document.querySelectorAll('.summary-header').forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.toggle-icon');
    const isOpen = content.style.display === 'block';
    content.style.display = isOpen ? 'none' : 'block';
    icon.textContent = isOpen ? '►' : '▼';
  });
});
}

fetchData();
