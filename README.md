# Verger du Coin - Portail Client

Ce projet contient le système d'information du Verger du Coin, composé d'un front-end React pour les clients et d'un proxy back-end pour communiquer avec Odoo.


## 📁 Structure du projet

```
.
├── verger-client-portal/     # Application React (front-end client)
└── verger-odoo-proxy/         # Serveur proxy Node.js (back-end API)
```

## 🚀 Installation et lancement

### Prérequis

- Node.js (version 16 ou supérieure recommandée)
- npm ou yarn

### 1. Front-end React (verger-client-portal)

```bash
# Naviguer vers le dossier du portail client
cd verger-client-portal

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le portail client sera accessible sur `http://localhost:8080` (ou le port indiqué dans le terminal).

### 2. Back-end Proxy (verger-odoo-proxy)

```bash
# Naviguer vers le dossier du proxy
cd verger-odoo-proxy

# Installer les dépendances
npm install

# Lancer le serveur proxy
node serve.js
```

Le serveur proxy sera accessible sur `http://localhost:3001` (ou le port configuré).

## 📦 Technologies utilisées

### Front-end
- React
- Vite

### Back-end
- Node.js
- Express

## 🤝 Contribution

Projet développé dans le cadre de la modernisation du SI du Verger du Coin.
