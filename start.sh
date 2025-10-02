#!/bin/bash

echo "🚀 Démarrage de CloudCost..."

# Vérifier que bun est installé
if ! command -v bun &> /dev/null; then
    echo "❌ Bun n'est pas installé. Veuillez installer Bun d'abord."
    exit 1
fi

# Installer les dépendances si nécessaire
echo "📦 Installation des dépendances..."
bun install

# Démarrer l'API backend en arrière-plan
echo "🔧 Démarrage de l'API backend sur le port 3333..."
bun run dev:api &
API_PID=$!

# Attendre que l'API soit prête
echo "⏳ Attente du démarrage de l'API..."
sleep 10

# Vérifier que l'API répond
echo "🔍 Vérification de l'API..."
if curl -s http://localhost:3333/ > /dev/null; then
    echo "✅ API backend démarrée avec succès"
else
    echo "❌ L'API backend n'a pas démarré correctement"
    kill $API_PID 2>/dev/null
    exit 1
fi

# Démarrer le frontend
echo "🌐 Démarrage du frontend sur le port 3000..."
bun run dev:web &
WEB_PID=$!

echo ""
echo "🎉 CloudCost est démarré !"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 API Backend: http://localhost:3333"
echo ""
echo "Pour arrêter l'application, appuyez sur Ctrl+C"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt de l'application..."
    kill $API_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Attendre que l'un des processus se termine
wait
