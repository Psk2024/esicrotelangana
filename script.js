const headerColors = [
  '#808000', '#ffa500', '#ff00ff', '#fce4ec', '#ede7f6', '#e8eaf6'
];

const apiKey = 'AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc';
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48';

const employeeRange = 'Employees2!A1:J';

let allData = [];

async function fetchData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${employeeRange}?key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const rows = data.values || [];

    if (rows.length === 0) return;

    allData = rows.slice(1); // remove header row

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

function highlight(text, searchTerm) {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
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
      (row[0] || '').toLowerCase().includes(searchTerm) ||  // Employee ID
      (row[2] || '').toLowerCase().includes(searchTerm) ||  // Name
      (row[4] || '').toLowerCase().includes(searchTerm)     // Branch
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
    const bgColor = headerColors[colorIndex % headerColors.length];
    colorIndex++;

    html += `<table><thead><tr></tr></thead><tbody>`;
    html += `<tr class="place-header" style="background-color: ${bgColor};"><td colspan="${displayHeaders.length}">${place}</td></tr>`;
    displayHeaders.forEach(h => html += `<th style="background-color: #DCDCDC">${h}</th>`);

    placeData.forEach((row, index) => {
      html += '<tr>';
      html += `<td>${index + 1}</td>`;
      html += `<td>${highlight(row[0] || '', searchTerm)}</td>`;  // Employee ID
      html += `<td>${highlight(row[2] || '', searchTerm)}</td>`;  // Name
      html += `<td>${row[1] || ''}</td>`;                         // Designation
      html += `<td>${highlight(row[7] || '', searchTerm)}</td>`;  // Branch
      html += `<td>${row[8] || ''}</td>`;                         // DOJ
      html += '</tr>';
    });

    html += '</tbody></table>';
  });

  container.innerHTML = html;
}

fetchData();