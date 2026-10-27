# Zasnova rešitve

## Ime rešitve
Solar Guard

## Namen in problem
- Platforma za nadzor proizvodnje sončnih elektrarn v gospodinjstvih.
- Lastniki nimajo pregleda, ali sistem deluje v skladu s pričakovano proizvnodnjo proizvodnjo glede na lokacijo, sezono in vreme.
- Odstopanja (okvara, umazanija na panelih, senca) se pogosto opazijo šele ob nižjem računu, ne ob nastanku težave.
- Ni povezave med zaznavo napake in servisnim procesom (lastnik mora sam poiskati in najeti serviserja).

## Ciljni uporabniki
- Lastniki malih sončnih elektrarn (gospodinjstva), ki želijo spremljati proizvodnjo in biti obveščeni o napakah.
- Serviserji/inštalaterji, ki prejemajo in rešujejo servisne naloge na oddaljenih sistemih.
- Operater platforme, ki upravlja uporabnike in dodeljuje serviserje sistemom.

## Kratek opis delovanja
- Vsak sistem (lokacija) ima zabeležene naprave (paneli, inverter) in redne meritve proizvodnje.
- Sistem primerja meritve s pričakovano vrednostjo (model glede na lokacijo, datum, vreme)
- Ob zaznanem odstopanju se samodejno ustvari alarm in servisni nalog, ta se dodeli razpoložljivemu serviserju.
- Lastnik prek spletne aplikacije spremlja proizvodnjo, prihranek in status servisnih nalogov.
