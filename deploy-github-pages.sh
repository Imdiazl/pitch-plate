#!/usr/bin/env bash
# Publishes this folder to a public GitHub Pages site: https://imdiazl.github.io/pitch-plate/
set -euo pipefail
cd "$(dirname "$0")"
REPO="pitch-plate"
if ! gh repo view "$REPO" >/dev/null 2>&1; then
  gh repo create "$REPO" --public --description "Pitch & Plate – personal macro tracker" --confirm >/dev/null 2>&1 || gh repo create "$REPO" --public --description "Pitch & Plate – personal macro tracker"
fi
rm -rf .git
git init -q -b main
git add index.html manifest.webmanifest sw.js icon-192.png icon-512.png icon-512-maskable.png
git -c user.name="Ivan" -c user.email="ivan@convious.com" commit -q -m "Pitch & Plate v1"
git remote add origin "https://github.com/Imdiazl/$REPO.git"
git push -q -u origin main --force
gh api -X POST "repos/Imdiazl/$REPO/pages" -f 'source[branch]=main' -f 'source[path]=/' >/dev/null 2>&1 || true
echo "Deployed. Give GitHub Pages ~1 minute, then open on your Android:"
echo "https://imdiazl.github.io/$REPO/"
