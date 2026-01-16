const headerColors = ['Tomato', 'DodgerBlue', 'SlateBlue', '#fce4ec', '#ede7f6', '#e8eaf6'];
const apiKey = 'AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc';
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48';
const employeeRange = 'Employees2!A1:K';

let allData = [];
let filteredData = [];
let totalEmployeeCount = 0; 

const select = document.getElementById('cadreSelect');
const searchInput = document.getElementById('searchInput');
const container = document.getElementById('employeeTableContainer');
const overallCountElement = document.getElementById('overallCountDisplay');

async function fetchData() {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${employeeRange}?key=${apiKey}`);
    const data = await res.json();
    const rows = data.values || [];
    if (!rows.length) {
      container.innerHTML = '<p>No employee data found.</p>';
      return;
    }

    allData = rows.slice(1);
    
    const uniqueAllIds = new Set(allData.map(row => row[0]));
    totalEmployeeCount = uniqueAllIds.size; 
    const cadreSet = new Set(allData.map(row => row[4]).filter(Boolean));
    populateCadreOptions([...cadreSet].sort());

    filterAndDisplay();
  } catch (error) {
    console.error('Fetch error:', error);
    container.innerHTML = '<p>⚠️ Unable to load employee data.</p>';
  }
}

function populateCadreOptions(cadres) {
  select.innerHTML = '<option value="">All Branches</option>';
  cadres.forEach(cadre => {
    const option = document.createElement('option');
    option.value = cadre;
    option.textContent = cadre;
    select.appendChild(option);
  });
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function highlight(text, searchTerm) {
  if (!searchTerm) return text;
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[]\\]/g, '\\$&'); // escape RegExp special chars
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  return text.replace(regex, '<mark style="background-color: #ffd54f; font-weight: 700; color: #5d4300; padding: 0;">$1</mark>');
}

function updateOverallCountDisplay() {
  if (overallCountElement) {
    overallCountElement.innerHTML = `
      <p style="
        text-align: center; 
        margin: 0 0 0px; 
        font-size: 0.7em; 
        font-weight: 70; 
        color: #0056b3; 
        padding: 0px 0px;
      ">
        (Total: ${totalEmployeeCount})
      </p>
    `;
  }
}

function filterAndDisplay() {
  const selectedCadre = select.value;
  const searchTerm = searchInput.value.trim().toLowerCase();

  // Filter data
  filteredData = allData.filter(row => {
    const empId = row[0]?.toLowerCase() || '';
    const empName = row[1]?.toLowerCase() || '';
    const branch = row[4]?.toLowerCase() || '';

    const matchesCadre = selectedCadre ? row[4] === selectedCadre : true;
    const matchesSearch = searchTerm
      ? (empId.includes(searchTerm) ||
         empName.includes(searchTerm) ||
         branch.includes(searchTerm))
      : true;

    return matchesCadre && matchesSearch;
  });

  // Unique employee count
  const uniqueIds = new Set(filteredData.map(row => row[0]));
  const filteredCount = uniqueIds.size;

  // Update dashboard counters
  document.getElementById('totalCount').textContent = allData.length;
  document.getElementById('filteredCount').textContent = filteredCount;

  updateOverallCountDisplay();

  // Empty state (visual friendly)
  if (!filteredData.length) {
    container.innerHTML = `
      <div style="
        padding: 40px;
        font-size: 1.2em;
        color: #666;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      ">
        🔍 No employees found matching your criteria
      </div>
    `;
    return;
  }

  displayAll();
}


function displayAll() {
  const searchTerm = searchInput.value.trim();
  let globalIndex = 0;

  // Group by Place (row[3])
  const grouped = filteredData.reduce((acc, row) => {
    const place = row[3] || 'Unknown';
    acc[place] = acc[place] || [];
    acc[place].push(row);
    return acc;
  }, {});

  let html = '';
  let colorIndex = 0;

  for (const [place, placeData] of Object.entries(grouped)) {
    const headerColor = headerColors[colorIndex % headerColors.length];
    colorIndex++;

    const uniqueIds = new Set(placeData.map(r => r[0]));
    const groupCount = uniqueIds.size;

    /* ===== Place Header ===== */
    html += `
      <div class="place-section">
        <h2 style="color:${headerColor}">
          ${place}
          <span style="
            font-size:0.7em;
            margin-left:10px;
            color:#555;
            font-weight:600;
          ">
            (${groupCount})
          </span>
        </h2>

        <table class="employee-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Branch</th>
            </tr>
          </thead>
          <tbody>
    `;

    /* ===== Table Rows ===== */
    placeData.forEach(row => {
      html += `
        <tr class="clickable-row"
            tabindex="0"
            data-employee-id="${row[0] || ''}"
            data-row-index="${globalIndex}">
          <td>${highlight(row[0] || '', searchTerm)}</td>
          <td>${highlight(row[1] || '', searchTerm)}</td>
          <td>${row[2] || '-'}</td>
          <td>${highlight(row[4] || '', searchTerm)}</td>
        </tr>
      `;
      globalIndex++;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;
  }

  /* ===== Render Once (Performance Friendly) ===== */
  container.innerHTML = html;

  /* ===== Row Click Events ===== */
  document.querySelectorAll('.clickable-row').forEach(row => {
    row.addEventListener('click', () => {
      const employeeId = row.dataset.employeeId;
      const rowIndex = Number(row.dataset.rowIndex);
      showEmployeeModal(employeeId, rowIndex);
    });

    // Keyboard accessibility (Enter key)
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const employeeId = row.dataset.employeeId;
        const rowIndex = Number(row.dataset.rowIndex);
        showEmployeeModal(employeeId, rowIndex);
      }
    });
  });
}


function showEmployeeModal(employeeId, rowIndex) {
  if (!employeeId) return;
  
  const emp = filteredData[rowIndex];
  if (!emp) {
    console.error('Employee not found for ID:', employeeId, 'at filteredData index:', rowIndex);
    return;
  }

  const modal = document.getElementById('employeeModal');
  const modalBody = document.getElementById('modalBody');
  const employeeIdfor = emp[0] || '';
  const imageUrl = employeeIdfor ? `images/${employeeIdfor}.jpg` : ''; // Use empty string to trigger clean SVG fallback
  const primaryColor = '#0056b3';
  const labelColor = '#333';
  const detailColor = '#111';
  const accentColor = '#e0e7f7';
  
  modalBody.innerHTML = `
   <div style="
    text-align: left; 
    padding-bottom: 15px; 
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
  ">
    <h3 style="
      margin: 0; 
      font-size: 2.2em; 
      color: ${primaryColor}; 
      font-weight: 700;
    ">${emp[1]}</h3>
    <span style="
      font-size: 1.05em; 
      color: #666; 
      display: block; 
      margin-top: 5px;
    ">${emp[2]}</span>
  </div>
  <div id="modal-details-content" style="
    display: flex; 
    gap: 25px; 
    align-items: flex-start; 
    padding: 20px; 
    border-radius: 12px; 
    background: #fcfcfc; 
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
  ">      
 
    <div id="modal-image-wrapper" style="
      flex: 0 0 170px; 
      display: flex; 
      justify-content: center; 
      align-items: center;
      height: 200px;
      background-color: ${accentColor};
      border-radius: 25%;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    ">
  ${imageUrl ? 
        `<img src="${imageUrl}" alt="Photo of ${emp[1]}" style="
            width: 100%; 
            height: 100%; 
            border-radius: 25%; 
            object-fit: cover; 
            border: 3px solid ${primaryColor};
        " onerror="this.src='images/default.png'"; this.style.backgroundColor='${accentColor}'; this.style.border='none'; this.style.padding='10%';">`
        : 
        `<svg style="width: 100%; height: 100%; fill: ${primaryColor}; opacity: 0.7;" viewBox="0 0 25 25"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
      }
      </div>
    <div id="modal-info-grid" style="
      flex: 1; 
      display: grid; 
      grid-template-columns: minmax(120px, 40%) 1fr; 
      row-gap: 12px; 
      column-gap: 20px; 
      font-size: 1em; 
      color: ${detailColor}; 
      text-align: left; 
      word-break: break-word;
    ">
      <div style="font-weight: 600; color: ${labelColor};">Employee ID</div>
      <div style="font-weight: 400;">${emp[0] || 'N/A'}</div>

      <div style="font-weight: 600; color: ${labelColor};">Contact Details</div>
      <div style="font-weight: 400;">${emp[10] || 'N/A'}</div>

      <div style="font-weight: 600; color: ${labelColor};">Gender</div>
      <div style="font-weight: 400;">${emp[5] || 'N/A'}</div>

      <div style="font-weight: 600; color: ${labelColor};">Branch</div>
      <div style="font-weight: 400;">${emp[4] || 'N/A'}</div>

      <div style="font-weight: 600; color: ${labelColor};">DoJ in Branch</div>
      <div style="font-weight: 400;">${emp[8] || 'N/A'}</div>

      <div style="font-weight: 600; color: ${labelColor};">Date of Birth</div>
      <div style="font-weight: 400;">${emp[6] || 'N/A'}</div>

      <div style="font-weight: 600; color: ${labelColor};">Date of Retirement</div>
      <div style="font-weight: 400;">${emp[7] || 'N/A'}</div>
    </div>
  </div>
  <style>
    /* Responsive styles for inline elements */
    @media (max-width: 600px) {
      #modal-details-content {
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      #modal-image-wrapper {
        margin-bottom: 5px;
      }
      #modal-info-grid {
        grid-template-columns: 1fr; 
        text-align: center;
        width: 100%;
      }
      #modal-info-grid > div {
        padding: 5px 0;
      }
    }
  </style>
  `;

  modal.style.display = 'block';
}

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

select.addEventListener('change', filterAndDisplay);
searchInput.addEventListener('input', debounce(filterAndDisplay, 300));

fetchData();
