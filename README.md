# Solar Guard

Platforma za nadzor proizvodnje sončnih elektrarn v gospodinjstvih. Primerja dejansko proizvodnjo s pričakovano (glede na lokacijo, sezono in vreme), zazna odstopanja (okvara, umazanija, senca) in samodejno ustvari alarm ter servisni nalog. Uporabniki so lastniki sistemov, serviserji in administratorji.

## Tehnologije

- Frontend: Angular, TypeScript, Angular Material
- Backend: ASP.NET Core Web API (C#), Entity Framework Core
- Podatkovna baza: PostgreSQL
- Avtentikacija: ASP.NET Core Identity + JWT
- Lokalni razvoj: Docker, Docker Compose

## Lokalni zagon

Potrebuješ samo Docker (Docker Desktop mora teči).

```
git clone git@github.com:HribernikBlaz/solarguard.git
cd solarguard
docker compose up --build
```

Ob prvem zagonu se samodejno ustvari baza (shema iz `backend/SolarGuard.Api/Migrations/init.sql`) in napolni s testnimi podatki (`backend/seed.sql`: 2 sistema, 4 naprave, meritve zadnjih 8 dni).

| Kaj               | Naslov                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| Aplikacija        | http://localhost:4200                                                     |
| API (Swagger)     | http://localhost:8080/swagger                                             |
| Baza (PostgreSQL) | localhost:5432, baza `solarguard`, uporabnik `postgres`, geslo `postgres` |

Prijava:

| Vloga | E-pošta | Geslo |
|---|---|---|
| Lastnik (ima testne sisteme) | `lastnik@solarguard.local` | `Lastnik12345` |
| Admin (vidi vse) | `admin@solarguard.local` | `Admin12345` |

Nov lastnik se ustvari z registracijo v aplikaciji in na začetku nima sistemov.

### E-poštna obvestila

Lokalno e-pošto sprejme Mailpit (del `docker compose`), ki je ne pošlje naprej. Poslana sporočila so v spletnem vmesniku http://localhost:8025, obvestila pa tudi v aplikaciji na strani Obvestila (stolpec E-pošta pokaže, ali je bila poslana).

Za pravo dostavo v `.env` (ni v repozitoriju) dodaj nastavitve SMTP strežnika, na primer za Gmail z geslom za aplikacije:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ime@gmail.com
SMTP_PASSWORD=geslo-za-aplikacije
SMTP_FROM=ime@gmail.com
```

Nato `docker compose up -d`. Sporočila gredo na e-poštni naslov uporabnika, zato testni računi `@solarguard.local` pravih sporočil ne dobijo; za preizkus se registriraj s pravim naslovom. Če SMTP ni nastavljen (privzeto na Raspberry Pi), obvestila ostanejo samo v aplikaciji in so označena kot nedostavljena.

Ponastavitev baze (nov seed, pobriše tudi registrirane uporabnike): `docker compose down -v`, nato ponovno `docker compose up --build`.

### Razvoj brez Dockerja za API in splet

V treh terminalih (v PowerShellu):

```
docker compose up solarguard-db

cd backend/SolarGuard.Api
$env:ASPNETCORE_ENVIRONMENT = "Development"; $env:ASPNETCORE_URLS = "http://localhost:8080"; dotnet run

cd frontend
npm install; npm start
```

Razvojne nastavitve (povezava na lokalno bazo in JWT ključ) so v `appsettings.json` in `appsettings.Development.json`. Če želiš admina, pred `dotnet run` nastavi še `$env:Admin__Email` in `$env:Admin__Password`. Frontend (`npm start`) in celoten `docker compose up` oba uporabljata port 4200, zato ju ne poganjaj hkrati.

## Raspberry Pi

Produkcijska različica je v `docker-compose.pi.yml` (baza CockroachDB je zunaj repozitorija, spletna stran prek Cloudflare tunela). V `.env` morajo biti `TUNNEL_TOKEN`, `JWT_KEY` ter neobvezno `ADMIN_EMAIL`, `ADMIN_PASSWORD` in nastavitve SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`) za pošiljanje obvestil.

```
docker compose -f docker-compose.pi.yml up -d --build
```

Če baza že obstaja, se za nove tabele požene samo razlika: `dotnet ef migrations script <prejšnja migracija> <nova migracija>`.

## Dokumentacija

- [01 Zasnova rešitve](docs/01-zasnova-resitve.md)
- [02 Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [03 Podatkovni model](docs/03-podatkovni-model.md)
- [04 Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [05 Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [06 Wireframes](docs/06-wireframes.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)
