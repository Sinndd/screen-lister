import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { DisplayManager, VCPFeatureCode } from '@ddc-node/ddc-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let monitors = [];

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            contextIsolation: true, // Activer l'isolation du contexte
            enableRemoteModule: false, // Désactiver le module remote pour des raisons de sécurité
            nodeIntegration: true // Activer l'intégration de Node.js dans le rendu
        }
    });

    mainWindow.loadFile('index.html');
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

async function getMonitorInfo() {
    const displayManager = new DisplayManager();
    monitors = await displayManager.collect();

    const displayInfo = await Promise.all(monitors.map(async (monitor, index) => {
        let brightness = 'N/A';
        let modelName = 'Unknown Model';
        let manufacturer = 'Unknown Manufacturer';

        try {
            const brightnessFeature = await monitor.getVcpFeature(VCPFeatureCode.ImageAdjustment.Luminance);
            brightness = brightnessFeature.currentValue;
            console.log(`Monitor ${index + 1} Brightness: ${brightness}`);
        } catch (error) {
            console.warn(`Failed to get brightness for monitor ${index + 1}:`, error);
            brightness = "Cet écran n'est pas compatible";
        }

        try {
            const modelNameFeature = await monitor.getVcpFeature(VCPFeatureCode.DisplayControl.DisplayControllerId);
            if (modelNameFeature?.currentValue) {
                modelName = modelNameFeature.currentValue;
                console.log(`Monitor ${index + 1} Model Name: ${modelName}`);
            }
        } catch (error) {
            console.warn(`Failed to get model name for monitor ${index + 1}:`, error);
        }

        return {
            modelName,
            manufacturer,
            brightness
        };
    }));

    return displayInfo;
}

// Écouter les messages IPC
ipcMain.handle('get-displays', async (event) => {
    const displayInfo = await getMonitorInfo();
    console.log('Displays info:', displayInfo);
    return displayInfo;
});

ipcMain.handle('set-brightness', async (event, index, brightness) => {
    try {
        const monitor = monitors[index];
        const brightnessValue = parseInt(brightness, 10); // Convertir la luminosité en nombre
        await monitor.setVcpFeature(VCPFeatureCode.ImageAdjustment.Luminance, brightnessValue);
        console.log(`Monitor ${index + 1} Brightness set to: ${brightnessValue}`);
    } catch (error) {
        console.warn(`Failed to set brightness for monitor ${index + 1}:`, error);
    }
});

app.whenReady().then(createWindow);