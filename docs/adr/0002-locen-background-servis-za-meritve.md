# Ločen background servis za obdelavo meritev

## Kontekst in problem

Zaznavanje anomalij (primerjava dejanske in pričakovane proizvodnje) je lahko časovno zahtevno. Kje naj poteka obdelava, da ne upočasni odzivov API-ja za uporabnike?

## Obravnavane možnosti

* Obdelava znotraj API zahtevkov
* Ločen background servis (.NET Hosted Service)
* Zunanji sistem za opravila (Hangfire, Quartz)

## Odločitev

Izbrana možnost: "ločen background servis (.NET Hosted Service)", ker obdelavo loči od API klicev in ne zahteva dodatne infrastrukture. Deli isto bazo kot API.

### Posledice

* Dobro, ker API ostane hiter.
* Dobro, ker je obdelavo mogoče neodvisno razvijati in skalirati.
* Slabo, ker je potrebna dodatna komponenta za zagon in spremljanje.
* Slabo, ker ni vgrajenega nadzora opravil, kot ga ponuja Hangfire.
