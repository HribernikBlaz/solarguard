# Uporabniške zgodbe

Vsaka zgodba pokriva eno funkcionalnost (ena zgodba na funkcionalnost, 15 skupaj). Zgodbe so neodvisne, majhne in testljive (INVEST).

## US-01

- Funkcionalnost: 1. Registracija in prijava uporabnikov
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim se registrirati in prijaviti v aplikacijo, da lahko dostopam do podatkov o svojih sončnih elektrarnah.
- Acceptance criteria:
  - Sistem ob registraciji zahteva veljaven e-poštni naslov, geslo (najmanj 8 znakov, vsaj 1 številka) in ime/priimek.
  - Sistem zavrne registracijo z e-poštnim naslovom, ki je že v uporabi, in izpiše ustrezno sporočilo.
  - Po uspešni registraciji je uporabniku samodejno dodeljena vloga "Lastnik".
  - Prijava z napačnim geslom tri zaporedne poskuse zaklene račun za 5 minut.
  - Vlogi "Serviser" in "Admin" se ne moreta registrirati samostojno - njuna računa ustvari administrator.

## US-02

- Funkcionalnost: 2. Pregled proizvodnje v realnem času
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim videti graf proizvodnje svojega sistema po dnevih, tednih, mesecih in letih, da lahko spremljam delovanje elektrarne.
- Acceptance criteria:
  - Graf privzeto prikaže proizvodnjo za tekoči dan po urah.
  - Uporabnik lahko preklopi pogled na teden, mesec ali leto brez ponovnega nalaganja strani.
  - Vsaka točka na grafu ob prehodu miške prikaže natančno vrednost proizvodnje (kWh) in časovni žig.
  - Če za izbrano obdobje ni meritev, se prikaže sporočilo "Ni podatkov za izbrano obdobje".
  - Graf se posodobi najkasneje 60 sekund po prejemu nove meritve.

## US-03

- Funkcionalnost: 3. Primerjava dejanske proti pričakovani proizvodnji
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim na grafu videti primerjavo dejanske in pričakovane proizvodnje, da lahko ocenim, ali sistem deluje v skladu s pričakovanji.
- Acceptance criteria:
  - Pričakovana proizvodnja je na grafu prikazana kot ločena krivulja poleg dejanske proizvodnje.
  - Pričakovana vrednost se izračuna glede na lokacijo sistema, datum in vremensko napoved.
  - Odstopanje med dejansko in pričakovano proizvodnjo je prikazano v odstotkih za izbrano obdobje.
  - Če pričakovane vrednosti ni mogoče izračunati (npr. manjka lokacija), se namesto krivulje prikaže opozorilo.

## US-04

- Funkcionalnost: 4. Samodejno zaznavanje odstopanj (anomalij)
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim, da sistem samodejno zazna nenavaden padec proizvodnje, da se o težavi seznanim, še preden jo opazim sam.
- Acceptance criteria:
  - Sistem vsako uro primerja dejansko proizvodnjo s pričakovano za vsako aktivno napravo.
  - Odstopanje nad 20 % v treh zaporednih urah ustvari alarm z resnostjo "Opozorilo".
  - Odstopanje nad 50 % ali izpad meritev za več kot 2 uri ustvari alarm z resnostjo "Kritično".
  - Vsak alarm je viden na seznamu alarmov sistema, s časom zaznave in resnostjo.
  - Ponovna zaznava enakega odstopanja v istem časovnem oknu ne ustvari dodatnega alarma.

## US-05

- Funkcionalnost: 5. Samodejno ustvarjanje servisnega naloga in dodelitev serviserju
- Vloga: Serviser
- User story: Kot serviser želim, da se ob kritičnem alarmu samodejno ustvari in dodeli servisni nalog, da lahko takoj ukrepam brez čakanja na ročno dodelitev.
- Acceptance criteria:
  - Ob vsakem alarmu z resnostjo "Kritično" se samodejno ustvari nov servisni nalog s statusom "Odprt".
  - Nalog se samodejno dodeli serviserju, določenemu za zadevni sistem.
  - Serviser prejme obvestilo o novem nalogu najkasneje v 1 minuti od ustvarjenega naloga.
  - Če za sistem ni določenega serviserja, se nalog dodeli administratorju za ročno dodelitev.
  - En alarm lahko sproži največ en odprt servisni nalog.

