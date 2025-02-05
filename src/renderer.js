// Appeler la fonction pour lister les écrans après le chargement du DOM
window.addEventListener('DOMContentLoaded', () => {
    listDisplays();
});

async function listDisplays() {
    const displays = await window.api.getDisplays();
    console.log('Detected displays:', displays); // Ajoutez ce log pour vérifier les écrans détectés

    const container = document.getElementById('display-container');
    container.className = 'flex flex-wrap justify-center';

    displays.forEach((display, index) => {
        const displayContainer = document.createElement('div');
        displayContainer.className = 'w-64 h-64 border p-4 m-4 flex flex-col justify-between items-center rounded-lg shadow-lg'; // Ajouter border radius et box shadow

        const header = document.createElement('div');
        header.className = 'w-full flex justify-between items-center';

        const h2 = document.createElement('h2');
        const displayName = display.modelName ? `${display.modelName}` : `Screen ${index + 1}`;
        h2.textContent = displayName;
        h2.className = 'text-lg font-bold';

        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editButton.className = 'text-blue-500 hover:text-blue-700 ml-2'; // Ajouter une marge à gauche pour espacer du texte
        editButton.addEventListener('click', () => {
            showEditInput(displayContainer, h2, displayName, index, editButton);
        });

        header.appendChild(h2);
        header.appendChild(editButton);
        displayContainer.appendChild(header);

        const percentageContainer = document.createElement('div');
        percentageContainer.className = 'flex items-baseline';

        const percentageValue = document.createElement('span');
        percentageValue.textContent = display.brightness;
        percentageValue.className = 'text-6xl font-semibold';
        percentageValue.style.color = '#ffcf26';

        const percentageSymbol = document.createElement('span');
        percentageSymbol.textContent = '%';
        percentageSymbol.className = 'text-2xl font-semibold';
        percentageSymbol.style.color = '#000';
        percentageContainer.appendChild(percentageValue);
        percentageContainer.appendChild(percentageSymbol);

        if (display.brightness !== "Cet écran n'est pas compatible") {
            // Ajouter une jauge de réglage de la luminosité
            const rangeInput = document.createElement('input');
            rangeInput.type = 'range';
            rangeInput.min = 0;
            rangeInput.max = 100;
            rangeInput.value = display.brightness;
            rangeInput.className = 'slider w-full mb-6'; // Ajouter une marge inférieure et la classe slider

            // Fonction pour mettre à jour le style de fond de la jauge
            const updateRangeBackground = (input) => {
                const value = input.value;
                const progress = (value / input.max) * 100;
                input.style.background = `linear-gradient(to right, #ffcf26 ${progress}%, #ccc ${progress}%)`;
            };

            // Initialiser le style de fond de la jauge
            updateRangeBackground(rangeInput);

            rangeInput.addEventListener('input', (event) => {
                const newBrightness = event.target.value;
                window.api.setBrightness(index, newBrightness);
                percentageValue.textContent = newBrightness;
                updateRangeBackground(rangeInput);
            });

            displayContainer.appendChild(percentageContainer);
            displayContainer.appendChild(rangeInput);
        } else {
            // Ajouter un badge "Flat" en jaune
            const badge = document.createElement('span');
            badge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
            badge.textContent = 'Erreur';

            const percentage = document.createElement('h3');
            percentage.textContent = "Cet écran n'est pas compatible";
            percentage.className = 'text-center flex-grow flex items-center justify-center text-lg font-semibold'; // Réduire la taille du texte et ajouter une marge supérieure


            displayContainer.className += ' flex flex-col justify-center'; // Centrer verticalement le conteneur
            displayContainer.appendChild(badge);
            displayContainer.appendChild(percentage);
        }

        container.appendChild(displayContainer);
    });
}

function showEditInput(displayContainer, h2, displayName, index, editButton) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = displayName;
    input.className = 'border p-1 mr-2';

    const saveButton = document.createElement('button');
    saveButton.innerHTML = '<i class="fas fa-check"></i>';
    saveButton.className = 'text-green-500 hover:text-green-700 mr-2';
    saveButton.addEventListener('click', () => {
        h2.textContent = input.value;
        displayContainer.removeChild(input);
        displayContainer.removeChild(saveButton);
        displayContainer.removeChild(cancelButton);
        displayContainer.appendChild(h2);
        displayContainer.appendChild(editButton);
    });

    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = '<i class="fas fa-times"></i>';
    cancelButton.className = 'text-red-500 hover:text-red-700';
    cancelButton.addEventListener('click', () => {
        displayContainer.removeChild(input);
        displayContainer.removeChild(saveButton);
        displayContainer.removeChild(cancelButton);
        displayContainer.appendChild(h2);
        displayContainer.appendChild(editButton);
    });

    if (displayContainer.contains(h2)) {
        displayContainer.removeChild(h2);
    }
    if (displayContainer.contains(editButton)) {
        displayContainer.removeChild(editButton);
    }
    displayContainer.appendChild(input);
    displayContainer.appendChild(saveButton);
    displayContainer.appendChild(cancelButton);
}