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
    const peopleCountValueSpan = document.getElementById('peopleCountValue');
    const peopleDisplaySpan = document.getElementById('peopleCountDisplay');
    const peopleHiddenInput = document.getElementById('people');

    // --- Logique du Compteur de Personnes ---
    let currentPeople = parseInt(peopleHiddenInput.value, 10) || 4;
    function updatePeopleDisplay() {
        peopleCountValueSpan.textContent = currentPeople;
        peopleHiddenInput.value = currentPeople;
        peopleDisplaySpan.textContent = `${currentPeople} ${currentPeople === 1 ? 'personne' : 'personnes'}`;
    }

    decreaseBtn.addEventListener('click', () => {
        if (currentPeople > 1) {
            currentPeople--;
            updatePeopleDisplay();
        }
    });

    increaseBtn.addEventListener('click', () => {
        // Limite maximale facultative, par ex. 12
        // if (currentPeople < 12) {
            currentPeople++;
            updatePeopleDisplay();
        // }
    });

    // Initialiser l'affichage au chargement
    updatePeopleDisplay();

    // --- Auto-Tab entre champs date/heure ---
    function setupAutoTab(currentInput, nextInput, maxLength) {
        currentInput.addEventListener('input', () => {
            if (currentInput.value.length >= maxLength && nextInput) {
                nextInput.focus();
            }
        });
        currentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && currentInput.value.length === 0) {
                const prevInput = getPreviousInputInGroup(currentInput);
                if (prevInput) {
                    e.preventDefault();
                    prevInput.focus();
                }
            }
        });
    }

    function getPreviousInputInGroup(currentInput) {
        const dateInputs = [monthInput, dayInput, yearInput];
        const timeInputs = [hourInput, minuteInput, ampmSelect];
        let group = dateInputs.includes(currentInput) ? dateInputs
                  : timeInputs.includes(currentInput) ? timeInputs
                  : null;
        if (group) {
            const idx = group.indexOf(currentInput);
            if (idx > 0) return group[idx - 1];
        }
        return null;
    }

    setupAutoTab(monthInput, dayInput, 2);
    setupAutoTab(dayInput, yearInput, 2);
    setupAutoTab(hourInput, minuteInput, 2);
    minuteInput.addEventListener('input', () => {
        if (minuteInput.value.length >= 2) {
            ampmSelect.focus();
        }
    });
    ampmSelect.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            minuteInput.focus();
            minuteInput.select();
        }
    });

    // --- Validation du formulaire ---
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;
        const errorSpan = formGroup.querySelector('.error-message:not(.error-message-date-time)');
        if (errorSpan) errorSpan.textContent = message;
        formGroup.classList.add('has-error');
        inputElement.classList.add('error');
        inputElement.setAttribute('aria-invalid', 'true');
        if (errorSpan) {
            const errorId = inputElement.id + '-error-desc';
            errorSpan.id = errorId;
            inputElement.setAttribute('aria-describedby', errorId);
        }
    }

    function showGroupError(groupElement, message) {
        if (!groupElement) return;
        const errorSpan = groupElement.querySelector('.error-message-date-time');
        if (errorSpan) errorSpan.textContent = message;
        groupElement.classList.add('has-error');
    }

    function clearAllErrors() {
        form.querySelectorAll('.error-message').forEach(span => {
            span.textContent = '';
            span.removeAttribute('id');
        });
        form.querySelectorAll('.error, .error-field').forEach(el => {
            el.classList.remove('error', 'error-field');
            el.removeAttribute('aria-invalid');
            el.removeAttribute('aria-describedby');
        });
        form.querySelectorAll('.has-error').forEach(group => {
            group.classList.remove('has-error');
        });
    }

    function validateForm() {
        let valid = true;
        clearAllErrors();

        if (!nameInput.value.trim()) {
            showError(nameInput, 'Ce champ est requis');
            valid = false;
        }
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Ce champ est requis');
            valid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showError(emailInput, 'Veuillez utiliser une adresse e-mail valide');
            valid = false;
        }

        const dateFields = [monthInput, dayInput, yearInput];
        let dateIncomplete = false;
        dateFields.forEach(f => {
            if (!f.value.trim()) {
                dateIncomplete = true;
                f.classList.add('error-field');
            }
        });
        if (dateIncomplete) {
            const dateGroup = monthInput.closest('.form-group');
            showGroupError(dateGroup, 'Ce champ est incomplet');
            valid = false;
        }

        const timeFields = [hourInput, minuteInput, ampmSelect];
        let timeIncomplete = false;
        timeFields.forEach(f => {
            if (!f.value || f.value.trim() === '') {
                timeIncomplete = true;
                f.classList.add('error-field');
            }
        });
        if (timeIncomplete) {
            const timeGroup = hourInput.closest('.form-group');
            showGroupError(timeGroup, 'Ce champ est incomplet');
            valid = false;
        }

        return valid;
    }

    // --- Soumission via Formspree ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const isValid = validateForm();
        if (!isValid) {
            const firstError = form.querySelector('.error, .error-field');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
    
        const formData = new FormData(form);
    
        // Nettoyage : supprimer les champs inutiles
        formData.delete('_gotcha');
        formData.delete('_next');
    
        // Ajouter date et heure combinées
        formData.append('date', `${dayInput.value.padStart(2, '0')}/${monthInput.value.padStart(2, '0')}/${yearInput.value}`);
        formData.append('time', `${hourInput.value.padStart(2, '0')}:${minuteInput.value.padStart(2, '0')} ${ampmSelect.value}`);
    
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: new URLSearchParams(formData),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
    
            if (response.ok) {
                form.reset(); // ✅ Vider le formulaire
                window.location.href = 'https://legoutlocal.netlify.app/merci.html';
            } else {
                throw new Error('Erreur statut ' + response.status);
            }
        } catch (error) {
            console.error('Erreur Formspree:', error);
            alert("Une erreur est survenue. Veuillez réessayer plus tard ou nous appeler.");
        }
    });
    
    

        // --- Soumission via Formspree ---
        // document.addEventListener('DOMContentLoaded', () => {
        //     const form = document.getElementById('reservationForm');

        //     form.addEventListener('submit', (event) => {
        //         const isValid = validateForm();
        //         if (!isValid) {
        //             event.preventDefault(); // On bloque l'envoi uniquement si le formulaire est invalide

        //             const firstError = form.querySelector('.error, .error-field');
        //             if (firstError) {
        //                 firstError.focus();
        //                 firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        //             }
        //         }
        //         // Sinon, PAS de preventDefault
        //         // Le formulaire continue vers Formspree naturellement
        //     });
        // });

 });
