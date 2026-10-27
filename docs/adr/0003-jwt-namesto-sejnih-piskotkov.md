# JWT namesto sejnih piškotkov

## Kontekst in problem

Odjemalec je Angular SPA, ki komunicira z API-jem prek REST. Potrebujemo avtentikacijo in avtorizacijo po vlogah (lastnik, serviser, administrator), ki je preprosta za uporabo v odjemalcu in ne zahteva strežniške seje. Kako naj odjemalec izkazuje identiteto?

## Obravnavane možnosti

* JWT (access + refresh token) v Authorization headerju
* Sejni piškotki
* Zunanji ponudnik identitete (OAuth/OpenID Connect)

## Odločitev

Izbrana možnost: "JWT z ASP.NET Core Identity", ker je API brez stanja, ga je lahko skalirati, žeton pa se enostavno doda v Angular interceptorju.

### Posledice

* Dobro, ker strežnik ne hrani sej.
* Dobro, ker je integracija z Angularjem enostavna in so vloge v žetonu.
* Slabo, ker žetona ni mogoče takoj preklicati (zato kratek čas veljavnosti in refresh token).
* Slabo, ker je treba žeton v odjemalcu zaščititi pred XSS.
