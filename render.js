const { ipcRenderer, safeStorage } = require('electron');

// Send email button click event listener
document.getElementById('send-email').addEventListener('click', function () {
    let csvData = null;
    getCsvData()
        .then(groupedData => {
            csvData = groupedData;
            const date = new Date();
            const signitureName = document.getElementById('signiture').value;
            let subject = null;
            const emailData = getEmailData();
            Object.entries(csvData).forEach(([worker, cases]) => {
                if (worker.length === 0) {
                    document.getElementById('status').classList = "text-red-400 text-center visible"
                    document.getElementById('status').innerHTML = "* Invalid table data";
                    return;
                }
                if (emailData.find(email => email.name === worker)) {
                    // Generate subject based on time and worker name
                    if (document.getElementById('afternoon').checked) {
                        subject = `${date.getDate()}/${date.getMonth()+1} afternoon bundle ${worker}`;
                    } else {
                        subject = `${date.getDate()}/${date.getMonth()+1} bundle ${worker}`;
                    }

                    // Find email data for the worker
                    const email = emailData.find(email => email.name === worker);

                    let casesHTML = '';
                    cases.forEach(caseData => {
                        // Generate HTML table rows for each case
                        casesHTML += `<tr>
                                <td>${caseData['Case Number']}</td>
                                <td>${caseData['Service Portfolio']}</td>
                                <td>${caseData['Coverage Response']}</td>
                                <td>${caseData['Severity']}</td>
                                <td>${caseData['Subject']}</td>
                                <td>${caseData['Account Name']}</td>
                            </tr>`;
                    });

                    const data = {
                        email: email.domain,
                        subject: subject,
                        html: `
                        <style>
                            table {
                                border-collapse: collapse;
                                width: 100%;
                                border: 1px solid #ddd;
                                font-family:"Calibri", sans-serif;
                            }
                            tr, td {
                                border: 1px solid #ddd;
                            }
                            th, td {
                                text-align: left;
                                padding: 8px;
                            }
                            tr:nth-child(even) {
                                background-color: #f2f2f2;
                            }
                        </style>
                        <p>Dear ${worker},</p>
                        <p>Please take care of the following cases:</p>
                        <table><tbody>${casesHTML}</tbody></table>
                        <p>Should you have any questions, please do not hesitate to contact me or the management team.</p>
                        <p>Thank you in advance!</p>
                        <p>Mit freundlichen Grüssen / Kind regards,</p>
                        <p>${signitureName}</p>
                        `   
                    };
                    
                    // Invoke 'send-email' IPC event and handle the response
                    ipcRenderer.invoke('send-email', data)
                        .then(response => {
                            if (response === 'sent') {
                                document.getElementById('status').classList = "text-green-400 text-center visible"
                                document.getElementById('status').innerHTML = "* Batch sent successfully";
                            }
                        });
                }
            });
        })
        .catch(error => {
            console.error(error);
        });
});

// Add email button click event listener
document.getElementById('add-email').addEventListener('click', function () {
    createEmail();
});

// Create email input fields dynamically
function createEmail(user = '', domain = '') {
    const emailContainer = document.getElementById('emails');
    const email = document.createElement('div');
    email.className = 'bg-gray-600 flex justify-start items-center h-10 center p-2 gap-2 w-full rounded';
    emailContainer.appendChild(email);

    const emailName = document.createElement('input');
    emailName.className = 'bg-gray-700 w-full text-gray-300';
    emailName.placeholder = 'name';
    emailName.type = 'text';
    emailName.value = user;
    email.appendChild(emailName);

    const equalSign = document.createElement('h2');
    equalSign.className = 'text-center text-gray-300';
    equalSign.innerHTML = '=';
    email.appendChild(equalSign);

    const emailDomain = document.createElement('input');
    emailDomain.className = 'bg-gray-700 w-full text-gray-300';
    emailDomain.placeholder = 'email';
    emailDomain.type = 'text';
    emailDomain.value = domain;
    email.appendChild(emailDomain);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'bg-red-500 hover:bg-red-700 text-white font-bold m-2 px-4 rounded';
    deleteButton.innerHTML = 'X';
    deleteButton.addEventListener('click', function () {
        email.remove();
    });
    email.appendChild(deleteButton);
}

