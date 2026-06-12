"""
sword_parser.py — Parser du format textuel SWORD → règles SWRL (inverse de sword_serializer).

Syntaxe gérée :
    rule <id>
    if <atom> and <atom> ...
    then <atom>
    .

    rule <id>
    if ...
    then
        (if <cond> then <cons>)
        (if <cond> then <cons>)
    .

Atomes :
    ?x is a Class            → type_atom
    ?s prop ?o               → property_atom
    ?x = v / ?a > ?b ...     → equality_atom (=, !=, >, >=, <, <=)
    NAF(<atom> and <atom>…)  → naf_block
    (if <cond> then <cons>)  → conditional (head)
"""
import re
from owl_model import (
    SWRLRule,
    SWRLTypeAtom, SWRLPropertyAtom, SWRLEqualityAtom,
    SWRLNAFBlock, SWRLConditional,
)

_OPS = {'=', '!=', '>', '>=', '<', '<='}


def _split_top(s: str, sep: str) -> list:
    """Découpe s sur le mot-séparateur sep (ex. 'and', 'then') à profondeur de
    parenthèses 0. Renvoie la liste des morceaux non vides."""
    parts, buf, depth = [], [], 0
    for tok in s.split(' '):
        if not tok:
            continue
        if depth == 0 and tok == sep:
            parts.append(' '.join(buf).strip())
            buf = []
            continue
        buf.append(tok)
        depth += tok.count('(') - tok.count(')')
    parts.append(' '.join(buf).strip())
    return [p for p in parts if p]


def _split_paren_groups(s: str) -> list:
    """Découpe une chaîne en groupes (...) de niveau supérieur (pour la tête à
    conditionnels multiples). Si pas de parenthèse en tête → un seul atome."""
    s = s.strip()
    if not s.startswith('('):
        return [s]
    groups, depth, start = [], 0, None
    for i, ch in enumerate(s):
        if ch == '(':
            if depth == 0:
                start = i
            depth += 1
        elif ch == ')':
            depth -= 1
            if depth == 0 and start is not None:
                groups.append(s[start:i + 1])
                start = None
    return groups or [s]


def _parse_atom(a: str):
    a = a.strip()

    # NAF(...)
    if a.startswith('NAF(') and a.endswith(')'):
        inner = a[4:-1].strip()
        atoms = [_parse_atom(x) for x in _split_top(inner, 'and')] if inner else []
        return SWRLNAFBlock(atoms=atoms)

    # Conditionnel (if <cond> then <cons>)
    if a.startswith('(if ') and a.endswith(')'):
        inner = a[1:-1].strip()
        if inner.startswith('if '):
            inner = inner[3:]
        parts = _split_top(inner, 'then')
        cond_str = parts[0] if parts else ''
        cons_str = ' then '.join(parts[1:]) if len(parts) > 1 else ''
        cond = [_parse_atom(x) for x in _split_top(cond_str, 'and')]
        cons = [_parse_atom(x) for x in _split_top(cons_str, 'and')]
        return SWRLConditional(condition=cond or [SWRLEqualityAtom()],
                               consequent=cons or [SWRLTypeAtom()])

    # Type atom : "<x> is a <class>"  (classe éventuellement vide)
    m = re.match(r'^(\S+)\s+is a(?:\s+(.*))?$', a)
    if m:
        return SWRLTypeAtom(var=m.group(1), class_id=(m.group(2) or '').strip())

    toks = a.split()
    # Égalité / comparaison : "?x OP value"
    if len(toks) >= 3 and toks[1] in _OPS:
        return SWRLEqualityAtom(var=toks[0], operator=toks[1],
                                value=' '.join(toks[2:]))
    # Propriété : "?s prop ?o"
    if len(toks) >= 3:
        return SWRLPropertyAtom(subject=toks[0], property_id=toks[1], object=toks[2])
    if len(toks) == 2:
        return SWRLPropertyAtom(subject=toks[0], property_id=toks[1], object='?_')
    # Repli : atome non reconnu → type atom vide
    return SWRLTypeAtom(var=(toks[0] if toks else ''), class_id='')


def parse_sword(text: str) -> list:
    """Parse un fichier SWORD → liste de SWRLRule."""
    rules = []
    # Découpe en blocs commençant par "rule <id>"
    for block in re.split(r'(?m)^\s*rule\s+', text):
        block = block.strip()
        if not block or block.startswith('//'):
            continue
        nl = block.find('\n')
        rid = (block if nl == -1 else block[:nl]).strip().rstrip('.').strip()
        rest = '' if nl == -1 else block[nl + 1:]
        if not rid:
            continue

        s = re.sub(r'\s+', ' ', rest).strip().rstrip('.').strip()
        if s.startswith('if '):
            s = s[3:]

        body_atoms, head_atoms = [], []
        parts = _split_top(s, 'then')
        if len(parts) >= 2:
            body_str = parts[0]
            head_str = ' then '.join(parts[1:])
            body_atoms = [_parse_atom(x) for x in _split_top(body_str, 'and')]
            head_atoms = [_parse_atom(x) for x in _split_paren_groups(head_str)]
        elif s:
            # Pas de 'then' → tout est corps (règle incomplète)
            body_atoms = [_parse_atom(x) for x in _split_top(s, 'and')]

        rules.append(SWRLRule(id=rid, body=body_atoms, head=head_atoms))
    return rules
