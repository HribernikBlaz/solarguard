# PostgreSQL namesto NoSQL

* Status: sprejeto
* Datum: 2026-10-27

## Kontekst in problem

Podatki so močno relacijski (sistem, naprava, meritev, alarm, servisni nalog). Potrebujemo povezave med entitetami, konsistentnost in učinkovite poizvedbe po časovnih vrstah meritev.

## Obravnavane alternative

* PostgreSQL
* MongoDB (dokumentna baza)
* SQL Server

## Odločitev

Izbrano: "PostgreSQL", ker podpira relacije, tuje ključe in transakcije, meritve pa lahko učinkovito shranimo z indeksom po napravi in času. Je brezplačen in ima dobro podporo v EF Core.

## Posledice

* Dobro: konsistentni podatki, enostavno povezovanje entitet, en sam brezplačen sistem za vse podatke.
* Slabo: sprememba sheme zahteva migracije; pri zelo velikem številu meritev bo morda potrebna particija ali posebna razširitev za časovne vrste.
