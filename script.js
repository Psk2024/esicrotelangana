/*const apiKey = 'AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc';  // Replace with your Google API key
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48';  // Replace with your spreadsheet ID
const range = 'Sheet1!A1:I500';  // Adjust the range as needed

let tableData = [];  // Array to store table data
let sortOrder = {};  // Object to store the sort order for each column

// Fetch data from Google Sheets
async function fetchData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.values && data.values.length > 0) {
        tableData = data.values;  // Store data including the header
        displayTable(tableData);
        createSortableHeaders(tableData[0]);  // Create sortable headers using the first row as headers
    } else {
        console.error("No data found.");
    }
}

// Display the data in the table
function displayTable(rows) {
    const dataRows = document.getElementById("data-rows");
    dataRows.innerHTML = '';  // Clear existing rows

    rows.slice(1).forEach(rowData => {  // Exclude the header row
        const tr = document.createElement("tr");

        // Create the image cell
        const imgTd = document.createElement("td");
        const img = document.createElement("img");
        img.src = rowData[0];  // Assuming the first column is the image URL
        img.alt = "Employee Photo";
        img.width = 50;
        img.height = 50;
        img.style.borderRadius = "50%";
        imgTd.appendChild(img);
        tr.appendChild(imgTd);

        // Create cells for the remaining employee details
        for (let i = 1; i < rowData.length; i++) {
            const td = document.createElement("td");
            td.textContent = rowData[i] || "";  // Fill cell with data or empty if undefined
            tr.appendChild(td);
        }

        dataRows.appendChild(tr);
    });
}

// Create sortable table headers
function createSortableHeaders(headers) {
    const headerRow = document.getElementById("table-headers");
    headerRow.innerHTML = '';  // Clear existing headers

    headers.forEach((header, index) => {
        const th = document.createElement("th");
        th.textContent = header;
        th.style.cursor = "pointer";

        // Add a click event listener for sorting
        th.addEventListener("click", () => {
            sortOrder[index] = !sortOrder[index];  // Toggle sort order
            sortTable(index, sortOrder[index]);
        });

        headerRow.appendChild(th);
    });
}

// Sort table data by a specific column
function sortTable(columnIndex, ascending) {
    const sortedData = [...tableData];  // Copy the data
    sortedData.slice(1).sort((a, b) => {
        const aValue = a[columnIndex] || "";  // Handle undefined values
        const bValue = b[columnIndex] || "";

        if (aValue < bValue) return ascending ? -1 : 1;
        if (aValue > bValue) return ascending ? 1 : -1;
        return 0;
    });

    displayTable(sortedData);
}
// Fetch and display data when the page loads
fetchData();
*/

const apiKey = 'AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc';  // Replace with your Google API key
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48';  // Replace with your spreadsheet ID
const range = 'Sheet2!A1:I500';  // Adjust the range as needed

let tableData = [];  // Array to store table data

// Fetch data from Google Sheets
async function fetchData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.values && data.values.length > 0) {
        tableData = data.values;  // Store data excluding the header
        displayTable(tableData);
    } else {
        console.error("No data found.");
    }
}

// Display the data in the table
function displayTable(rows) {
    const dataRows = document.getElementById("data-rows");
    dataRows.innerHTML = '';  // Clear existing rows

    rows.forEach(rowData => {
        const tr = document.createElement("tr");

        // Create the image cell
        const imgTd = document.createElement("td");
        const img = document.createElement("img");
        img.src = rowData[0];  // Assuming the first column is the image URL
        img.alt = "Employee Photo";
        img.width = 50;
        img.height = 50;
        img.style.borderRadius = "50%";
        imgTd.appendChild(img);
        tr.appendChild(imgTd);

        // Create cells for the remaining employee details
        for (let i = 1; i < rowData.length; i++) {
            const td = document.createElement("td");
            td.textContent = rowData[i] || "";  // Fill cell with data or empty if undefined
            tr.appendChild(td);
        }

        dataRows.appendChild(tr);
    });
}


// Fetch and display data when the page loads
fetchData();
