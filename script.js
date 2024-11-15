const apiKey = 'AIzaSyBLOOYaN0zUBPUkA0FyPot1QL-LFWCpEzc';  // Replace with your Google API key
const spreadsheetId = '1a4JmwnRPvVHOh5BNOZ-F_sqspasdcowRB7uF-qScd48';  // Replace with your spreadsheet ID
const range = 'Sheet1!A1:G500';  // Adjust the range as needed

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
        for (let i = 1; i < 500; i++) {
            const td = document.createElement("td");
            td.textContent = rowData[i] || "";  // Fill cell with data or empty if undefined
            tr.appendChild(td);
        }

        dataRows.appendChild(tr);
    });
}

// Function to filter the table based on user input
function filterTable() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const filteredData = tableData.filter(row => {
        return row.some(cell => cell.toLowerCase().includes(searchInput));
    });

    displayTable(filteredData);
}

// Fetch and display data when the page loads
fetchData();
