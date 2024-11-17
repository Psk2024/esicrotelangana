const apiKey = 'AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc';  // Replace with your Google API key
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48';  // Replace with your spreadsheet ID
const range = 'Sheet2!A1:I500';  // Adjust the range as needed

// Fetch data from Google Sheets and display the table
async function fetchTableData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.values && data.values.length > 0) {
            const [headers, ...rows] = data.values;
            displayHeaders(headers);
            displayTableData(rows);
        } else {
            console.error('No data found in the spreadsheet.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Dynamically display table headers with sorting symbols for all columns
function displayHeaders(headers) {
    const tableHeaders = document.getElementById('table-headers');
    tableHeaders.innerHTML = '';
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.innerHTML = `${header} <span class="sort-symbol"></span>`;
        th.onclick = () => sortTable(index, th);
        tableHeaders.appendChild(th);
    });
}

// Dynamically display table rows
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
        tableBody.appendChild(tr);
    });
}

// Sort table data by column and update sorting symbols
function sortTable(columnIndex, headerElement) {
    const tableBody = document.getElementById('table-body');
    const rows = Array.from(tableBody.rows);
    const isAscending = headerElement.getAttribute('data-sort') !== 'asc';

    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent.toLowerCase();
        const cellB = rowB.cells[columnIndex].textContent.toLowerCase();

        if (!isNaN(cellA) && !isNaN(cellB)) {
            return isAscending ? cellA - cellB : cellB - cellA;
        }
        return isAscending
            ? cellA.localeCompare(cellB)
            : cellB.localeCompare(cellA);
    });

    tableBody.innerHTML = '';
    tableBody.append(...rows);

    // Reset all headers' sort symbols
    document.querySelectorAll('.sort-symbol').forEach(span => {
        span.textContent = '';
    });

    // Update the clicked header's sort symbol
    headerElement.querySelector('.sort-symbol').textContent = isAscending ? '▲' : '▼';
    headerElement.setAttribute('data-sort', isAscending ? 'asc' : 'desc');
}

// Filter table data based on search input
function filterTable() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#table-body tr');
    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        const match = Array.from(cells).some(cell =>
            cell.textContent.toLowerCase().includes(input)
        );
        row.style.display = match ? '' : 'none';
    });
}

// Fetch and display data on page load
fetchTableData();
