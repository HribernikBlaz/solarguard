# JWT namesto sejnih piškotkov

* Status: sprejeto
* Datum: 2026-10-27

## Kontekst in problem

Odjemalec je Angular SPA, ki komunicira z API-jem prek REST. Potrebujemo avtentikacijo in avtorizacijo po vlogah (lastnik, serviser, administrator), ki je preprosta za uporabo v odjemalcu in ne zahteva strežniške seje.

## Obravnavane alternative

* JWT (access + refresh token) v Authorization headerju
* Sejni piškotki
* Zunanji ponudnik identitete (OAuth/OpenID Connect)

## Odločitev

Izbrano: "JWT z ASP.NET Core Identity", ker je API brez stanja, ga je lahko skalirati, žeton pa se enostavno doda v Angular interceptorju.

## Posledice

* Dobro: strežnik ne hrani sej, enostavna integracija z Angularjem, vloge so v žetonu.
* Slabo: žetona ni mogoče takoj preklicati (zato kratek čas veljavnosti in refresh token); žeton v odjemalcu je treba zaščititi pred XSS.
