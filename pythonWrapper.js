const { exec, spawn } = require('child_process');
module.exports = { runPythonScript };
const path = require('path');

function runPythonScript(data) {
    console.log("Running python script")
    const subject = data.subject;
    const body = data.html;
    const recipients = data.email;
    const ccRecipients = data.ccEmail;

    const pythonScriptPath = path.join(__dirname, 'sendMail.py');
    const pythonProcess = spawn('python', [pythonScriptPath, subject, body, recipients, ccRecipients]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python script output: ${data}`);
        // Handle the output data from the Python script
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script error: ${data}`);
        // Handle the error output from the Python script
    });
    
    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        // Handle the script exit code
    });
}