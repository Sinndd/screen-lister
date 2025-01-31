//Project/NextJS/screen-lister/src/preload.mjs
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    getDisplays: async () => {
        console.log('Invoking get-displays');
        return await ipcRenderer.invoke('get-displays');
    }
});

// Écouter les messages IPC et les afficher dans la console du navigateur
ipcRenderer.on('log-message', (event, message) => {
    console.log(message);
});