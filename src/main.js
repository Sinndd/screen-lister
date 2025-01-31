import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { DisplayManager , JsQueryType } from '@ddc-node/ddc-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            contextIsolation: true, // Activer l'isolation du contexte
            enableRemoteModule: false, // Désactiver le module remote pour des raisons de sécurité
            nodeIntegration: true // Désactiver l'intégration de Node.js dans le rendu
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../index.html'));

    // Ouvrir les DevTools
    mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Écouter les messages IPC
ipcMain.handle('get-displays', async (event) => {
    const displayManager = new DisplayManager();
    const displays = await displayManager.collect();
    console.log('Displays yo:', displays);


    const displayInfo = await Promise.all(displays.map(async (display, index) => {
        console.log(`Display ${index}:`, display);

        let modelName;
        let manufacturer;

        try {
            modelName = await display.getVcpFeature(JsQueryType.ModelName);
        } catch (error) {
            console.warn(`Display ${index} does not support ModelName:`, error);
            modelName = 'Unknown Model';
        }

        try {
            const manufacturerInfo = await display.getVcpFeature(JsQueryType.ManufacturerId);
            manufacturer = `Manufacturer ID: ${manufacturerInfo.currentValue}`;
        } catch (error) {
            console.warn(`Display ${index} does not support ManufacturerId:`, error);
            manufacturer = 'Unknown Manufacturer';
        }

        console.log(`Display ${index} Model Name:`, modelName);
        console.log(`Display ${index} Manufacturer:`, manufacturer);

        return {
            name: modelName,
            manufacturer: manufacturer
        };
    }));

    return displayInfo;
});