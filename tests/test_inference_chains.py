#!/usr/bin/env python3
"""Non-régression #13 : une chaîne de propriétés doit pouvoir passer par un fait
inféré (ici l'inverse d'une propriété assertée) dans /api/inferences, comme dans
la fiche individu. Test en mémoire, sans serveur ni registre.

Usage : python tests/test_inference_chains.py
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from owl_model import (OWLOntology, OWLObjectProperty, OWLIndividual,
                       ObjectPropertyAssertion, PropertyChainAxiom)
from inference_engine import InferenceEngine

def op(pid, **kw):
    return OWLObjectProperty(id=pid, **kw)

def ind(iid, *asserts):
    return OWLIndividual(id=iid, objectAssertions=[
        ObjectPropertyAssertion(property=p, target=t) for p, t in asserts])

onto = OWLOntology(id="http://example.org/t", name="t", object_properties=[
    op("hasInput"), op("hasOutput", inverseOf="outputOf"), op("outputOf"),
    op("hasOutcome"),
    op("leadsTo", propertyChainAxiom=[PropertyChainAxiom(chain=["hasInput", "outputOf", "hasOutcome"])]),
], individuals=[
    ind("a", ("hasInput", "b")),
    ind("c", ("hasOutput", "b"), ("hasOutcome", "d")),   # outputOf(b, c) n'est PAS asserté
    ind("b"), ind("d"),
])

res = InferenceEngine(onto).compute_chain_assertions()
got = {(r["individual"], r["property"], r["target"]) for r in res}
ok = ("a", "leadsTo", "d") in got
print(("✅" if ok else "❌"), "a leadsTo d via hasInput ∘ outputOf(inverse inféré) ∘ hasOutcome  [#13]")
print("   chaînes inférées :", sorted(got))
sys.exit(0 if ok else 1)
