// Appeler la fonction pour lister les écrans après le chargement du DOM
window.addEventListener('DOMContentLoaded', () => {
    listDisplays();
});

async function listDisplays() {
    const displays = await window.api.getDisplays();
    console.log('Detected displays:', displays); // Ajoutez ce log pour vérifier les écrans détectés

    const container = document.getElementById('display-container');
    displays.forEach((display, index) => {
        const displayContainer = document.createElement('div');
        displayContainer.className = 'display-container';

        const h2 = document.createElement('h2');
        const displayName = display.modelName ? `${display.modelName}` : `Screen ${index + 1}`;
        h2.textContent = `- ${displayName}`;
        displayContainer.appendChild(h2);

        const p = document.createElement('p');
        if (display.brightness !== "Cet écran n'est pas compatible") {
            p.textContent = `Brightness: ${display.brightness}%`;

            // Ajouter une jauge de réglage de la luminosité
            const rangeInput = document.createElement('input');
            rangeInput.type = 'range';
            rangeInput.min = 0;
            rangeInput.max = 100;
            rangeInput.value = display.brightness;
            rangeInput.addEventListener('input', (event) => {
                const newBrightness = event.target.value;
                window.api.setBrightness(index, newBrightness);
                p.textContent = `Brightness: ${newBrightness}%`;
            });
            displayContainer.appendChild(rangeInput);
        } else {
            p.textContent = display.brightness;
        }
        displayContainer.appendChild(p);

        container.appendChild(displayContainer);
    });
}