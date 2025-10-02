# CloudCost - Comparateur de coûts cloud

Application de comparaison de coûts entre différents fournisseurs cloud.

## 🚀 Démarrage rapide

### Prérequis
- Bun installé
- PostgreSQL en cours d'exécution

### Installation
```bash
bun install
```

### Démarrage en développement

#### Option 1: Démarrage automatique (recommandé)
```bash
bun run dev
```
Cette commande démarre automatiquement l'API backend puis le frontend.

#### Option 2: Démarrage manuel
```bash
# Terminal 1 - API Backend
bun run dev:api

# Terminal 2 - Frontend Web
bun run dev:web
```

### Accès à l'application
- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:3333

## 📁 Structure du projet

```
cloudcost/
├── apps/
│   ├── api/          # API Backend (AdonisJS)
│   └── web/          # Frontend (Nuxt.js)
├── package.json      # Scripts de démarrage
└── README.md
```

## 🔧 Configuration

### Variables d'environnement API
Le fichier `apps/api/env` contient les variables nécessaires :
- `PORT=3333` - Port de l'API
- `DB_*` - Configuration base de données
- `DIGITALOCEAN_API_TOKEN` - Token DigitalOcean
- `HETZNER_API_TOKEN` - Token Hetzner

### API Endpoints
- `GET /health` - Santé de l'API
- `GET /pricing` - Prix des fournisseurs cloud

## 🐛 Résolution de problèmes

### Erreur 404 sur /pricing
1. Vérifiez que l'API backend est démarrée sur le port 3333
2. Vérifiez les logs de l'API pour les erreurs
3. Assurez-vous que les tokens API sont configurés

### Erreur de connexion à la base de données
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les variables DB_* dans `apps/api/env`

## 📝 Utilisation

1. Accédez à http://localhost:3000
2. Remplissez le formulaire de configuration
3. Cliquez sur "Comparer" pour voir les résultats
4. Consultez les prix en temps réel des fournisseurs cloud
