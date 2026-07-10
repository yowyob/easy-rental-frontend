#!/bin/bash

# Nom du fichier de sortie
OUTPUT_FILE="project_bundle.txt"

# Effacer le fichier s'il existe déjà
> $OUTPUT_FILE

echo "Génération du bundle dans $OUTPUT_FILE..."

# Liste des fichiers à exclure (regex)
# On exclut les dossiers de build, les secrets, les images et les lockfiles
EXCLUDE_PATTERN="node_modules|\.next|\.git|package-lock\.json|yarn\.lock|\.env|dist|\.cache|\.ico|\.png|\.jpg|fonts|public|mfe-client|container-shell|mfe-organisation"

# Parcourir les fichiers
# On cherche les fichiers textes (ts, tsx, js, jsx, json, css, md, etc.)
find . -type f -not -path '*/.*' | grep -vE "$EXCLUDE_PATTERN" | while read -r file; do
    echo "Ajout de : $file"
    echo "================================================" >> $OUTPUT_FILE
    echo "FILE: $file" >> $OUTPUT_FILE
    echo "================================================" >> $OUTPUT_FILE
    cat "$file" >> $OUTPUT_FILE
    echo -e "\n\n" >> $OUTPUT_FILE
done

echo "Terminé ! Vous pouvez envoyer $OUTPUT_FILE à l'IA."