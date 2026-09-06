# Utiliser une image légère de Node.js
FROM node:20-slim

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier le reste du code source
COPY . .

# Exposer le port (le port sera fourni par Back4app via process.env.PORT)
EXPOSE 3001

# Lancer le serveur
CMD ["npm", "start"]
