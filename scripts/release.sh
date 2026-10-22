#!/usr/bin/env bash
# Publie une nouvelle version de SWOWL.
# Source unique de vérité : backend/version.py (lue par l'API /api/version,
# le badge de l'app et le titre FastAPI). Le badge README suit le tag git.
set -euo pipefail
[ $# -eq 1 ] || { echo "usage: $(basename "$0") X.Y.Z"; exit 1; }
V="$1"
cd "$(dirname "$0")/.."
python3 - "$V" <<'PY'
import re, sys
p = "backend/version.py"
s = open(p).read()
open(p, "w").write(re.sub(r'VERSION = "[^"]*"', f'VERSION = "{sys.argv[1]}"', s))
PY
git add backend/version.py
git commit -m "release: v$V"
git tag -a "v$V" -m "v$V"
git push origin main "v$V"
echo "Released v$V"
