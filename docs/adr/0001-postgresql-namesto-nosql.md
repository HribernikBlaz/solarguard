# PostgreSQL namesto NoSQL

## Kontekst in problem

Podatki so močno relacijski (sistem, naprava, meritev, alarm, servisni nalog). Potrebujemo povezave med entitetami, konsistentnost in učinkovite poizvedbe po časovnih vrstah meritev. Katero podatkovno bazo uporabiti?

## Obravnavane možnosti

* PostgreSQL
* MongoDB (dokumentna baza)
* SQL Server

## Odločitev

Izbrana možnost: "PostgreSQL", ker podpira relacije, tuje ključe in transakcije, meritve pa lahko učinkovito shranimo z indeksom po napravi in času. Je brezplačen in ima dobro podporo v EF Core.

### Posledice

* Dobro, ker so podatki konsistentni in je povezovanje entitet enostavno.
* Dobro, ker je en sam brezplačen sistem dovolj za vse podatke.
* Slabo, ker sprememba sheme zahteva migracije.
* Slabo, ker bo pri zelo velikem številu meritev morda potrebna particija ali posebna razširitev za časovne vrste.
