document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservationForm');
    if (!form) {
        console.log("Formulaire de réservation non trouvé sur cette page.");
        return;
    }

    // Champs du formulaire
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

    // --- Compteur de personnes ---
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
        currentPeople++;
        updatePeopleDisplay();
    });

    updatePeopleDisplay();

    // --- Auto-Tabulation entre champs date/heure ---
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

    // --- Validation ---
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
        let dateIncomplete = dateFields.some(f => !f.value.trim());
        if (dateIncomplete) {
            const dateGroup = monthInput.closest('.form-group');
            showGroupError(dateGroup, 'Ce champ est incomplet');
            dateFields.forEach(f => f.classList.add('error-field'));
            valid = false;
        }

        const timeFields = [hourInput, minuteInput, ampmSelect];
        let timeIncomplete = timeFields.some(f => !f.value || f.value.trim() === '');
        if (timeIncomplete) {
            const timeGroup = hourInput.closest('.form-group');
            showGroupError(timeGroup, 'Ce champ est incomplet');
            timeFields.forEach(f => f.classList.add('error-field'));
            valid = false;
        }

        return valid;
    }

    // --- Soumission du formulaire ---
    form.addEventListener('submit', (event) => {
        const isValid = validateForm();
        if (!isValid) {
            event.preventDefault(); // Bloque l'envoi uniquement si erreur
            const firstError = form.querySelector('.error, .error-field');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            // ✅ Si valide, on laisse Netlify traiter, ET on reset pour être propre
            form.reset();
            updatePeopleDisplay(); // Remet le compteur de personnes à jour
        }
    });
});
