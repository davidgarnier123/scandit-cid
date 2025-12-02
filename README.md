# Scandit PWA - Inventaire Code-Barres

PWA (Progressive Web App) pour scanner des codes-barres 128 en continu pour gestion d'inventaire sur smartphones iOS et Android avec Scandit SDK.

## 🚀 Installation

1. **Cloner/Télécharger le projet**

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la clé Scandit**
   
   Créez un fichier `.env` à la racine du projet (copier `.env.example`) :
   ```bash
   VITE_SCANDIT_LICENSE_KEY=votre_cle_scandit_ici
   ```
   
   Pour obtenir une clé gratuite :
   - Rendez-vous sur https://www.scandit.com/
   - Créez un compte gratuit
   - Créez un nouveau projet "Web SDK"
   - Copiez la clé de licence dans le fichier `.env`

## 💻 Développement

```bash
npm run dev
```

Ouvrez http://localhost:5173 dans votre navigateur.

## 📱 Test sur smartphone

1. **Build le projet**
   ```bash
   npm run build
   npm run preview
   ```

2. **Accéder depuis votre smartphone**
   - Connectez votre smartphone au même réseau WiFi
   - Notez l'adresse IP affichée (ex: http://192.168.1.x:4173)
   - Ouvrez cette URL sur votre smartphone

3. **Installer comme PWA**
   - **iOS**: Safari > Partager > Ajouter à l'écran d'accueil
   - **Android**: Chrome > Menu ⋮ > Installer l'application

## ✨ Fonctionnalités

- ✅ Scan continu de codes-barres 128
- ✅ Liste d'inventaire avec horodatage
- ✅ Compteur en temps réel
- ✅ Vibration au scan (si supporté)
- ✅ Interface mobile-optimisée
- ✅ Installation PWA (fonctionne hors-ligne après installation)
- ✅ Design moderne et responsive

## 🔧 Technologies

- **Vite** - Build tool rapide
- **Scandit Web SDK** - Scanner de codes-barres professionnel
- **Vite PWA Plugin** - Génération automatique du manifest et service worker
- **Vanilla JavaScript** - Pas de framework, performance maximale

## 📦 Structure

```
scandit/
├── public/
│   ├── icon-192.png       # Icône PWA 192x192
│   └── icon-512.png       # Icône PWA 512x512
├── src/
│   ├── main.js            # Logique Scandit + gestion inventaire
│   └── style.css          # Design mobile-first
├── index.html             # Structure HTML
├── vite.config.js         # Config Vite + PWA
├── .env.example           # Template variables d'environnement
└── package.json           # Dépendances
```

## 🎯 Utilisation

1. Lancez l'application
2. Autorisez l'accès à la caméra
3. Pointez la caméra vers un code-barres 128
4. Le code est automatiquement ajouté à la liste
5. Scannez plusieurs codes successivement
6. Utilisez le bouton "Effacer la liste" pour recommencer

## 🔐 Note de Sécurité

Le fichier `.env` contenant votre clé API est ignoré par Git (`.gitignore`). Ne partagez jamais votre clé publiquement.
