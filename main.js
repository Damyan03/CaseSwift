const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');

// Define the storage file path
const storageFile = path.join(app.getPath('userData'), 'storage.json');

// Check if the application is running in development mode
const isDev = true;

// Import the Python script runner
const { runPythonScript } = require('./pythonWrapper');

// Initialize the storage object
let storage = {
    emails: null,
    signiture: null,
};

// Create the Electron window
const createWindow = () => {
    const win = new BrowserWindow({
        width: isDev ? 1000 : 700,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    // Open the DevTools in development mode
    if (isDev) {
        win.webContents.openDevTools();
    }

    // Remove the menu bar
    win.removeMenu();
    // Load the HTML file
    win.loadFile('index.html');
};

// Handle the 'send-email' IPC event
ipcMain.handle('send-email', (event, data) => {
    try {
        // Run the Python script with the provided data
        runPythonScript(data);
        return "sent";
    } catch (error) {
        console.error(error);
        throw error;
    }
});

// Handle the 'update-emails' IPC event
ipcMain.handle('update-emails', (event, emails) => {
    try {
        // Update the 'emails' property in the storage object
        storage.emails = emails;

        // Write the updated storage object to the storage file
        fs.writeFileSync(storageFile, JSON.stringify(storage));

        return "Emails updated successfully";
    } catch (error) {
        console.error(error);
        throw error;
    }
});

// Handle the 'get-data' IPC event
ipcMain.handle('get-data' , (event) => {
    try {
        // Read the storage file and parse the data
        const data = fs.readFileSync(storageFile);
        storage = JSON.parse(data);

        return storage;
    } catch (error) {
        console.error(error);
        throw error;
    }
});

// Handle the 'update-signiture' IPC event
ipcMain.handle('update-signiture', (event, signiture) => {
    try {
        // Update the 'signiture' property in the storage object
        storage.signiture = signiture;

        // Write the updated storage object to the storage file
        fs.writeFileSync(storageFile, JSON.stringify(storage));

        return "Signiture updated successfully";
    } catch (error) {
        console.error(error);
        throw error;
    }
});

ipcMain.handle('update-cc-emails', (event, ccEmails) => {
    try {
        // Update the 'ccEmails' property in the storage object
        storage.ccEmails = ccEmails;

        // Write the updated storage object to the storage file
        fs.writeFileSync(storageFile, JSON.stringify(storage));
        
        return "CC Emails updated successfully";
    } catch (error) {
        console.error(error);
        throw error;
    }
});

// Create the Electron window when the application is ready
app.whenReady().then(() => {
    createWindow();

    // Recreate the window if all windows are closed and the platform is not macOS
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit the application when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
