# How to start — the ontology wizards

This guide walks you, **step by step**, through the two wizards used to get an
ontology into SWOWL. Both live in the **Ontologies** tab (the first tab, global
to the whole app).

> 🇫🇷 Une version française de ce guide est disponible : [HowToStart.fr.md](HowToStart.fr.md).

When you open the **Ontologies** tab you see four action buttons:

| Button | What it does |
|--------|--------------|
| ✨ **New Ontology** | Create a new, empty ontology — *Case #1 below* |
| 📥 **Import Ontology** | Bring in an existing `.owl` / `.ttl` / `.rdf` file — *Case #2 below* |
| 📂 **Load Ontology** | Register an ontology already saved as a SWOWL `.json` file |
| **W3C** Fetch W3C Ontologies | Download the RDF, RDFS, OWL, SKOS reference ontologies from w3.org |

Clicking a button opens its wizard panel just below; the **✕** in the panel
header (or the **Cancel** button) closes it without doing anything. Fields marked
with **\*** are required.

---

## Case #1 : I'm starting from scratch => Choose the **"New Ontology"** wizard

Use this when you have no ontology yet and want to build one from zero.

1. **Open the wizard.** In the **Ontologies** tab, click **✨ New Ontology**.
   The wizard panel opens.

2. **Name \*** — type the ontology name (e.g. `MyOntology`). This is also the
   name of the file that will be created on disk, with the `.json` extension
   appended automatically (`MyOntology.json`).

3. **Directory \*** — click the field to open the **file browser** and pick the
   folder where the `.json` file will be stored.

4. **Prefix** — a short prefix used to display your entities (default: `onto`).
   With prefix `onto`, a class `Part` is shown as `onto:Part`. Leave it empty to
   display bare local ids. *(Optional, but recommended.)*

5. **Namespace (base URI) \*** — the base IRI of your ontology
   (e.g. `https://example.org/my-ontology`). Every entity you create will live
   under this namespace.

6. **Imported namespaces** *(optional)* — if your ontology will reuse entities
   from **other** ontologies, click **+ namespace** and add one or more
   `prefix → namespace` pairs. These declare `owl:imports` and give imported
   entities a contextual display prefix.

7. **Create it.** Click **Add to Registry**.
   - If **Connect immediately** is ticked (it is by default), the new ontology is
     registered **and** connected — it becomes the active ontology right away.
   - If you untick it, the ontology is only registered; you can connect it later
     from the registry list.

8. **You're ready.** Once connected (green **●** indicator in the registry row),
   the editing tabs — **Classes, ObjectProperties, DatatypeProperties,
   AnnotationProperties, Individuals, SWRL Rules** — all operate on this
   ontology. New class hierarchies start under `owl:Thing`.

> **Required to proceed:** Name, Directory and Namespace (base URI). The wizard
> stops and warns you if any of them is empty.

---

## Case #2 : I already have an ontology => Choose the **"Import Ontology"** wizard

Use this when you already have an ontology file (`.owl`, `.ttl`, `.rdf`, `.xml`)
that you want to visualise and edit in SWOWL.

1. **Open the wizard.** In the **Ontologies** tab, click **📥 Import Ontology**.

2. **Source file \*** — click the field to open the **file browser** and select
   your `.owl` / `.ttl` / `.rdf` / `.xml` file.

3. **Auto-read the metadata.** Click **🔍 Read prefix, URI & imports from file**.
   SWOWL inspects the file and automatically fills in:
   - the **Prefix** and **Namespace (base URI)**,
   - the **Name** (only if you left it empty), and
   - the **Imported namespaces** section (referenced namespaces + declared
     `owl:imports`, each with a suggested prefix).

   *This step is optional — you can type every field by hand — but it is the
   easiest and safest way to fill the form correctly.*

4. **Prefix** — the display prefix for the imported entities (auto-filled by the
   🔍 step; editable).

5. **Namespace (base URI) \*** — the base IRI (auto-detected by 🔍, or type it
   manually).

6. **Imported namespaces** *(optional)* — review the `prefix → namespace` pairs
   pre-filled from the file; add/edit/remove as needed. Each one controls how
   entities coming from another ontology are displayed (contextual prefix).

7. **Name \*** — the name of the SWOWL `.json` file that will be created from the
   imported source (e.g. `MyOntology` → `MyOntology.json`).

8. **Directory \*** — click the field to choose the destination folder for that
   `.json` file.

9. **Import it.** Click **Import & Register**. SWOWL converts the source file
   into a SWOWL `.json` ontology, registers it, and:
   - if **Connect immediately** is ticked (default), connects to it straight away;
   - if you untick it, the ontology is imported and registered but left
     disconnected.

10. **Explore.** Once connected, browse the imported model through the editing
    tabs and the **Views** tab (hyperbolic tree, treemap, network graph).

> **Required to proceed:** Source file, Name, Directory and Namespace (base URI).
> Use **🔍** to auto-detect the URI, or enter it manually; the wizard warns you
> if a required field is missing.

---

## After connecting

- The connected ontology is shown with a green **●** in the registry and in the
  top-bar ontology switcher; you can switch the active ontology at any time.
- Already have a SWOWL `.json` file (e.g. exported earlier)? Use **📂 Load
  Ontology** instead — same idea, with a **🔍** peek button to auto-fill the
  fields.
- Need the W3C reference vocabularies (RDF, RDFS, OWL, SKOS)? Use **Fetch W3C
  Ontologies**.

For the full, source-derived specifications of every behaviour, see the
`requirements/` (EN) and `exigences/` (FR) folders — in particular
`Ontologies.md`.
