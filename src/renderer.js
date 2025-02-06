// Appeler la fonction pour lister les écrans après le chargement du DOM
window.addEventListener('DOMContentLoaded', () => {
    listDisplays();
});

async function listDisplays() {
    try {
        const displays = await window.api.getDisplays();
        console.log('Detected displays:', displays); // Ajoutez ce log pour vérifier les écrans détectés

        const container = document.getElementById('display-container');
        container.className = 'flex flex-wrap justify-center';

        displays.forEach((display, index) => {
            const displayContainer = document.createElement('div');
            displayContainer.className = 'w-72 h-64 border p-4 m-4 flex flex-col justify-between items-center rounded-lg shadow-lg'; // Ajouter border radius et box shadow            

            const header = document.createElement('div');
            header.className = 'w-full flex justify-between items-center';

            const h2 = document.createElement('h2');
            const storedName = localStorage.getItem(`displayName-${index}`);
            const displayName = storedName ? storedName : display.modelName ? `${display.modelName}` : `Screen ${index + 1}`;
            h2.textContent = displayName;
            h2.className = 'text-lg font-bold';

            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            editButton.className = 'hover:text-blue-700 ml-2'; // Ajouter une marge à gauche pour espacer du texte
            editButton.style.color = '#ffcf26'; // Définir la couleur du texte
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
            percentageSymbol.style.color = '#000'; // Garder le symbole % en noir

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
                // Diviser l'encart en trois parties égales
                const section1 = document.createElement('div');
                section1.className = 'flex-grow flex items-center justify-center h-3';
                const section2 = document.createElement('div');
                section2.className = 'flex-grow flex items-center justify-center h-5';
                const section3 = document.createElement('div');
                section3.className = 'flex-grow flex items-center justify-center h-3';

                // Ajouter un badge "Erreur" en jaune dans la première section
                const badge = document.createElement('span');
                badge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
                badge.textContent = 'Non reconnu';
                section1.appendChild(badge);

                // Ajouter le texte "Cet écran n'est pas compatible" dans la deuxième section
                const percentage = document.createElement('h3');
                percentage.textContent = "Cet écran n'est pas compatible";
                percentage.className = 'text-center text-lg font-semibold';

                section2.appendChild(percentage);


                // Ajouter les sections au conteneur
                displayContainer.appendChild(section1);
                displayContainer.appendChild(section2);
                displayContainer.appendChild(section3);
            }

            container.appendChild(displayContainer);
        });
    } catch (error) {
        console.error('Error listing displays:', error);
        // Gérer l'erreur de manière appropriée
    }
}

function showEditInput(displayContainer, h2, displayName, index, editButton) {
    // Créer les éléments input, saveButton et cancelButton une seule fois
    let input = displayContainer.querySelector('.edit-input');
    let saveButton = displayContainer.querySelector('.save-button');
    let cancelButton = displayContainer.querySelector('.cancel-button');

    if (!input) {
        input = document.createElement('input');
        input.type = 'text';
        input.value = displayName;
        input.className = 'edit-input border p-1 mr-2';
        input.style.display = 'none'; // Masquer l'input de modification par défaut
        displayContainer.appendChild(input);
    }

    if (!saveButton) {
        saveButton = document.createElement('button');
        saveButton.innerHTML = '<i class="fas fa-check"></i>';
        saveButton.className = 'save-button text-green-500 hover:text-green-700 mr-2';
        saveButton.style.display = 'none'; // Masquer le bouton "accepter" par défaut
        displayContainer.appendChild(saveButton);
    }

    if (!cancelButton) {
        cancelButton = document.createElement('button');
        cancelButton.innerHTML = '<i class="fas fa-times"></i>';
        cancelButton.className = 'cancel-button text-red-500 hover:text-red-700';
        cancelButton.style.display = 'none'; // Masquer le bouton "annuler" par défaut
        displayContainer.appendChild(cancelButton);
    }

    saveButton.addEventListener('click', () => {
        const newName = input.value;
        h2.textContent = newName;
        input.style.display = 'none';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
        h2.style.display = 'inline'; // Réafficher le nom de l'écran
        editButton.style.display = 'inline'; // Réafficher le bouton "modifier"
        displayContainer.classList.remove('flex-row'); // Enlever la disposition en ligne
        displayContainer.classList.remove('justify-center'); 
        displayContainer.classList.add('flex-col'); // Ajouter la disposition en colonne
        // Réafficher tous les autres éléments de l'encart
        Array.from(displayContainer.children).forEach(child => {
            if (child !== input && child !== saveButton && child !== cancelButton) {
                child.style.display = '';
            }
        });
        // Sauvegarder le nom modifié dans localStorage
        localStorage.setItem(`displayName-${index}`, newName);
    });

    cancelButton.addEventListener('click', () => {
        input.style.display = 'none';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
        h2.style.display = 'inline'; // Réafficher le nom de l'écran
        editButton.style.display = 'inline'; // Réafficher le bouton "modifier"
        displayContainer.classList.remove('flex-row'); // Enlever la disposition en ligne
        displayContainer.classList.remove('justify-center'); 
        displayContainer.classList.add('flex-col'); // Ajouter la disposition en colonne
        // Réafficher tous les autres éléments de l'encart
        Array.from(displayContainer.children).forEach(child => {
            if (child !== input && child !== saveButton && child !== cancelButton) {
                child.style.display = '';
            }
        });
    });

    // Ajouter l'événement pour le bouton "modifier" une seule fois
    if (!editButton.hasEventListener) {
        editButton.addEventListener('click', () => {
            h2.style.display = 'none'; // Masquer le nom de l'écran
            input.style.display = 'inline'; // Afficher l'input de modification
            saveButton.style.display = 'inline'; // Afficher le bouton "accepter"
            cancelButton.style.display = 'inline'; // Afficher le bouton "annuler"
            editButton.style.display = 'none'; // Masquer le bouton "modifier"
            displayContainer.classList.remove('flex-col'); // Enlever la disposition en colonne
            displayContainer.classList.add('flex-row');
            displayContainer.classList.add('justify-center') // Ajouter la disposition en ligne
            // Masquer tous les autres éléments de l'encart
            Array.from(displayContainer.children).forEach(child => {
                if (child !== input && child !== saveButton && child !== cancelButton) {
                    child.style.display = 'none';
                }
            });
        });
        editButton.hasEventListener = true; // Marquer que l'événement a été ajouté
    }
}