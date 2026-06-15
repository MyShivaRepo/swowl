"""Isolation des tests : un registre/dossier SWOWL temporaire est utilisé,
afin que les tests ne touchent JAMAIS le registre réel de l'utilisateur.
Doit s'exécuter AVANT l'import de triple_store (conftest chargé en premier)."""
import os
import tempfile

os.environ.setdefault("SWOWL_DIR", tempfile.mkdtemp(prefix="swowl_test_"))
