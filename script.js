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
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&'); // escape RegExp special chars
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    // NOTE: Apply highlight inline styles here since you removed them from CSS
    return text.replace(regex, '<mark style="background-color: #ffd54f; font-weight: 700; color: #5d4300; padding: 0;">$1</mark>');
}

// Filter and display employees based on search and cadre
function filterAndDisplay() {
    const selectedCadre = select.value;
    const searchTerm = searchInput.value.trim().toLowerCase();

    filteredData = allData.filter(row => {
        const matchesCadre = selectedCadre ? row[7] === selectedCadre : true;
        const matchesSearch = searchTerm ?
            (row[0]?.toLowerCase().includes(searchTerm) || row[1]?.toLowerCase().includes(searchTerm) || row[3]?.toLowerCase().includes(searchTerm)) :
            true;
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
        // NOTE: Apply h2 inline styles here since you removed them from CSS
        html += `<h2 style="font-size: 1.5em; margin: 30px auto 10px; width: 90%; text-align: left; padding-left: 10px; border-bottom: 2px solid ${bgColor}; color:${bgColor}">${place}</h2>`;
        html += `<table style="width: 90%; margin: 10px auto 30px; border-collapse: separate; border-spacing: 0; background: #fff; border-radius: 16px; box-shadow: 0 8px 20px rgba(0, 86, 179, 0.15); overflow: hidden;" role="table" aria-label="Employees in ${place}"><thead><tr>`;
        ['S.No.', 'Employee ID', 'Name', 'Designation', 'Branch'].forEach(header => {
            // NOTE: Apply th inline styles here since you removed them from CSS
            html += `<th style="padding: 14px 20px; text-align: left; font-weight: 700; font-size: 16px; background-color: #0056b3; color: #fff; text-transform: uppercase; letter-spacing: 0.05em;">${header}</th>`;
        });
        html += '</tr></thead><tbody>';
        placeData.forEach((row, index) => {
            // NOTE: Apply tr/td inline styles here since you removed them from CSS
            const rowBg = index % 2 === 1 ? '#f9faff' : '#ffffff';
            html += `<tr tabindex="0" class="clickable-row" data-index="${globalIndex}" style="cursor: pointer; transition: background 0.3s ease; background-color: ${rowBg};">`;
            const tdStyle = "padding: 14px 20px; text-align: left; font-weight: 500; font-size: 16px; border-bottom: 1px solid #e0e0e0;";
            html += `<td style="${tdStyle}">${index + 1}</td>`;
            html += `<td style="${tdStyle}">${highlight(row[0] || '', searchTerm)}</td>`;
            html += `<td style="${tdStyle}">${highlight(row[1] || '', searchTerm)}</td>`;
            html += `<td style="${tdStyle}">${row[2] || ''}</td>`;
            html += `<td style="${tdStyle}">${highlight(row[7] || '', searchTerm)}</td>`;
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
    const modalBody = document.getElementById('modalBody');

    const employeeId = emp[0] || '';
    const imageUrl = employeeId ? `images/${employeeId}.jpg` : ''; // Use empty string to trigger clean SVG fallback
    const name = emp[1] || 'Employee Details';
    const des = emp[2] || 'Designation Not Available';

    // Style constants for readability and consistency
    const primaryColor = '#0056b3';
    const labelColor = '#333';
    const detailColor = '#111';
    const accentColor = '#e0e7f7'; // Light background for image container

    // Modal body
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
    ">${name}</h3>
    <span style="
      font-size: 1.05em; 
      color: #666; 
      display: block; 
      margin-top: 5px;
    ">${des}</span>
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
      flex: 0 0 140px; 
      display: flex; 
      justify-content: center; 
      align-items: center;
      height: 140px;
      background-color: ${accentColor};
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    ">
      ${imageUrl ? 
        `<img src="${imageUrl}" alt="Photograph of ${name}" style="
            width: 100%; 
            height: 100%; 
            border-radius: 50%; 
            object-fit: cover; 
            border: 3px solid ${primaryColor};
        " onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'${primaryColor}\\' opacity=\\'0.7\\'><path d=\\'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z\\' style=\\'fill: ${primaryColor};\\'/></svg>'; this.style.backgroundColor='${accentColor}'; this.style.border='none'; this.style.padding='20%';">`
        : 
        `<svg style="width: 80%; height: 80%; fill: ${primaryColor}; opacity: 0.7;" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
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
      <div style="font-weight: 400;">${emp[4] || 'N/A'}</div>

      <div style="font-weight: 600; color: ${labelColor};">Branch</div>
      <div style="font-weight: 400;">${emp[7] || 'N/A'}</div>

      <div style="font-weight: 600; color: ${labelColor};">DoJ in Branch</div>
      <div style="font-weight: 400;">${emp[8] || 'N/A'}</div>

      <div style="font-weight: 600; color: ${labelColor};">Date of Birth</div>
      <div style="font-weight: 400;">${emp[5] || 'N/A'}</div>

      <div style="font-weight: 600; color: ${labelColor};">Date of Retirement</div>
      <div style="font-weight: 400;">${emp[6] || 'N/A'}</div>
    </div>
  </div>
  <style>
    /* Responsive styles for inline elements */
    @media (max-width: 600px) {
      #modal-details-content {
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }
      #modal-image-wrapper {
        margin-bottom: 10px;
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
