# Docker Compose za lokalni razvoj

* Status: sprejeto
* Datum: 2026-10-27

## Kontekst in problem

Sistem sestavljajo API, Angular odjemalec in PostgreSQL. Vsi razvijalci potrebujejo enako okolje, zagon pa mora biti enostaven.

## Obravnavane alternative

* Ročna namestitev vseh komponent na računalnik
* Docker Compose
* Kubernetes (npr. minikube)

## Odločitev

Izbrano: "Docker Compose", ker en ukaz (`docker compose up`) zažene celoten sistem. Kubernetes je za ta obseg projekta pretirano zapleten.

## Posledice

* Dobro: ponovljivo okolje, hiter zagon, brez lokalne namestitve baze.
* Slabo: zahteva Docker; Compose ni primeren za produkcijo z večjo obremenitvijo.
