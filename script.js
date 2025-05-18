const apiKey = 'AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc';
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48';
const range = 'Employees!A1:G';

let allData = [];

async function fetchData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const rows = data.values || [];

    if (rows.length === 0) return;

    allData = rows.slice(1); // Skip headers

    const cadreSet = new Set();
    allData.forEach(row => {
      if (row[1]) cadreSet.add(row[1]); // Cadre
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
    console.error("Error loading data:", err);
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
      (row[0] || '').toLowerCase().includes(searchTerm) || // Employee ID
      (row[4] || '').toLowerCase().includes(searchTerm)    // Name
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p>No employees found.</p>';
    return;
  }

  const grouped = {};
  filtered.forEach(row => {
    const place = row[3] || 'Unknown'; // Place of Posting
    if (!grouped[place]) grouped[place] = [];
    grouped[place].push(row);
  });

  const displayHeaders = ['S.No.', 'Employee ID', 'Name', 'Designation', 'Branch', 'Date of Joining'];
  let table = `<table><thead><tr>`;
  displayHeaders.forEach(h => table += `<th>${h}</th>`);
  table += `</tr></thead><tbody>`;

  Object.keys(grouped).sort().forEach(place => {
    table += `<tr class="place-header"><td colspan="${displayHeaders.length}">${place}</td></tr>`;
    grouped[place].forEach((row, index) => {
      table += '<tr>';
      table += `<td>${index + 1}</td>`;     // S.No.
      table += `<td>${row[0] || ''}</td>`;  // Employee ID
      table += `<td>${row[4] || ''}</td>`;  // Name
      table += `<td>${row[2] || ''}</td>`;  // Designation
      table += `<td>${row[6] || ''}</td>`;  // Branch
      table += `<td>${row[5] || ''}</td>`;  // Date of Joining
      table += '</tr>';
    });
  });

  table += '</tbody></table>';
  container.innerHTML = table;
}

fetchData();
