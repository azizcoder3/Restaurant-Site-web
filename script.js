// Lorsque le contenu du DOM est complètement chargé, on exécute la fonction
window.addEventListener("DOMContentLoaded", () => {
    console.log("script.js loaded");
    // On sélectionne la première tablist (si vous avez plusieurs tablists, 
    // il faudra appliquer ce code à chacune d'elles)
    const tabList = document.querySelector('[role="tablist"]');
    // On récupère directement les enfants avec le rôle "tab" dans cette tablist
    const tabs = tabList.querySelectorAll(':scope > [role="tab"]');
  
    // On ajoute un gestionnaire d'événement "click" à chaque onglet
    tabs.forEach((tab) => {
      tab.addEventListener("click", changeTabs);
    });
  
    // Variable pour suivre l'index de l'onglet actuellement focalisé pour la navigation au clavier
    let tabFocus = 0;
  
    // Ajout d'un gestionnaire d'événement "keydown" sur la tablist pour activer la navigation avec les flèches
    tabList.addEventListener("keydown", (e) => {
      // Vérifie si la touche pressée est "ArrowRight" ou "ArrowLeft"
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        // On retire l'attribut tabindex de l'onglet actuellement focalisé
        tabs[tabFocus].setAttribute("tabindex", -1);
  
        if (e.key === "ArrowRight") {
          // Si la flèche droite est pressée, on passe à l'onglet suivant
          tabFocus++;
          // Si on est à la fin de la liste, on revient au début
          if (tabFocus >= tabs.length) {
            tabFocus = 0;
          }
        } else if (e.key === "ArrowLeft") {
          // Si la flèche gauche est pressée, on passe à l'onglet précédent
          tabFocus--;
          // Si on est au début de la liste, on revient à la fin
          if (tabFocus < 0) {
            tabFocus = tabs.length - 1;
          }
        }
  
        // On définit tabindex à 0 pour l'onglet nouvellement sélectionné afin qu'il soit dans l'ordre de tabulation
        tabs[tabFocus].setAttribute("tabindex", 0);
        // On déplace le focus sur cet onglet
        tabs[tabFocus].focus();
      }
    });
  });
  
  // Fonction appelée lors d'un clic sur un onglet
  function changeTabs(e) {
    const targetTab = e.target;          // L'onglet sur lequel l'utilisateur a cliqué
    const tabList = targetTab.parentNode;  // La liste d'onglets (tablist) contenant l'onglet cliqué
    const tabGroup = tabList.parentNode;   // Le groupe contenant à la fois la tablist et les panneaux (tabpanel)
  
    // Retirer la sélection de tous les onglets dans la tablist
    tabList
      .querySelectorAll(':scope > [aria-selected="true"]')
      .forEach((t) => t.setAttribute("aria-selected", false));
  
    // Définir l'onglet cliqué comme sélectionné
    targetTab.setAttribute("aria-selected", true);
  
    // Masquer tous les panneaux de contenu
    tabGroup
      .querySelectorAll(':scope > [role="tabpanel"]')
      .forEach((p) => p.setAttribute("hidden", true));
  
    // Afficher le panneau associé à l'onglet sélectionné
    // On récupère l'ID du panneau depuis l'attribut "aria-controls" de l'onglet
    tabGroup
      .querySelector(`#${targetTab.getAttribute("aria-controls")}`)
      .removeAttribute("hidden");
  }
  