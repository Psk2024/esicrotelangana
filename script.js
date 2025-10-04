const headerColors = ['#808000', '#ffa500', '#ff00ff', '#fce4ec', '#ede7f6', '#e8eaf6'];
const apiKey = 'AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc';
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48';
const employeeRange = 'Employees2!A1:J';

let allData = [];
let filteredData = [];

async function fetchData() {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${employeeRange}?key=${apiKey}`);
    const data = await res.json();
    const rows = data.values || [];
    if (!rows.length) return;

    allData = rows.slice(1); // remove header

    const cadreSet = new Set(allData.map(row => row[7]).filter(Boolean));
    const select = document.getElementById('cadreSelect');
    [...cadreSet].sort().forEach(cadre => {
      const option = document.createElement('option');
      option.value = cadre;
      option.textContent = cadre;
      select.appendChild(option);
    });

    select.addEventListener('change', filterAndDisplay);
    document.getElementById('searchInput').addEventListener('input', filterAndDisplay);

    filterAndDisplay();
  } catch (err) {
    console.error(err);
    document.getElementById('employeeTableContainer').innerHTML =
      '<p class="error">⚠️ Unable to load employee data.</p>';
  }
}

function highlight(text, searchTerm) {
  if (!searchTerm) return text;
  return text.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="highlight">$1</span>');
}

function filterAndDisplay() {
  const selectedCadre = document.getElementById('cadreSelect').value;
  const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
  filteredData = allData;

  if (selectedCadre) filteredData = filteredData.filter(r => r[7] === selectedCadre);
  if (searchTerm) filteredData = filteredData.filter(r =>
    (r[0] || '').toLowerCase().includes(searchTerm) ||
    (r[1] || '').toLowerCase().includes(searchTerm) ||
    (r[3] || '').toLowerCase().includes(searchTerm)
  );

  if (!filteredData.length) {
    document.getElementById('employeeTableContainer').innerHTML = '<p>No employees found.</p>';
    return;
  }

  displayAll();
}

function displayAll() {
  const container = document.getElementById('employeeTableContainer');
  const searchTerm = document.getElementById('searchInput').value.trim();

  const grouped = {};
  filteredData.forEach(row => {
    const place = row[3] || 'Unknown';
    if (!grouped[place]) grouped[place] = [];
    grouped[place].push(row);
  });

  const displayHeaders = ['S.No.', 'Employee ID', 'Name', 'Designation', 'Branch', 'Date of Joining'];
  let html = '';
  let colorIndex = 0;

  Object.keys(grouped).forEach(place => {
    const placeData = grouped[place];
    const bgColor = headerColors[colorIndex % headerColors.length];
    colorIndex++;

    html += `<table><thead>`;
    html += `<tr class="place-header" style="background-color:${bgColor};"><td colspan="${displayHeaders.length}">${place}</td></tr>`;
    html += `<tr>${displayHeaders.map(h => `<th>${h}</th>`).join('')}</tr>`;
    html += `</thead><tbody>`;

    placeData.forEach((row, i) => {
      html += `<tr class="clickable-row" onclick="showEmployeeModal(${allData.indexOf(row)})">`;
      html += `<td>${i+1}</td>`;
      html += `<td>${highlight(row[0] || '', searchTerm)}</td>`;
      html += `<td>${highlight(row[1] || '', searchTerm)}</td>`;
      html += `<td>${row[2] || ''}</td>`;
      html += `<td>${highlight(row[7] || '', searchTerm)}</td>`;
      html += `<td>${row[8] || ''}</td>`;
      html += `</tr>`;
    });

    html += `</tbody></table>`;
  });

  container.style.opacity = 0;
  container.innerHTML = html;
  setTimeout(() => container.style.opacity = 1, 50);
}

// Modal
function showEmployeeModal(index) {
  const emp = allData[index];
  if (!emp) return;
  const searchTerm = document.getElementById('searchInput').value.trim();
  
  document.getElementById('modalTitle').textContent = emp[1] || '';

  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `<table>
  <tr><td><p><strong>Employee ID:/p></strong></td><td><p> ${highlight(emp[0]||'', searchTerm)}</p></td></tr></table>
    <p><strong>Name:</strong> ${highlight(emp[1]||'', searchTerm)}</p>
    <p><strong>Designation:</strong> ${highlight(emp[2]||'', searchTerm)}</p>
    <p><strong>Branch:</strong> ${highlight(emp[7]||'', searchTerm)}</p>
    <p><strong>Gender:</strong> ${emp[4]||''}</p>
    <p><strong>Date of Birth:</strong> ${emp[5]||''}</p>
    <p><strong>Date of Retirement:</strong> ${emp[6]||''}</p>
  `;

  document.getElementById('employeeModal').style.display = 'block';
}

document.querySelector('.close-btn').onclick = () => {
  document.getElementById('employeeModal').style.display = 'none';
};
window.onclick = e => { if(e.target === document.getElementById('employeeModal')) document.getElementById('employeeModal').style.display = 'none'; };
window.addEventListener('keydown', e => { if(e.key==='Escape') document.getElementById('employeeModal').style.display='none'; });

fetchData();