## US-06

- Funkcionalnost: 6. Sledenje statusu servisnega naloga
- Vloga: Serviser
- User story: Kot serviser želim posodabljati status servisnega naloga, da imajo lastnik in administrator pregled nad potekom reševanja.
- Acceptance criteria:
  - Dovoljeni statusi so: Odprt, Dodeljen, V obdelavi, Zaključen, v tem vrstnem redu.
  - Serviser lahko status spremeni samo na naslednji veljavni status (brez preskakovanja nazaj po statusu "Zaključen").
  - Ob vsaki spremembi statusa se zabeleži časovni žig in uporabnik, ki je spremembo izvedel.
  - Prehod v status "Zaključen" zahteva obvezen vnos kratkega opisa opravljenega dela.
  - Lastnik sistema vidi trenutni status svojega naloga brez potrebe po ročnem osveževanju strani.

## US-07

- Funkcionalnost: 7. Izračun finančnega prihranka
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim vedeti, koliko denarja prihranim z lastno proizvodnjo elektrike, da lahko ocenim donosnost svoje naložbe.
- Acceptance criteria:
  - Prihranek se izračuna kot proizvodnja_kWh x cena_elektrike_na_kWh, ki jo uporabnik vnese v nastavitvah sistema.
  - Prihranek je prikazan za izbrano obdobje (dan/mesec/leto) in kumulativno od namestitve sistema.
  - Če cena elektrike ni vnesena, se prikaže poziv za vnos namesto napačnega izračuna.
  - Sprememba cene elektrike v nastavitvah velja samo za prihodnje obračune, pretekli podatki se ne preračunajo.

## US-08

- Funkcionalnost: 8. Upravljanje naprav in lokacij
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim vnašati, urejati in brisati podatke o svojih napravah (panel, inverter), da je evidenca moje opreme vedno točna.
- Acceptance criteria:
  - Obrazec za novo napravo zahteva tip (Panel/Inverter), proizvajalca, model in serijsko številko.
  - Sistem ob vnosu preveri, da serijska številka znotraj istega sistema ni podvojena.
  - Urejanje naprave ne izbriše zgodovine meritev, povezanih z njo.
  - Brisanje naprave je mogoče samo, če nima aktivnih (nezaključenih) servisnih nalogov.
  - Seznam naprav je mogoče filtrirati po tipu in sortirati po datumu namestitve.

## US-09

- Funkcionalnost: 9. Napoved proizvodnje za naslednje dni
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim videti napoved proizvodnje za naslednjih 7 dni, da lahko načrtujem porabo elektrike v gospodinjstvu.
- Acceptance criteria:
  - Napoved se izračuna na podlagi vremenske napovedi (oblačnost) in fizikalnega modela proizvodnje za lokacijo sistema.
  - Napoved je prikazana za vsak naslednji dan posebej, z oceno proizvodnje v kWh.
  - Napoved se samodejno posodobi ob vsaki osvežitvi vremenskih podatkov (najmanj vsakih 6 ur).
  - Če vremenska napoved za lokacijo ni na voljo, se namesto napovedi prikaže sporočilo o nedostopnosti podatka.

## US-10

- Funkcionalnost: 10. Obveščanje uporabnikov ob alarmu ali mejniku proizvodnje
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim prejeti obvestilo ob alarmu ali ob doseženem mejniku proizvodnje, da sem pravočasno seznanjen s pomembnimi dogodki.
- Acceptance criteria:
  - Lastnik prejme e-poštno obvestilo v 5 minutah od nastanka alarma z resnostjo "Kritično".
  - Doseženi mejniki skupne proizvodnje (npr. 1.000 kWh, 10.000 kWh) sprožijo obvestilo ob prvem preseganju vrednosti.
  - Uporabnik lahko v nastavitvah izklopi obveščanje o mejnikih, ne more pa izklopiti obveščanja o kritičnih alarmih.
  - Vsa poslana obvestila so vidna v seznamu obvestil znotraj aplikacije, tudi če e-pošta ni bila dostavljena.

