# PremiumWash — Système de Gestion de Performance (PFE)

### 🚗 À propos du Projet
**PremiumWash** est une application web de gestion pour un centre de lavage automobile "Premium". L'objectif principal est d'automatiser le suivi de l'activité des agents de nettoyage et de calculer précisément leurs bonus de performance mensuels en fonction du type de véhicule traité et du temps travaillé.

---

### 🧠 Logique Métier (Règles de Calcul)
Le système transforme le travail effectué en **"Unités de Valeur"** pour assurer une équité entre les tâches :

1.  **Coefficients de Véhicule :**
    *   `Citadine` : **1.0 unité**
    *   `SUV / 4x4` : **1.5 unités**
2.  **Objectif de Performance (Quota) :**
    *   Chaque agent doit atteindre une moyenne de **6.0 unités par jour travaillé**.
3.  **Système de Bonus :**
    *   Si la moyenne mensuelle dépasse 6.0, l'agent gagne un bonus de **50 DH par unité supplémentaire**.
    *   *Formule :* `(Total Unités - (6 x Jours Travaillés)) x 50 DH`.

---

### 🛠️ Architecture Technique
L'application utilise une architecture **Full-Stack JavaScript** moderne :

*   **Frontend :** 
    *   HTML5 / CSS3 (Thème minimaliste Noir & Blanc).
    *   JavaScript Vanilla (Manipulation du DOM, API Fetch asynchrone).
*   **Backend (Serveur) :** 
    *   Node.js avec le framework **Express.js**.
    *   Middleware **CORS** pour la gestion des requêtes.
*   **Base de données :** 
    *   Fichier JSON (`data.json`) géré par le module `fs` (File System), permettant une persistance réelle des données sur le serveur.

---

### 📂 Structure du Projet
```text
PREMIUM-LAVAGE/
├── public/              # Fichiers Front-end
│   ├── login.html       # Interface de connexion
│   ├── agent.html       # Interface de saisie agents
│   ├── admin.html       # Tableau de bord administrateur
│   ├── script.js        # Logique client & Appels API
│   └── style.css        # Design et Responsive UI
├── data.json            # Base de données JSON
├── server.js            # Serveur API REST (Node/Express)
├── package.json         # Dépendances et scripts
└── .gitignore           # Exclusion du dossier node_modules