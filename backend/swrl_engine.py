"""
swrl_engine.py — Moteur SWRL : forward chaining basique sur individus nommés

Atomes supportés :
  - ClassAtom       : vérifie qu'un individu est instance d'une classe
  - ObjectPropertyAtom  : vérifie une assertion de propriété objet
  - DataPropertyAtom    : vérifie une assertion de propriété donnée
  - BuiltinAtom     : swrlb:greaterThan, lessThan, equal, notEqual,
                      greaterThanOrEqual, lessThanOrEqual, add, subtract,
                      multiply, matches, stringConcat

Le moteur applique les règles actives et retourne les conséquences
sous forme de texte lisible (pas d'exécution réelle sur le graphe —
c'est une simulation explicative).
"""
from __future__ import annotations
import re
from typing import Any, Dict, List, Optional, Set
from owl_model import (
    OWLOntology, SWRLRule, SWRLConsequence,
    SWRLClassAtom, SWRLObjectPropertyAtom, SWRLDataPropertyAtom, SWRLBuiltinAtom,
)


Bindings = Dict[str, Any]   # variable_name → valeur


class SWRLEngine:

    def __init__(self, onto: OWLOntology):
        self.onto = onto
        self._build_indexes()

    def _build_indexes(self):
        onto = self.onto
        # class_id → set of individual_ids
        self.class_members: Dict[str, Set[str]] = {}
        for cls in onto.classes:
            self.class_members[cls.id] = set()

        # (prop_id, src_id) → set of target_ids
        self.obj_assertions: Dict[tuple, Set[str]] = {}
        # (prop_id, src_id) → list of (value, datatype)
        self.data_assertions: Dict[tuple, List[tuple]] = {}

        for ind in onto.individuals:
            for t in ind.types:
                self.class_members.setdefault(t, set()).add(ind.id)
            for oa in ind.objectAssertions:
                key = (oa.property, ind.id)
                self.obj_assertions.setdefault(key, set()).add(oa.target)
            for da in ind.dataAssertions:
                key = (da.property, ind.id)
                self.data_assertions.setdefault(key, []).append((da.value, da.datatype))

        self.all_individuals = {ind.id for ind in onto.individuals}

    # ── Évaluation d'un atome ─────────────────────────────────

    def _eval_atom(self, atom, bindings: Bindings) -> List[Bindings]:
        """
        Évalue un atome avec les bindings actuels.
        Retourne une liste de bindings étendus (peut être vide = échec).
        """
        def resolve(arg: str) -> Optional[Any]:
            if arg.startswith("?"):
                return bindings.get(arg[1:])
            return arg

        def bind(bindings: Bindings, var: str, val: Any) -> Optional[Bindings]:
            if var.startswith("?"):
                name = var[1:]
                if name in bindings:
                    return bindings if bindings[name] == val else None
                return {**bindings, name: val}
            return bindings if var == val else None

        # ── ClassAtom ────────────────────────────────────────
        if isinstance(atom, SWRLClassAtom):
            var = atom.variable
            cls = atom.class_iri
            resolved = resolve(f"?{var}")
            if resolved is not None:
                # Variable déjà liée — vérifier appartenance
                members = self.class_members.get(cls, set())
                return [bindings] if resolved in members else []
            else:
                # Variable libre — itérer sur tous les membres
                results = []
                for member in self.class_members.get(cls, set()):
                    new_b = bind(bindings, f"?{var}", member)
                    if new_b is not None:
                        results.append(new_b)
                return results

        # ── ObjectPropertyAtom ───────────────────────────────
        if isinstance(atom, SWRLObjectPropertyAtom):
            prop = atom.property_iri
            arg1, arg2 = atom.arg1, atom.arg2
            v1, v2 = resolve(arg1), resolve(arg2)

            results = []
            if v1 is not None and v2 is not None:
                # Les deux liés
                if v2 in self.obj_assertions.get((prop, v1), set()):
                    results.append(bindings)
            elif v1 is not None:
                # arg1 lié, arg2 libre
                for target in self.obj_assertions.get((prop, v1), set()):
                    new_b = bind(bindings, arg2, target)
                    if new_b is not None:
                        results.append(new_b)
            elif v2 is not None:
                # arg2 lié, arg1 libre — parcourir toutes les assertions
                for (p, src), targets in self.obj_assertions.items():
                    if p == prop and v2 in targets:
                        new_b = bind(bindings, arg1, src)
                        if new_b is not None:
                            results.append(new_b)
            else:
                # Les deux libres
                for (p, src), targets in self.obj_assertions.items():
                    if p == prop:
                        for target in targets:
                            b1 = bind(bindings, arg1, src)
                            if b1 is not None:
                                b2 = bind(b1, arg2, target)
                                if b2 is not None:
                                    results.append(b2)
            return results

        # ── DataPropertyAtom ─────────────────────────────────
        if isinstance(atom, SWRLDataPropertyAtom):
            prop = atom.property_iri
            arg1, arg2 = atom.arg1, atom.arg2
            v1 = resolve(arg1)

            results = []
            if v1 is not None:
                for val, dtype in self.data_assertions.get((prop, v1), []):
                    new_b = bind(bindings, arg2, _coerce(val, dtype))
                    if new_b is not None:
                        results.append(new_b)
            else:
                for (p, src), vals in self.data_assertions.items():
                    if p == prop:
                        b1 = bind(bindings, arg1, src)
                        if b1 is not None:
                            for val, dtype in vals:
                                b2 = bind(b1, arg2, _coerce(val, dtype))
                                if b2 is not None:
                                    results.append(b2)
            return results

        # ── BuiltinAtom ──────────────────────────────────────
        if isinstance(atom, SWRLBuiltinAtom):
            resolved_args = [_coerce_arg(a, bindings) for a in atom.args]
            if any(a is None for a in resolved_args):
                return []   # args non liés → ne peut pas évaluer
            success = _eval_builtin(atom.builtin, resolved_args)
            return [bindings] if success else []

        return []

    # ── Application d'une règle ───────────────────────────────

    def _apply_rule(self, rule: SWRLRule) -> List[str]:
        """
        Applique une règle et retourne une liste de descriptions des conséquences.
        """
        if not rule.enabled or not rule.body:
            return []

        # Évaluation forward chaining : partir d'un seul binding vide
        current_bindings: List[Bindings] = [{}]

        for atom in rule.body:
            next_bindings = []
            for b in current_bindings:
                next_bindings.extend(self._eval_atom(atom, b))
            current_bindings = next_bindings
            if not current_bindings:
                break

        consequences = []
        for b in current_bindings:
            head_descs = []
            for atom in rule.head:
                desc = _describe_head_atom(atom, b)
                if desc:
                    head_descs.append(desc)
            if head_descs:
                body_desc = _describe_bindings(b)
                consequences.append(
                    f"[{rule.label or rule.id}] Avec {body_desc} : {' ∧ '.join(head_descs)}"
                )

        return consequences

    # ── Point d'entrée ────────────────────────────────────────

    def run(self) -> List[SWRLConsequence]:
        results = []
        for rule in self.onto.swrl_rules:
            consequences = self._apply_rule(rule)
            for c in consequences:
                results.append(SWRLConsequence(
                    rule_id=rule.id,
                    rule_label=rule.label or rule.id,
                    consequence=c,
                ))
        return results


