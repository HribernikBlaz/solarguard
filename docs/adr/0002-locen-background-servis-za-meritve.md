# Ločen background servis za obdelavo meritev

* Status: sprejeto
* Datum: 2026-10-27

## Kontekst in problem

Zaznavanje anomalij (primerjava dejanske in pričakovane proizvodnje) je lahko časovno zahtevno. Ne sme upočasniti odzivov API-ja za uporabnike.

## Obravnavane alternative

* Obdelava znotraj API zahtevkov
* Ločen background servis (.NET Hosted Service)
* Zunanji sistem za opravila (Hangfire, Quartz)

## Odločitev

Izbrano: "ločen background servis (.NET Hosted Service)", ker obdelavo loči od API klicev in ne zahteva dodatne infrastrukture. Deli isto bazo kot API.

## Posledice

* Dobro: API ostane hiter, obdelavo je mogoče neodvisno razvijati in skalirati.
* Slabo: dodatna komponenta za zagon in spremljanje; ni vgrajenega nadzora opravil, kot ga ponuja Hangfire.
