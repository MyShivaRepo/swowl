"""
inference_engine.py — Moteur d'inférence OWL basique (sans raisonneur externe)

Inférences implémentées :
  1. Fermeture transitive de subClassOf
  2. Héritage de restrictions par sous-classes
  3. Propagation domain/range → inférence de types sur individus
  4. Transitivité de propriétés ObjectProperty
  5. Symétrie de propriétés
  6. Réflexivité de propriétés
  7. Chaînes de propriétés (propertyChainAxiom)
  8. Équivalence de classes → double subClassOf
  9. Inversion de propriétés (inverseOf)
 10. Détection de violations (disjonction, domaine/range, cardinalité)
"""
from __future__ import annotations
from collections import defaultdict
from typing import Dict, List, Set, Tuple

from owl_model import (
    OWLOntology, InferenceResult,
    InheritedRestriction, InferredType, OWLViolation,
    InferredInverseProperty, InferredInverseRestriction,
    SomeValuesFrom, AllValuesFrom, HasValue,
    ExactCardinality, MinCardinality, MaxCardinality,
)


class InferenceEngine:

    def __init__(self, onto: OWLOntology, imported: dict | None = None):
        self.onto = onto
        # Entités importées (schéma réutilisé par une ontologie de données) :
        # dict {classes, object_properties, datatype_properties, individuals} de
        # modèles OWL*, fusionnées dans les index pour que les inférences/violations
        # tiennent compte des classes/propriétés importées.
        self._imported = imported or {}
        self._build_indexes()

    def _build_indexes(self):
        onto = self.onto
        imp = self._imported
        all_classes    = list(onto.classes)             + list(imp.get("classes")             or [])
        all_ops        = list(onto.object_properties)   + list(imp.get("object_properties")   or [])
        all_dps        = list(onto.datatype_properties) + list(imp.get("datatype_properties") or [])
        all_individuals = list(onto.individuals)         + list(imp.get("individuals")          or [])
        # class_id → set of direct superclasses
        self.direct_supers: Dict[str, Set[str]] = defaultdict(set)
        # class_id → set of restrictions (direct)
        self.direct_restrictions: Dict[str, List] = defaultdict(list)
        # class_id → set of disjoint classes
        self.disjoint: Dict[str, Set[str]] = defaultdict(set)

        for cls in all_classes:
            for expr in cls.subClassOf:
                if isinstance(expr, str):
                    self.direct_supers[cls.id].add(expr)
                else:
                    self.direct_restrictions[cls.id].append(expr)
            for expr in cls.equivalentClass:
                if isinstance(expr, str):
                    # A ≡ B → A ⊑ B et B ⊑ A
                    self.direct_supers[cls.id].add(expr)
                    self.direct_supers[expr].add(cls.id)
            for dj in cls.disjointWith:
                self.disjoint[cls.id].add(dj)
                self.disjoint[dj].add(cls.id)

        # prop_id → {domain, range, characteristics, inverseOf, chain}
        self.op_index: Dict[str, dict] = {}
        for prop in all_ops:
            self.op_index[prop.id] = {
                "domain": set(prop.domain),
                "range":  set(prop.range),
                "chars":  prop.characteristics,
                "inverse": prop.inverseOf,
                "chains": prop.propertyChainAxiom,
                "subPropertyOf": set(prop.subPropertyOf),
            }

        self.dp_index: Dict[str, dict] = {}
        for prop in all_dps:
            self.dp_index[prop.id] = {
                "domain": set(prop.domain),
                "range":  set(prop.range),
                "functional": prop.functional,
            }

        # individual_id → {types, object_assertions[(prop,target)], data_assertions}
        self.ind_index: Dict[str, dict] = {}
        for ind in all_individuals:
            self.ind_index[ind.id] = {
                "types": set(ind.types),
                "obj":   [(a.property, a.target) for a in ind.objectAssertions],
                "data":  [(a.property, a.value, a.datatype) for a in ind.dataAssertions],
                "sameAs": set(ind.sameAs),
                "diffFrom": set(ind.differentFrom),
            }

    # ── 1. Fermeture transitive subClassOf ───────────────────

    def compute_subclass_closure(self) -> Dict[str, Set[str]]:
        """Retourne pour chaque classe l'ensemble de TOUS ses ancêtres."""
        all_classes = ({cls.id for cls in self.onto.classes}
                       | {c.id for c in (self._imported.get("classes") or [])})
        closure: Dict[str, Set[str]] = {c: set() for c in all_classes}

        def ancestors(cls_id: str, visited: Set[str]) -> Set[str]:
            if cls_id in visited:
                return set()
            visited.add(cls_id)
            result = set()
            for sup in self.direct_supers.get(cls_id, set()):
                result.add(sup)
                result |= ancestors(sup, visited)
            return result

        for cls_id in all_classes:
            closure[cls_id] = ancestors(cls_id, set())

        return closure

    # ── 2. Héritage de restrictions ──────────────────────────

    def compute_inherited_restrictions(
        self, closure: Dict[str, Set[str]]
    ) -> List[InheritedRestriction]:
        result = []
        for cls_id, ancestors in closure.items():
            for anc in ancestors:
                for restr in self.direct_restrictions.get(anc, []):
                    result.append(InheritedRestriction(
                        class_id=cls_id,
                        restriction=restr.model_dump(),
                        inherited_from=anc,
                    ))
        return result

    # ── 3. Inférence de types via domain/range ───────────────

    def compute_inferred_types(self) -> List[InferredType]:
        result = []
        for ind_id, ind in self.ind_index.items():
            for prop_id, target in ind["obj"]:
                if prop_id in self.op_index:
                    info = self.op_index[prop_id]
                    # domain → sujet est instance du domaine
                    for d in info["domain"]:
                        if d not in ind["types"]:
                            result.append(InferredType(
                                individual_id=ind_id,
                                inferred_type=d,
                                reason=f"{ind_id} utilise {prop_id} dont le domaine est {d}",
                            ))
                    # range → objet est instance du range
                    if target in self.ind_index:
                        for r in info["range"]:
                            if r not in self.ind_index[target]["types"]:
                                result.append(InferredType(
                                    individual_id=target,
                                    inferred_type=r,
                                    reason=f"{target} est objet de {prop_id} dont le range est {r}",
                                ))
        return result

    # ── 4. Symétrie ──────────────────────────────────────────

    def compute_symmetric_assertions(self) -> List[dict]:
        result = []
        sym_props = {
            p for p, info in self.op_index.items()
            if info["chars"].symmetric
        }
        for ind_id, ind in self.ind_index.items():
            for prop_id, target in ind["obj"]:
                if prop_id in sym_props:
                    result.append({
                        "individual": target,
                        "property": prop_id,
                        "target": ind_id,
                        "reason": f"Symétrie de {prop_id} : {ind_id}→{target} implique {target}→{ind_id}",
                    })
        return result

    # ── 5. Transitivité ──────────────────────────────────────

    def compute_transitive_assertions(self) -> List[dict]:
        result = []
        trans_props = {
            p for p, info in self.op_index.items()
            if info["chars"].transitive
        }
        # Construire index (prop, source) → {targets}
        prop_graph: Dict[str, Dict[str, Set[str]]] = defaultdict(lambda: defaultdict(set))
        for ind_id, ind in self.ind_index.items():
            for prop_id, target in ind["obj"]:
                if prop_id in trans_props:
                    prop_graph[prop_id][ind_id].add(target)

        for prop_id in trans_props:
            graph = prop_graph[prop_id]
            # Fermeture transitive
            def reachable(src: str, visited: Set[str]) -> Set[str]:
                if src in visited:
                    return set()
                visited.add(src)
                targets = graph.get(src, set())
                all_targets = set(targets)
                for t in targets:
                    all_targets |= reachable(t, visited)
                return all_targets

            for src in list(graph.keys()):
                direct = graph.get(src, set())
                all_reach = reachable(src, set())
                for t in all_reach - direct:
                    result.append({
                        "individual": src,
                        "property": prop_id,
                        "target": t,
                        "reason": f"Transitivité de {prop_id}",
                    })
        return result

    # ── 6. Réflexivité ───────────────────────────────────────

    def compute_reflexive_assertions(self) -> List[dict]:
        result = []
        reflex_props = {
            p for p, info in self.op_index.items()
            if info["chars"].reflexive
        }
        for ind_id in self.ind_index:
            for prop_id in reflex_props:
                result.append({
                    "individual": ind_id,
                    "property": prop_id,
                    "target": ind_id,
                    "reason": f"Réflexivité de {prop_id}",
                })
        return result

    # ── 7. Chaînes de propriétés ─────────────────────────────

    def compute_chain_assertions(self) -> List[dict]:
        result = []
        # Index (prop, src) → targets
        prop_pairs: Dict[str, List[Tuple[str, str]]] = defaultdict(list)
        for ind_id, ind in self.ind_index.items():
            for prop_id, target in ind["obj"]:
                prop_pairs[prop_id].append((ind_id, target))

        for prop_id, info in self.op_index.items():
            for chain in info["chains"]:
                c = chain.chain
                if len(c) < 2:
                    continue
                # Pour une chaîne [p1, p2] : p1(a,b) ∧ p2(b,c) → prop(a,c)
                # On généralise pour chaînes de longueur arbitraire
                def follow_chain(chain_props: List[str], start: str) -> Set[str]:
                    current = {start}
                    for cp in chain_props:
                        next_set = set()
                        for src in current:
                            for s, t in prop_pairs.get(cp, []):
                                if s == src:
                                    next_set.add(t)
                        current = next_set
                    return current

                for ind_id in self.ind_index:
                    targets = follow_chain(c, ind_id)
                    for t in targets:
                        result.append({
                            "individual": ind_id,
                            "property": prop_id,
                            "target": t,
                            "reason": f"Chaîne {' ∘ '.join(c)} → {prop_id}",
                        })
        return result

    # ── 8. Inversion de propriétés ───────────────────────────

    def compute_inverse_assertions(self) -> List[dict]:
        result = []
        for prop_id, info in self.op_index.items():
            if info["inverse"]:
                inv = info["inverse"]
                for ind_id, ind in self.ind_index.items():
                    for pid, target in ind["obj"]:
                        if pid == prop_id:
                            result.append({
                                "individual": target,
                                "property": inv,
                                "target": ind_id,
                                "reason": f"Inverse : {inv} = inverseOf({prop_id})",
                            })
        return result

    # ── 9. Détection de violations ───────────────────────────

    def detect_violations(self, closure: Dict[str, Set[str]]) -> List[OWLViolation]:
        violations = []

        # Vérifier disjonction entre classes partagées par un individu
        for ind_id, ind in self.ind_index.items():
            types = ind["types"]
            # Inclure les types inférés via fermeture
            all_types: Set[str] = set(types)
            for t in types:
                all_types |= closure.get(t, set())

            for t1 in all_types:
                for t2 in self.disjoint.get(t1, set()):
                    if t2 in all_types:
                        violations.append(OWLViolation(
                            severity="error",
                            entity=ind_id,
                            message=f"Violation de disjonction : {ind_id} est à la fois {t1} et {t2} (classes disjointes)",
                        ))

        # Vérifier que les domaines/ranges sont cohérents
        for prop_id, info in self.op_index.items():
            for ind_id, ind in self.ind_index.items():
                for pid, target in ind["obj"]:
                    if pid != prop_id:
                        continue
                    # Vérifier domaine
                    for d in info["domain"]:
                        ind_types_and_ancestors = ind["types"] | {
                            a for t in ind["types"] for a in closure.get(t, set())
                        }
                        if d not in ind_types_and_ancestors and d != "owl:Thing":
                            violations.append(OWLViolation(
                                severity="warning",
                                entity=ind_id,
                                message=f"{ind_id} utilise {prop_id} (domaine={d}) mais n'est pas de type {d}",
                            ))
                    # Vérifier propriété fonctionnelle
                    if info["chars"].functional:
                        targets = [t for p, t in ind["obj"] if p == prop_id]
                        if len(targets) > 1:
                            violations.append(OWLViolation(
                                severity="error",
                                entity=ind_id,
                                message=f"Violation fonctionnelle : {ind_id} a {len(targets)} valeurs pour {prop_id} (propriété fonctionnelle)",
                            ))
                    # Vérifier propriété asymétrique
                    if info["chars"].asymmetric:
                        if any(p == prop_id and t == ind_id
                               for p, t in self.ind_index.get(target, {}).get("obj", [])):
                            violations.append(OWLViolation(
                                severity="error",
                                entity=ind_id,
                                message=f"Violation d'asymétrie : {prop_id}({ind_id},{target}) et {prop_id}({target},{ind_id}) coexistent",
                            ))
                    # Vérifier propriété irréflexive
                    if info["chars"].irreflexive and target == ind_id:
                        violations.append(OWLViolation(
                            severity="error",
                            entity=ind_id,
                            message=f"Violation d'irréflexivité : {prop_id}({ind_id},{ind_id})",
                        ))

        # Vérifier cardinalités exactes
        for cls in self.onto.classes:
            for expr in cls.subClassOf + cls.equivalentClass:
                if isinstance(expr, ExactCardinality):
                    for ind_id, ind in self.ind_index.items():
                        if cls.id in ind["types"]:
                            count = sum(1 for p, _ in ind["obj"] if p == expr.property)
                            if count != expr.cardinality:
                                violations.append(OWLViolation(
                                    severity="warning",
                                    entity=ind_id,
                                    message=f"Cardinalité exacte : {ind_id} (type {cls.id}) devrait avoir exactement {expr.cardinality} valeur(s) pour {expr.property}, en a {count}",
                                ))

        # Vérifier sameAs + differentFrom contradiction
        for ind_id, ind in self.ind_index.items():
            for same in ind["sameAs"]:
                if same in ind["diffFrom"]:
                    violations.append(OWLViolation(
                        severity="error",
                        entity=ind_id,
                        message=f"Contradiction : {ind_id} sameAs et differentFrom {same} simultanément",
                    ))

        return violations

    # ── 10. Restrictions inverses au niveau classe ───────────

    def compute_inverse_class_restrictions(self) -> list:
        """
        Si C ⊑ ∃prop.D  et  prop inverseOf invProp,
        infère :  D ⊑ ∃invProp.C
        (approximation utile — valide sous hypothèse monde fermé ou pour la navigation)
        """
        result = []

        # Carte bidirectionnelle des inverses déclarés
        inverse_map: dict[str, str] = {}
        for prop_id, info in self.op_index.items():
            if info["inverse"]:
                inverse_map[prop_id] = info["inverse"]
                # symétrie : si A inverseOf B alors B inverseOf A
                if info["inverse"] not in inverse_map:
                    inverse_map[info["inverse"]] = prop_id

        if not inverse_map:
            return result

        seen: set[tuple] = set()  # évite les doublons

        for cls in self.onto.classes:
            for expr in cls.subClassOf:
                if not isinstance(expr, (SomeValuesFrom, AllValuesFrom)):
                    continue
                prop   = expr.property
                filler = expr.filler
                if not filler or not prop or prop not in inverse_map:
                    continue
                inv_prop = inverse_map[prop]

                key = (filler, inv_prop, cls.id)
                if key in seen:
                    continue
                seen.add(key)

                # La restriction inverse est toujours someValuesFrom
                # (allValuesFrom→someValuesFrom est une sur-approximation acceptable)
                inv_restr = SomeValuesFrom(
                    type="someValuesFrom",
                    property=inv_prop,
                    filler=cls.id,
                )
                orig_type = "∀" if isinstance(expr, AllValuesFrom) else "∃"

                result.append(InferredInverseRestriction(
                    class_id=filler,
                    restriction=inv_restr.model_dump(),
                    source_class=cls.id,
                    source_prop=prop,
                    inverse_prop=inv_prop,
                    reason=(
                        f"{cls.id} ⊑ {orig_type}{prop}.{filler} "
                        f"+ {prop} inverseOf {inv_prop} "
                        f"→ {filler} ⊑ ∃{inv_prop}.{cls.id}"
                    ),
                ))

        return result

    # ── 11. Symétrie owl:inverseOf ───────────────────────────

    def compute_inverse_property_symmetry(self) -> list:
        """Si A inverseOf B est déclaré mais pas B inverseOf A, on l'infère."""
        result = []
        declared_inverse = {}
        for prop_id, info in self.op_index.items():
            if info["inverse"]:
                declared_inverse[prop_id] = info["inverse"]
        for prop_id, inv_id in declared_inverse.items():
            if declared_inverse.get(inv_id) != prop_id and inv_id in self.op_index:
                result.append(InferredInverseProperty(
                    property_id=inv_id,
                    inverse_of=prop_id,
                    reason=f"Symétrie owl:inverseOf : {prop_id} inverseOf {inv_id} => {inv_id} inverseOf {prop_id}",
                ))
        return result

    # ── Point d'entrée principal ─────────────────────────────

    def run(self) -> InferenceResult:
        closure        = self.compute_subclass_closure()
        inherited      = self.compute_inherited_restrictions(closure)
        inferred_types = self.compute_inferred_types()
        symmetric      = self.compute_symmetric_assertions()
        transitive     = self.compute_transitive_assertions()
        reflexive      = self.compute_reflexive_assertions()
        chains         = self.compute_chain_assertions()
        inverses       = self.compute_inverse_assertions()
        violations     = self.detect_violations(closure)
        inv_props      = self.compute_inverse_property_symmetry()
        inv_restr      = self.compute_inverse_class_restrictions()

        # Fusionner transitive + reflexive + inverse + symmetric dans chain_assertions
        all_assertions = transitive + reflexive + chains + inverses

        return InferenceResult(
            subclass_closure={k: sorted(v) for k, v in closure.items()},
            inherited_restrictions=inherited,
            inferred_types=inferred_types,
            symmetric_assertions=symmetric,
            transitive_assertions=transitive,
            chain_assertions=all_assertions,
            violations=violations,
            inferred_inverse_properties=inv_props,
            inferred_inverse_restrictions=inv_restr,
        )

    # ── Évaluation d'une règle SWRL (« Run rule ») ───────────────────
    def evaluate_rule(self, rule) -> dict:
        """Évalue une règle SWRL contre les faits (types via clôture des sous-classes,
        assertions objet/data — base + dérivées). Retourne les liaisons de variables
        satisfaisant le corps et les faits inférés par la tête.
        Couvre : type_atom, property_atom (objet & data), equality_atom (comparaisons
        =,!=,>,>=,<,<=), naf_block (négation par échec), conditional (tête conditionnelle).
        """
        import re as _re

        def _attr(a, k, d=None):
            return getattr(a, k, d) if not isinstance(a, dict) else a.get(k, d)
        def _ty(a):
            return _attr(a, 'type')

        closure = self.compute_subclass_closure()
        # Appartenance de type (asserté + ancêtres)
        typed: Dict[str, Set[str]] = {}
        for iid, info in self.ind_index.items():
            ts = set(info["types"])
            for t in list(ts):
                ts |= closure.get(t, set())
            typed[iid] = ts
        _members_cache: Dict[str, Set[str]] = {}
        def members(cls):
            if cls not in _members_cache:
                _members_cache[cls] = {i for i, ts in typed.items() if cls in ts}
            return _members_cache[cls]

        # Faits (s, prop, o) : assertions objet + data unifiées
        facts = []
        for iid, info in self.ind_index.items():
            for (prop, tgt) in info["obj"]:
                facts.append((iid, prop, tgt))
            for (prop, val, _dt) in info["data"]:
                facts.append((iid, prop, val))

        def is_var(x):
            return isinstance(x, str) and x.startswith('?')
        def resolve(x, b):
            return b.get(x, x) if is_var(x) else x
        def _num(x):
            try:
                return float(str(x).strip().strip('"').strip("'"))
            except (ValueError, TypeError):
                return None
        def _const_eq(c, fo):
            c2 = c.strip('"').strip("'") if isinstance(c, str) else c
            fo2 = fo.strip('"').strip("'") if isinstance(fo, str) else fo
            return c2 == fo2 or c == fo
        def _compare(lhs, op, rhs):
            ln, rn = _num(lhs), _num(rhs)
            if ln is not None and rn is not None:
                a, b = ln, rn
            else:
                a = str(lhs).strip('"').strip("'"); b = str(rhs).strip('"').strip("'")
            return {
                '=':  a == b, '!=': a != b, '>': a > b,
                '>=': a >= b, '<': a < b, '<=': a <= b,
            }.get(op, False)

        def eval_atoms(atoms, bindings):
            for atom in (atoms or []):
                bindings = eval_atom(atom, bindings)
                if not bindings:
                    break
            return bindings

        def eval_atom(atom, bindings):
            ty = _ty(atom)
            out = []
            if ty == "type_atom":
                var, cls = _attr(atom, 'var', ''), _attr(atom, 'class_id', '')
                if not cls:
                    return bindings
                for b in bindings:
                    if is_var(var):
                        if var in b:
                            if cls in typed.get(b[var], set()):
                                out.append(b)
                        else:
                            for i in members(cls):
                                nb = dict(b); nb[var] = i; out.append(nb)
                    else:
                        if cls in typed.get(var, set()):
                            out.append(b)
            elif ty == "property_atom":
                subj = _attr(atom, 'subject', ''); prop = _attr(atom, 'property_id', '')
                obj  = _attr(atom, 'object', '?_'); wildcard = (obj == "?_")
                for b in bindings:
                    for (fs, fp, fo) in facts:
                        if fp != prop:
                            continue
                        nb = dict(b)
                        # sujet
                        if is_var(subj):
                            if subj in nb:
                                if nb[subj] != fs: continue
                            else:
                                nb[subj] = fs
                        elif subj != fs:
                            continue
                        # objet
                        if wildcard:
                            pass
                        elif is_var(obj):
                            if obj in nb:
                                if nb[obj] != fo: continue
                            else:
                                nb[obj] = fo
                        elif not _const_eq(obj, fo):
                            continue
                        out.append(nb)
            elif ty == "equality_atom":
                var = _attr(atom, 'var', ''); op = _attr(atom, 'operator', '=')
                val = _attr(atom, 'value', '')
                for b in bindings:
                    lhs, rhs = resolve(var, b), resolve(val, b)
                    if is_var(lhs) or is_var(rhs):   # variable non liée → indécidable
                        continue
                    if _compare(lhs, op, rhs):
                        out.append(b)
            elif ty == "naf_block":
                inner = _attr(atom, 'atoms', []) or []
                for b in bindings:
                    if not eval_atoms(inner, [b]):   # NAF : garder si non satisfiable
                        out.append(b)
            else:
                out = bindings   # atome inconnu : ne filtre pas
            return out

        body_bindings = eval_atoms(rule.body, [{}])

        inferred = []
        seen = set()
        def add_inf(kind, subject, prop=None, value=None):
            if is_var(subject) or (value is not None and is_var(value)):
                return
            if kind == "type":
                already = value in typed.get(subject, set())
                key = ("type", subject, value)
            else:
                already = (subject, prop, value) in facts
                key = ("obj", subject, prop, value)
            if key in seen:
                return
            seen.add(key)
            inferred.append({"kind": kind, "subject": subject,
                             "property": prop, "value": value, "already": already})

        def apply_head(atoms, bindings):
            for atom in (atoms or []):
                ty = _ty(atom)
                if ty == "type_atom":
                    for b in bindings:
                        add_inf("type", resolve(_attr(atom, 'var', ''), b),
                                value=_attr(atom, 'class_id', ''))
                elif ty == "property_atom":
                    for b in bindings:
                        add_inf("object", resolve(_attr(atom, 'subject', ''), b),
                                prop=_attr(atom, 'property_id', ''),
                                value=resolve(_attr(atom, 'object', ''), b))
                elif ty == "conditional":
                    cond = _attr(atom, 'condition', []); cons = _attr(atom, 'consequent', [])
                    for b in bindings:
                        if eval_atoms(cond, [b]):
                            apply_head(cons, [b])
                # equality_atom / naf_block en tête : pas de fait produit

        apply_head(rule.head, body_bindings)

        return {
            "rule_id": getattr(rule, 'id', ''),
            "match_count": len(body_bindings),
            "bindings": [dict(b) for b in body_bindings],
            "inferred": inferred,
        }