// Load data from storage
function loadData(data) {
    const storedEmails = data.emails;
    const storedSigniture = data.signiture;
    let arrayEmails = [];

    if (storedEmails && Array.isArray(storedEmails)) {
        storedEmails.forEach(email => {
            createEmail(email.name, email.domain);
            arrayEmails.push(email);
        });
    }

    if (storedSigniture) {
        document.getElementById('signiture').value = storedSigniture;
    }
}

// Update emails button click event listener
document.getElementById('update-emails').addEventListener('click', function () {
    const arrayEmails = getEmailData();
    ipcRenderer.invoke('update-emails', arrayEmails)
        .then(response => {
            console.log(response);  // Here you can handle the response
        });
});

// Get email data from input fields
function getEmailData() {
    let emails = document.querySelectorAll('#emails > div');
    let arrayEmails = [];

    emails.forEach(email => {
        let nameInput = email.querySelector('input:nth-child(1)');
        let domainInput = email.querySelector('input:nth-child(3)');
        let name = nameInput.value;
        let domain = domainInput.value;
        if (name && domain) {
            arrayEmails.push({ name: name, domain: domain });
        }
    });
    return arrayEmails;
}

// Group data by worker
function groupByWorker(data) {
    return data.reduce((result, obj) => {
        const worker = obj['Worker'];
        if (!result[worker]) {
            result[worker] = [];
        }
        result[worker].push(obj);
        return result;
    }, {});
}

// Get CSV data from file input
function getCsvData() {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        const reader = new FileReader();
        reader.onload = function (event) {
            const contents = event.target.result;
            const rows = parseCSV(contents);
            const headers = rows[0];
            const caseNumberIndex = headers.indexOf('Case Number');
            const data = [];

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const obj = {};

                if (row[caseNumberIndex]) {
                    for (let j = 0; j < row.length; j++) {
                        let key = headers[j];
                        if (key === '') {
                            key = 'Worker';
                        }
                        obj[key] = row[j];
                    }
                    data.push(obj);
                }
            }

            const groupedData = groupByWorker(data);
            resolve(groupedData);
        };

        reader.onerror = function (event) {
            reject(event.target.error);
            console.log(event.target.error)
        };

        reader.readAsText(file);
    });
}

// Parse CSV string into rows and cells
function parseCSV(csv) {
    const rows = csv.replace(/\r/g, '').split('\n');
    const result = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i].split(',');
        const newRow = [];

        let insideQuotes = false;
        let entry = '';

        for (let j = 0; j < row.length; j++) {
            const cell = row[j];

            if (insideQuotes) {
                entry += ',' + cell;

                if (cell.endsWith('"')) {
                    newRow.push(entry.slice(1, -1));
                    insideQuotes = false;
                    entry = '';
                }
            } else {
                if (cell.startsWith('"') && !cell.endsWith('"')) {
                    insideQuotes = true;
                    entry += cell;
                } else {
                    newRow.push(cell);
                }
            }
        }

        if (insideQuotes) {
            newRow.push(entry.slice(1));
        } else if (entry !== '') {
            newRow.push(entry);
        }

        result.push(newRow);
    }

    return result;
}

// Load data from storage when the window loads
window.onload = function () {
    ipcRenderer.invoke('get-data').then(response => {
        loadData(response);
    });
};

// Save info button click event listener
document.getElementById('save-info').addEventListener('click', function () {
    const signiture = document.getElementById('signiture').value;

    ipcRenderer.invoke('update-signiture', signiture)
        .then(response => {
            console.log(response);  // Here you can handle the response
        }
        );
});