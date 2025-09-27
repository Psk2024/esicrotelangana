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
}