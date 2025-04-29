document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservationForm');
    if (!form) return;

    // Éléments du formulaire
    const nomInput = document.getElementById('nom');
    const emailInput = document.getElementById('email');
    const jourInput = document.getElementById('jour');
    const moisInput = document.getElementById('mois');
    const anneeInput = document.getElementById('annee');
    const heureInput = document.getElementById('heure');
    const minuteInput = document.getElementById('minute');
    const periodeSelect = document.getElementById('periode');
    const personnesInput = document.getElementById('personnes');

    /****************************************************
     * GESTION DU SUJET D'EMAIL AUTOMATIQUE
     * 
     * Ce bloc met à jour dynamiquement le sujet des emails
     * envoyés par Netlify en combinant :
     * - La date de réservation (jour/mois)
     * - Le nom du client
     * Format final : "Réservation du 25/12 - Jean Dupont"
     ****************************************************/
    function updateEmailSubject() {
        // Formatage à 2 chiffres (ex: 05 au lieu de 5)
        const day = jourInput.value.padStart(2, '0');
        const month = moisInput.value.padStart(2, '0');
        const name = nomInput.value.trim();
        
        // Validation minimale avant mise à jour
        if(day.length === 2 && month.length === 2 && name) {
            const subjectField = document.querySelector('[name="_subject"]');
            subjectField.value = `Réservation du ${day}/${month} - ${name}`;
        }
    }

    // Écoute les modifications sur les champs concernés
    jourInput.addEventListener('change', updateEmailSubject);
    moisInput.addEventListener('change', updateEmailSubject);
    nomInput.addEventListener('change', updateEmailSubject);

    // Gestion du compteur de personnes
    let currentPeople = 4;
    const updatePeopleDisplay = () => {
        document.getElementById('peopleCountValue').textContent = currentPeople;
        personnesInput.value = currentPeople;
    };

    document.getElementById('decreasePeople').addEventListener('click', () => {
        if (currentPeople > 1) {
            currentPeople--;
            updatePeopleDisplay();
        }
    });

    document.getElementById('increasePeople').addEventListener('click', () => {
        currentPeople++;
        updatePeopleDisplay();
    });

    // Auto-tabulation
    const setupAutoTab = (current, next, maxLength) => {
        current.addEventListener('input', () => {
            if (current.value.length >= maxLength && next) next.focus();
        });
    };

    setupAutoTab(moisInput, jourInput, 2);
    setupAutoTab(jourInput, anneeInput, 2);
    setupAutoTab(heureInput, minuteInput, 2);
    minuteInput.addEventListener('input', () => {
        if (minuteInput.value.length >= 2) periodeSelect.focus();
    });

    // Validation
    const validateForm = () => {
        let valid = true;
        
        // Réinitialiser les erreurs
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));

        // Validation des champs
        if (!nomInput.value.trim()) {
            showError(nomInput, 'Ce champ est requis');
            valid = false;
        }

        if (!emailInput.value.trim()) {
            showError(emailInput, 'Ce champ est requis');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            showError(emailInput, 'Email invalide');
            valid = false;
        }

        // Validation date
        if (!jourInput.value || !moisInput.value || !anneeInput.value) {
            showGroupError(jourInput.closest('.form-group'), 'Date incomplète');
            valid = false;
        }

        // Validation heure
        if (!heureInput.value || !minuteInput.value) {
            showGroupError(heureInput.closest('.form-group'), 'Heure incomplète');
            valid = false;
        }

        return valid;
    };

    const showError = (input, message) => {
        const group = input.closest('.form-group');
        group.classList.add('has-error');
        group.querySelector('.error-message').textContent = message;
    };

    const showGroupError = (group, message) => {
        group.classList.add('has-error');
        group.querySelector('.error-message').textContent = message;
    };

    // Soumission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            const formData = new FormData(form);
            formData.append('date_complete', `${jourInput.value}/${moisInput.value}/${anneeInput.value}`);
            formData.append('heure_complete', `${heureInput.value}:${minuteInput.value} ${periodeSelect.value}`);

            try {
                await fetch("/", {
                    method: "POST",
                    body: new URLSearchParams(formData),
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                });
                
                window.location.href = "/merci.html";
            } catch (error) {
                alert("Erreur d'envoi, veuillez nous appeler");
                console.error(error);
            }
        }
    });
});