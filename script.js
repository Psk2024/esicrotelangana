// Global variable to hold full table data
let allRowsData = [];
const apiKey = 'AIzaSyDSI9hpK2CKTkjjT_5gPpLMuzwAFzYPWZ4'; // Replace with your actual API key
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48'; // Replace with your actual spreadsheet ID
const mainRange = 'Main!A1:F500'; // Adjust the range to match your sheet
const secondaryRange = 'Sheet3!A1:G500'; // Adjust if needed

// Fetch main table data
async function fetchTableData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${mainRange}?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.values && data.values.length > 0) {
            const [headers, ...rows] = data.values;
            displayHeaders(headers);
            allRowsData = rows; // Store data globally
            displayTableData(rows);
        } else {
            console.error('No data found in the spreadsheet.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Display table headers
function displayHeaders(headers) {
    const tableHeaders = document.getElementById('table-headers');
    tableHeaders.innerHTML = '';
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.innerHTML = `${header} <span class="sort-symbol"></span>`;
        th.onclick = () => sortTable(index);
        tableHeaders.appendChild(th);
    });
}

// Filter table based on search input
function filterTable() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const filteredRows = allRowsData.filter(row => 
        row.some(cell => cell.toLowerCase().includes(searchQuery))
    );
    displayTableData(filteredRows);
}

// Display filtered table data
function displayTableData(rows) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    rows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cellData => {
            const td = document.createElement('td');
            td.textContent = cellData || '';
            tr.appendChild(td);
        });

        // Use Employee ID (first column) to fetch secondary data
        const employeeId = row[0]; // Assuming the unique Employee ID is in column A
        const employeeName = row[1]; // Assuming Employee Name is in column B
        tr.onclick = () => fetchSecondarySheetData(employeeId, employeeName);
        tableBody.appendChild(tr);
    });
}

// Fetch and display secondary sheet data using Employee ID
async function fetchSecondarySheetData(employeeId, employeeName) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${secondaryRange}?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.values && data.values.length > 0) {
            const [headers, ...rows] = data.values;

            // Find the row matching the Employee ID (assuming ID is in the first column)
            const relevantRow = rows.find(row => row[0] === employeeId);

            if (relevantRow) {
                showPopupWithSecondaryData(headers, relevantRow, employeeName, employeeId); // Pass employeeId for image
            } else {
                alert('Details not found for this employee.');
            }
        } else {
            console.error('No data found in the secondary sheet.');
        }
    } catch (error) {
        console.error('Error fetching secondary sheet data:', error);
    }
}

// Show popup with detailed data, Employee Name, and Employee Image
function showPopupWithSecondaryData(headers, rowData, employeeName, employeeId) {
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const employeeImage = document.getElementById('employeeimage');

    // Set employee image (assuming the image is named based on the employeeId, e.g., 123.jpg)
    const imageUrl = `images/${employeeId}.jpg`; // Adjust path if needed
    employeeImage.src = imageUrl;

    // Handle missing image (optional fallback)
    employeeImage.onerror = () => {
        employeeImage.src = 'images/default.jpg'; // Default image if not found
        
    };

    // Create content for the popup using the secondary sheet data
    const content = headers.map((header, index) => 
        `<tr><th>${header}</th><td>${rowData[index] || ''}</td></tr>`
    ).join('');

    // Set Employee Name as the popup heading and display data
    popupContent.innerHTML = `
        <img id="employeeimage" src= "images/${employeeId}.jpg" alt="Employee Image" style="display: block;
    margin: 0 auto 20px;
    width: 125px;
    height: 125px;
    border-radius: 50%;
    border: 2px solid white;">
    <h1>${employeeName}</h1>
        <table>${content}</table>
    `;
    // Show the popup
    popup.classList.remove('hidden');
    document.getElementById('popup-overlay').classList.remove('hidden');
}
// Close popup
function closePopup() {
    document.getElementById('popup').classList.add('hidden');
    document.getElementById('popup-overlay').classList.add('hidden');
}

// Fetch and display data on page load
fetchTableData();
