# Docker Compose za lokalni razvoj

## Kontekst in problem

Sistem sestavljajo API, Angular odjemalec in PostgreSQL. Vsi razvijalci potrebujejo enako okolje, zagon pa mora biti enostaven. Kako lokalno zagnati vse komponente?

## Obravnavane možnosti

* Ročna namestitev vseh komponent na računalnik
* Docker Compose
* Kubernetes (npr. minikube)

## Odločitev

Izbrana možnost: "Docker Compose", ker en ukaz (`docker compose up`) zažene celoten sistem. Kubernetes je za ta obseg projekta pretirano zapleten.

### Posledice

* Dobro, ker je okolje ponovljivo in se hitro zažene.
* Dobro, ker ni treba lokalno nameščati baze.
* Slabo, ker je potreben Docker.
* Slabo, ker Compose ni primeren za produkcijo z večjo obremenitvijo.
