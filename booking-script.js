document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservationForm');
    // Si le formulaire n'existe pas sur la page, on arrête.
    if (!form) {
        console.log("Formulaire de réservation non trouvé sur cette page.");
        return;
    }

    // Récupération des éléments du formulaire
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const monthInput = document.getElementById('month');
    const dayInput = document.getElementById('day');
    const yearInput = document.getElementById('year');
    const hourInput = document.getElementById('hour');
    const minuteInput = document.getElementById('minute');
    const ampmSelect = document.getElementById('ampm');

    const decreaseBtn = document.getElementById('decreasePeople');
    const increaseBtn = document.getElementById('increasePeople');
    const peopleCountValueSpan = document.getElementById('peopleCountValue'); // Juste le nombre
    const peopleDisplaySpan = document.getElementById('peopleCountDisplay'); // Le span entier
    const peopleHiddenInput = document.getElementById('people');

    // --- Logique du Compteur de Personnes ---
    let currentPeople = parseInt(peopleHiddenInput.value, 10) || 4; // Valeur par défaut 4

    function updatePeopleDisplay() {
        peopleCountValueSpan.textContent = currentPeople;
        peopleHiddenInput.value = currentPeople;
        // Met à jour le texte "X personne(s)"
        peopleDisplaySpan.textContent = `${currentPeople} ${currentPeople === 1 ? 'personne' : 'personnes'}`;
    }

    decreaseBtn.addEventListener('click', () => {
        if (currentPeople > 1) { // Minimum 1 personne
            currentPeople--;
            updatePeopleDisplay();
        }
    });

    increaseBtn.addEventListener('click', () => {
        // Optionnel: ajouter une limite max (ex: 12)
        // if (currentPeople < 12) {
           currentPeople++;
           updatePeopleDisplay();
        // }
    });

    // Initialiser l'affichage au chargement
    updatePeopleDisplay();


  // --- Logique de Validation et Soumission ---
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const isValid = validateForm();

    if (isValid) {
        // Combiner les champs date/heure
        const formData = new FormData(form);
        formData.append('date', `${dayInput.value.padStart(2, '0')}/${monthInput.value.padStart(2, '0')}/${yearInput.value}`);
        formData.append('time', `${hourInput.value.padStart(2, '0')}:${minuteInput.value.padStart(2, '0')} ${ampmSelect.value}`);

        try {
            // Envoyer à Netlify
            const response = await fetch("/", {
                method: "POST",
                body: new URLSearchParams(formData),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            if (response.ok) {
                // Succès
                alert('Réservation confirmée ! Merci ❤️');
                form.reset();
                currentPeople = 4;
                updatePeopleDisplay();
                clearAllErrors();
                
                // Optionnel : Redirection après 2s
                // setTimeout(() => window.location.href = '/merci.html', 2000);
            } else {
                throw new Error('Erreur réseau');
            }
        } catch (error) {
            console.error("Erreur :", error);
            alert("Une erreur est survenue. Veuillez réessayer ou nous appeler.");
        }
    } else {
        // Gestion des erreurs améliorée
        const firstErrorField = form.querySelector('.error, .error-field');
        if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

    function validateForm() {
        let valid = true;
        clearAllErrors(); // Nettoie les erreurs précédentes

        // 1. Validation du Nom
        if (!nameInput.value.trim()) {
            showError(nameInput, "Ce champ est requis");
            valid = false;
        }

        // 2. Validation de l'Email
        if (!emailInput.value.trim()) {
            showError(emailInput, "Ce champ est requis");
            valid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showError(emailInput, "Veuillez utiliser une adresse e-mail valide");
            valid = false;
        }

        // 3. Validation de la Date (vérifie si un des champs est vide)
        const dateFields = [monthInput, dayInput, yearInput];
        let isDateIncomplete = false;
        dateFields.forEach(field => {
            if (!field.value.trim()) {
                isDateIncomplete = true;
                field.classList.add('error-field'); // Marque le champ vide spécifique
            }
        });
        if (isDateIncomplete) {
            const dateGroup = monthInput.closest('.form-group'); // Trouve le groupe parent
            showGroupError(dateGroup, "Ce champ est incomplet"); // Affiche l'erreur pour le groupe
            valid = false;
        }

        // 4. Validation de l'Heure (vérifie si un des champs est vide)
        const timeFields = [hourInput, minuteInput, ampmSelect];
        let isTimeIncomplete = false;
        timeFields.forEach(field => {
             // Vérifie la valeur pour les inputs et le select
            if (!field.value || field.value.trim() === "") {
                isTimeIncomplete = true;
                field.classList.add('error-field'); // Marque le champ vide spécifique
            }
        });
        if (isTimeIncomplete) {
            const timeGroup = hourInput.closest('.form-group'); // Trouve le groupe parent
            showGroupError(timeGroup, "Ce champ est incomplet"); // Affiche l'erreur pour le groupe
            valid = false;
        }

        return valid;
    }

    // --- Fonctions d'aide pour la validation ---

    function isValidEmail(email) {
        // Expression régulière simple pour la validation d'email
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return; // Sécurité
        const errorSpan = formGroup.querySelector('.error-message:not(.error-message-date-time)'); // Cible le span d'erreur direct

        if (errorSpan) {
             errorSpan.textContent = message;
        }
        formGroup.classList.add('has-error');
        inputElement.classList.add('error'); // Style pour l'input lui-même
        inputElement.setAttribute('aria-invalid', 'true');
        // Associer le message d'erreur pour l'accessibilité
         if(errorSpan){
            const errorId = inputElement.id + '-error-desc';
            errorSpan.id = errorId;
            inputElement.setAttribute('aria-describedby', errorId);
         }

    }

    function showGroupError(groupElement, message) {
        if (!groupElement) return; // Sécurité
        const errorSpan = groupElement.querySelector('.error-message-date-time'); // Cible le span d'erreur de groupe

        if (errorSpan) {
             errorSpan.textContent = message;
        }
        groupElement.classList.add('has-error');
        // Pas besoin de marquer le groupe comme aria-invalid, les champs le sont implicitement
    }

    function clearAllErrors() {
        // Supprime les messages
        form.querySelectorAll('.error-message').forEach(span => {
            span.textContent = '';
            span.removeAttribute('id');
        });
        // Supprime les classes d'erreur des champs
        form.querySelectorAll('.error, .error-field').forEach(input => {
            input.classList.remove('error', 'error-field');
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');
        });
        // Supprime les classes d'erreur des groupes
        form.querySelectorAll('.has-error').forEach(group => {
            group.classList.remove('has-error');
        });
    }

    // --- Amélioration UX : Auto-Tab entre les champs date/heure ---
    function setupAutoTab(currentInput, nextInput, maxLength) {
        currentInput.addEventListener('input', () => {
            if (currentInput.value.length >= maxLength && nextInput) {
                nextInput.focus();
            }
        });
        // Gestion du retour arrière (Backspace)
        currentInput.addEventListener('keydown', (e) => {
             if (e.key === 'Backspace' && currentInput.value.length === 0) {
                 const prevInput = getPreviousInputInGroup(currentInput);
                 if (prevInput) {
                      e.preventDefault(); // Empêche le comportement par défaut si on gère
                     prevInput.focus();
                 }
             }
         });
    }

    // Trouve l'input précédent dans le même groupe (date ou heure)
    function getPreviousInputInGroup(currentInput) {
        const dateInputs = [monthInput, dayInput, yearInput];
        const timeInputs = [hourInput, minuteInput, ampmSelect];
        let group = null;
        if (dateInputs.includes(currentInput)) group = dateInputs;
        else if (timeInputs.includes(currentInput)) group = timeInputs;

        if (group) {
            const currentIndex = group.indexOf(currentInput);
            if (currentIndex > 0) {
                return group[currentIndex - 1];
            }
        }
        return null; // Pas d'élément précédent dans le groupe
    }

    // Configuration de l'auto-tab
    setupAutoTab(monthInput, dayInput, 2);
    setupAutoTab(dayInput, yearInput, 2);
    // Pas d'auto-tab depuis l'année
    setupAutoTab(hourInput, minuteInput, 2);
    // Pas d'auto-tab strict vers select, mais focus après 2 chiffres dans minute
    minuteInput.addEventListener('input', () => {
         if (minuteInput.value.length >= 2) {
             ampmSelect.focus();
         }
     });
     // Gestion spécifique pour le retour depuis le select
    ampmSelect.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            // Si on appuie sur backspace dans le select, on retourne aux minutes
            e.preventDefault(); // Empêche potentiellement de changer la valeur du select
            minuteInput.focus();
             // Sélectionne le contenu pour faciliter la correction
            minuteInput.select();
        }
    });


}); // Fin de DOMContentLoaded