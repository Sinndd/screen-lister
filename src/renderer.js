// Appeler la fonction pour lister les écrans après le chargement du DOM
window.addEventListener('DOMContentLoaded', () => {
    listDisplays();
});

async function listDisplays() {
    const displays = await window.api.getDisplays();
    console.log('Detected displays:', displays); // Ajoutez ce log pour vérifier les écrans détectés
    const container = document.getElementById('controls-container');

    displays.forEach((display, index) => {
        const displayContainer = document.createElement('div');
        displayContainer.className = 'display-container';

        const h2 = document.createElement('h2');
        const displayName = display.name ? `${display.name}` : `Screen ${index + 1}`;
        h2.textContent = `- Display listed ${displayName}`;
        displayContainer.appendChild(h2);

        const p = document.createElement('p');
        p.textContent = `Brightness: ${display.brightness}%`;
        displayContainer.appendChild(p);

        container.appendChild(displayContainer);
    });
}