const { exec, spawn } = require('child_process');
module.exports = { runPythonScript };

function runPythonScript(data) {
    const subject = data.subject;
    const body = data.html;
    const recipients = data.email;
    const ccRecipients = data.ccEmail;
    const pythonProcess = spawn('python', ['sendMail.py', subject, body, recipients, ccRecipients]);

    console.log("Python script started");

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