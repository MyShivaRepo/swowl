"""
sword_serializer.py — Export des règles SWRL au format textuel SWORD
Syntaxe :
    rule <id>
    if <atom> and <atom> ...
    then <atom>.

    rule <id>
    if ...
    then
        (if ... then ...)
        ...
"""
from owl_model import (
    OWLOntology, SWRLRule,
    SWRLTypeAtom, SWRLPropertyAtom, SWRLEqualityAtom,
    SWRLNAFBlock, SWRLConditional,
)


def _var(v: str) -> str:
    """Préfixe ? si nécessaire (sauf si déjà là ou si wildcard ?_)."""
    if not v:
        return "?_"
    return v if v.startswith("?") else f"?{v}"


def _atom_to_sword(atom, inner_indent: str = "") -> str:
    t = getattr(atom, "type", None)

    if t == "type_atom":
        return f"{_var(atom.var)} is a {atom.class_id}"

    if t == "property_atom":
        return f"{_var(atom.subject)} {atom.property_id} {_var(atom.object)}"

    if t == "equality_atom":
        return f"{_var(atom.var)} {atom.operator or '='} {atom.value}"

    if t == "naf_block":
        atoms = atom.atoms or []
        if not atoms:
            return "NAF()"
        # premier atome en ligne, suivants indentés
        first = _atom_to_sword(atoms[0], inner_indent)
        lines = [f"NAF({first}"]
        for a in atoms[1:]:
            lines.append(f"{inner_indent}    and {_atom_to_sword(a, inner_indent + '    ')}")
        lines[-1] += ")"
        return "\n".join(lines)

    if t == "conditional":
        cond_parts = [_atom_to_sword(a) for a in (atom.condition or [])]
        cons_parts = [_atom_to_sword(a) for a in (atom.consequent or [])]
        cond_str = " and ".join(cond_parts)
        cons_str = " and ".join(cons_parts)
        return f"(if {cond_str} then {cons_str})"

    return "[unknown atom]"


def _rule_to_sword(rule: SWRLRule) -> str:
    lines = [f"rule {rule.id}"]

    # ── Body ────────────────────────────────────────────────────
    body = rule.body or []
    if body:
        body_strs = [_atom_to_sword(a, "    ") for a in body]
        lines.append("if " + ("\n    and ".join(body_strs)))

    # ── Head ────────────────────────────────────────────────────
    head = rule.head or []
    if head:
        if len(head) == 1 and getattr(head[0], "type", None) != "conditional":
            lines.append(f"then {_atom_to_sword(head[0])}")
        else:
            lines.append("then")
            for a in head:
                lines.append(f"    {_atom_to_sword(a, '    ')}")

    return "\n".join(lines)


def export_sword(onto: OWLOntology) -> bytes:
    rules = onto.swrl_rules or []
    if not rules:
        return b"// No SWRL rules\n"
    parts = [_rule_to_sword(r) for r in rules]
    return (".\n\n".join(parts) + ".").encode("utf-8")
