# Solar Guard

Platforma za nadzor proizvodnje sončnih elektrarn v gospodinjstvih. Primerja dejansko proizvodnjo s pričakovano (glede na lokacijo, sezono in vreme), zazna odstopanja (okvara, umazanija, senca) in samodejno ustvari alarm ter servisni nalog. Uporabniki so lastniki sistemov, serviserji in administratorji.

## Tehnologije

- Frontend: Angular, TypeScript, Angular Material
- Backend: ASP.NET Core Web API (C#), Entity Framework Core
- Podatkovna baza: PostgreSQL
- Avtentikacija: ASP.NET Core Identity + JWT
- Lokalni razvoj: Docker, Docker Compose

## Zagon

```
docker compose up
```

## Dokumentacija

- [01 Zasnova rešitve](docs/01-zasnova-resitve.md)
- [02 Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [03 Podatkovni model](docs/03-podatkovni-model.md)
- [04 Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [05 Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [06 Wireframes](docs/06-wireframes.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)