## US-11

- Funkcionalnost: 11. Evidenca servisne zgodovine naprave
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim pregledati celotno servisno zgodovino posamezne naprave, da vem, kakšna dela so bila na njej že opravljena.
- Acceptance criteria:
  - Zgodovina prikazuje vse pretekle servisne naloge naprave, sortirane od najnovejšega do najstarejšega.
  - Za vsak zaključen nalog so vidni datum, opis opravljenega dela in ime serviserja.
  - Zgodovino je mogoče filtrirati po časovnem obdobju.
  - Če naprava nima servisne zgodovine, se prikaže sporočilo "Ni zabeleženih servisnih posegov".

## US-12

- Funkcionalnost: 12. Spremljanje garancij naprav
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim prejeti opozorilo pred potekom garancije naprave, da jo lahko še pravočasno uveljavim.
- Acceptance criteria:
  - Sistem preveri garancijske datume vseh naprav enkrat dnevno.
  - Opozorilo se prikaže in pošlje 30 dni pred potekom garancije.
  - Naprave, katerim garancija poteče v naslednjih 30 dneh, so na seznamu posebej označene.
  - Naprave s pretečeno garancijo so na seznamu jasno ločene od tistih z veljavno garancijo.

## US-13

- Funkcionalnost: 13. Izvoz poročil o proizvodnji in prihranku
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim izvoziti poročilo o proizvodnji in prihranku za izbrano obdobje, da ga lahko shranim ali delim z drugimi.
- Acceptance criteria:
  - Uporabnik lahko izbere poljubno časovno obdobje (od-do datum) za izvoz.
  - Poročilo je na voljo v formatu PDF in CSV.
  - PDF poročilo vsebuje graf proizvodnje, skupno proizvodnjo (kWh) in izračunan prihranek (EUR) za izbrano obdobje.
  - CSV izvoz vsebuje surove podatke meritev (časovni žig, proizvodnja, temperatura).
  - Izvoz obdobja brez podatkov vrne prazno poročilo z opozorilom, ne napake.

## US-14

- Funkcionalnost: 14. Primerjava z drugimi sistemi (benchmarking)
- Vloga: Lastnik sistema
- User story: Kot lastnik sistema želim primerjati učinkovitost svojega sistema s podobnimi sistemi, da lahko ocenim, ali moja elektrarna dosega pričakovano povprečje.
- Acceptance criteria:
  - Primerjava uporablja sisteme podobne nazivne moči (± 20 %) v radiju 20 km od lokacije uporabnikovega sistema.
  - Prikazana je povprečna proizvodnja na kW nazivne moči primerjalne skupine in uporabnikova vrednost za isto obdobje.
  - Primerjava je anonimizirana - prikazano je samo povprečje skupine, ne podatkov posameznih drugih uporabnikov.
  - Če v radiju ni dovolj primerljivih sistemov (manj kot 3), se prikaže opozorilo o nezadostnih podatkih.

## US-15

- Funkcionalnost: 15. Administratorski pregled vseh sistemov in statistike
- Vloga: Admin platforme
- User story: Kot administrator platforme želim pregledati vse registrirane sisteme in osnovno statistiko platforme, da lahko spremljam stanje in rast celotne platforme.
- Acceptance criteria:
  - Pregled prikazuje skupno število registriranih sistemov, naprav in aktivnih uporabnikov.
  - Seznam sistemov je mogoče filtrirati po statusu (aktiven/neaktiven) in iskati po nazivu ali lastniku.
  - Pregled prikazuje število odprtih, dodeljenih in zaključenih servisnih nalogov na celotni platformi.
  - Administrator lahko iz pregleda neposredno dostopa do podrobnosti posameznega sistema.
