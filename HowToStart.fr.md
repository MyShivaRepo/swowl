# Comment démarrer — les assistants d'ontologie

Ce guide vous accompagne, **pas à pas**, dans les deux assistants (wizards) qui
permettent d'amener une ontologie dans SWOWL. Tous deux se trouvent dans l'onglet
**Ontologies** (le premier onglet, global à toute l'application).

> 🇬🇧 An English version of this guide is available: [HowToStart.md](HowToStart.md).

À l'ouverture de l'onglet **Ontologies**, vous voyez quatre boutons d'action :

| Bouton | Rôle |
|--------|------|
| ✨ **New Ontology** | Créer une nouvelle ontologie vide — *Cas n°1 ci-dessous* |
| 📥 **Import Ontology** | Importer un fichier `.owl` / `.ttl` / `.rdf` existant — *Cas n°2 ci-dessous* |
| 📂 **Load Ontology** | Enregistrer une ontologie déjà sauvegardée en `.json` SWOWL |
| **W3C** Fetch W3C Ontologies | Télécharger les ontologies de référence RDF, RDFS, OWL, SKOS depuis w3.org |

Cliquer sur un bouton ouvre son panneau d'assistant juste en dessous ; la croix
**✕** dans l'en-tête du panneau (ou le bouton **Cancel**) le ferme sans rien
faire. Les champs marqués d'une **\*** sont obligatoires.

---

## Cas n°1 : Je pars de zéro => Choisir l'assistant **« New Ontology »**

À utiliser lorsque vous n'avez encore aucune ontologie et que vous voulez en
construire une de zéro.

1. **Ouvrir l'assistant.** Dans l'onglet **Ontologies**, cliquez sur
   **✨ New Ontology**. Le panneau de l'assistant s'ouvre.

2. **Name \*** — saisissez le nom de l'ontologie (ex. `MyOntology`). C'est aussi
   le nom du fichier qui sera créé sur le disque, avec l'extension `.json`
   ajoutée automatiquement (`MyOntology.json`).

3. **Directory \*** — cliquez sur le champ pour ouvrir l'**explorateur de
   fichiers** et choisir le dossier où le fichier `.json` sera enregistré.

4. **Prefix** — un préfixe court utilisé pour afficher vos entités (par défaut :
   `onto`). Avec le préfixe `onto`, une classe `Part` s'affiche `onto:Part`.
   Laissez-le vide pour afficher les ids locaux nus. *(Optionnel, mais
   recommandé.)*

5. **Namespace (base URI) \*** — l'IRI de base de votre ontologie
   (ex. `https://example.org/my-ontology`). Toutes les entités que vous créerez
   vivront sous cet espace de noms.

6. **Imported namespaces** *(optionnel)* — si votre ontologie réutilise des
   entités issues d'**autres** ontologies, cliquez sur **+ namespace** et ajoutez
   une ou plusieurs paires `préfixe → namespace`. Elles déclarent les
   `owl:imports` et donnent aux entités importées un préfixe d'affichage
   contextuel.

7. **Créer.** Cliquez sur **Add to Registry**.
   - Si **Connect immediately** est coché (c'est le cas par défaut), la nouvelle
     ontologie est enregistrée **et** connectée — elle devient immédiatement
     l'ontologie active.
   - Si vous le décochez, l'ontologie est seulement enregistrée ; vous pourrez la
     connecter plus tard depuis la liste du registre.

8. **C'est prêt.** Une fois connectée (indicateur vert **●** dans la ligne du
   registre), les onglets d'édition — **Classes, ObjectProperties,
   DatatypeProperties, AnnotationProperties, Individuals, SWRL Rules** —
   travaillent tous sur cette ontologie. Les nouvelles hiérarchies de classes
   démarrent sous `owl:Thing`.

> **Champs requis :** Name, Directory et Namespace (base URI). L'assistant
> s'arrête et vous prévient si l'un d'eux est vide.

---

## Cas n°2 : J'ai déjà une ontologie => Choisir l'assistant **« Import Ontology »**

À utiliser lorsque vous disposez déjà d'un fichier d'ontologie (`.owl`, `.ttl`,
`.rdf`, `.xml`) que vous souhaitez visualiser et éditer dans SWOWL.

1. **Ouvrir l'assistant.** Dans l'onglet **Ontologies**, cliquez sur
   **📥 Import Ontology**.

2. **Source file \*** — cliquez sur le champ pour ouvrir l'**explorateur de
   fichiers** et sélectionner votre fichier `.owl` / `.ttl` / `.rdf` / `.xml`.

3. **Lecture automatique des métadonnées.** Cliquez sur
   **🔍 Read prefix, URI & imports from file**. SWOWL inspecte le fichier et
   remplit automatiquement :
   - le **Prefix** et le **Namespace (base URI)**,
   - le **Name** (uniquement si vous l'avez laissé vide), et
   - la section **Imported namespaces** (espaces de noms référencés + `owl:imports`
     déclarés, chacun avec un préfixe suggéré).

   *Cette étape est optionnelle — vous pouvez tout saisir à la main — mais c'est
   le moyen le plus simple et le plus sûr de remplir correctement le formulaire.*

4. **Prefix** — le préfixe d'affichage des entités importées (prérempli par
   l'étape 🔍 ; modifiable).

5. **Namespace (base URI) \*** — l'IRI de base (détecté par 🔍, ou saisi
   manuellement).

6. **Imported namespaces** *(optionnel)* — vérifiez les paires
   `préfixe → namespace` préremplies depuis le fichier ; ajoutez / modifiez /
   supprimez au besoin. Chacune contrôle l'affichage des entités issues d'une
   autre ontologie (préfixe contextuel).

7. **Name \*** — le nom du fichier `.json` SWOWL qui sera créé à partir de la
   source importée (ex. `MyOntology` → `MyOntology.json`).

8. **Directory \*** — cliquez sur le champ pour choisir le dossier de destination
   de ce fichier `.json`.

9. **Importer.** Cliquez sur **Import & Register**. SWOWL convertit le fichier
   source en une ontologie `.json` SWOWL, l'enregistre, et :
   - si **Connect immediately** est coché (par défaut), s'y connecte aussitôt ;
   - si vous le décochez, l'ontologie est importée et enregistrée mais laissée
     déconnectée.

10. **Explorer.** Une fois connectée, parcourez le modèle importé via les onglets
    d'édition et l'onglet **Views** (arbre hyperbolique, treemap, graphe réseau).

> **Champs requis :** Source file, Name, Directory et Namespace (base URI).
> Utilisez **🔍** pour détecter l'URI automatiquement, ou saisissez-le
> manuellement ; l'assistant vous prévient si un champ requis manque.

---

## Une fois connecté

- L'ontologie connectée est signalée par un **●** vert dans le registre et dans le
  sélecteur d'ontologie de la barre supérieure ; vous pouvez changer d'ontologie
  active à tout moment.
- Vous avez déjà un fichier `.json` SWOWL (par ex. exporté précédemment) ?
  Utilisez plutôt **📂 Load Ontology** — même principe, avec un bouton **🔍** de
  lecture pour préremplir les champs.
- Besoin des vocabulaires de référence du W3C (RDF, RDFS, OWL, SKOS) ? Utilisez
  **Fetch W3C Ontologies**.

Pour les spécifications complètes (dérivées du code source) de chaque
comportement, voir les dossiers `exigences/` (FR) et `requirements/` (EN), en
particulier `Ontologies.md`.