# ── Helpers ──────────────────────────────────────────────────

def _coerce(val: str, dtype: str) -> Any:
    """Convertit une valeur RDF en type Python."""
    try:
        if "integer" in dtype or "int" in dtype:
            return int(val)
        if "decimal" in dtype or "float" in dtype or "double" in dtype:
            return float(val)
        if "boolean" in dtype:
            return val.lower() in ("true", "1")
    except (ValueError, TypeError):
        pass
    return val


def _coerce_arg(arg: str, bindings: Bindings) -> Any:
    if arg.startswith("?"):
        return bindings.get(arg[1:])
    # Littéral numérique
    try:
        if "." in arg:
            return float(arg)
        return int(arg)
    except ValueError:
        pass
    return arg.strip("\"'")


def _eval_builtin(builtin: str, args: List[Any]) -> bool:
    """Évalue un builtin SWRL et retourne True/False."""
    b = builtin.replace("swrlb:", "")
    try:
        if b == "equal":              return args[0] == args[1]
        if b == "notEqual":           return args[0] != args[1]
        if b == "greaterThan":        return args[0] >  args[1]
        if b == "greaterThanOrEqual": return args[0] >= args[1]
        if b == "lessThan":           return args[0] <  args[1]
        if b == "lessThanOrEqual":    return args[0] <= args[1]
        if b == "add":      return True   # résultat en arg[0] = arg[1]+arg[2]
        if b == "subtract": return True
        if b == "multiply": return True
        if b == "divide":   return True
        if b == "matches":
            return bool(re.search(str(args[1]), str(args[0])))
        if b == "contains":
            return str(args[1]) in str(args[0])
        if b == "stringConcat":
            return True
        if b == "before":
            return str(args[0]) < str(args[1])
        if b == "after":
            return str(args[0]) > str(args[1])
    except (TypeError, IndexError):
        pass
    return False


def _describe_head_atom(atom, bindings: Bindings) -> str:
    def res(arg): return bindings.get(arg.lstrip("?"), arg) if arg.startswith("?") else arg

    if isinstance(atom, SWRLClassAtom):
        return f"{res('?' + atom.variable)} rdf:type {atom.class_iri}"
    if isinstance(atom, SWRLObjectPropertyAtom):
        return f"{atom.property_iri}({res(atom.arg1)}, {res(atom.arg2)})"
    if isinstance(atom, SWRLDataPropertyAtom):
        return f"{atom.property_iri}({res(atom.arg1)}, {res(atom.arg2)})"
    return ""


def _describe_bindings(b: Bindings) -> str:
    return ", ".join(f"?{k}={v}" for k, v in b.items())
