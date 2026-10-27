## Uporabniške vloge
 
### Lastnik sistema
- Lahko: pregleduje proizvodnjo lastnih sistemov, prejema alarme, naroča servis, pregleduje zgodovino in stroške.
- Ne more: dostopati do podatkov drugih uporabnikov, urejati servisnih nalogov drugih sistemov, upravljati serviserjev.

### Serviser
- Lahko: pregleduje dodeljene servisne naloge, posodablja status naloga, vnaša opravljena dela in rezervne dele, dostopa do tehničnih podatkov naprave.
- Ne more: urejati uporabniških računov lastnikov, videti finančnih podatkov lastnika (prihranek, cena elektrike), dodeljevati naloge sebi/drugim serviserjem.

### Admin platforme
- Lahko: upravlja uporabniške račune (lastniki, serviserji), dodeljuje serviserje sistemom/lokacijam, pregleduje statistiko vseh sistemov, upravlja šifrante (tipi naprav, pragovi alarmov).
- Ne more: sam izvajati servisnih del, urejati meritev.

## Predvidene funkcionalnosti
 
1. Registracija in prijava uporabnikov (vloge: lastnik, serviser, admin)
2. Pregled proizvodnje v realnem času (dnevni/tedenski/mesečni/letni graf) - MVP
3. Primerjava dejanske proti pričakovani proizvodnji glede na lokacijo in datum - MVP
4. Samodejno zaznavanje odstopanj (anomalij) od pričakovane proizvodnje - MVP
5. Samodejno ustvarjanje servisnega naloga ob kritičnem odstopanju in dodelitev serviserju - MVP
6. Sledenje statusu servisnega naloga (odprt, dodeljen, v obdelavi, zaključen) - MVP
7. Izračun finančnega prihranka glede na proizvodnjo, porabo in ceno elektrike - MVP
8. Upravljanje naprav in lokacij (panel, inverter, serijska številka, garancija)
9. Napoved pričakovane proizvodnje za naslednje dni glede na vremensko napoved
10. Obveščanje uporabnikov ob alarmu ali doseženem mejniku proizvodnje
11. Evidenca servisne zgodovine posamezne naprave
12. Spremljanje garancij naprav z opozorilom pred potekom
13. Izvoz poročil o proizvodnji in prihranku (PDF/CSV) za izbrano obdobje
14. Primerjava sistema z drugimi sistemi podobne velikosti/lokacije (benchmarking)
15. Administratorski pregled vseh sistemov in osnovne statistike platforme
MVP (funkcionalnosti 2, 3, 4, 5, 6, 7): domensko specifične so 3, 4, 5.
 
## Kasnejše nadgradnje
- Mobilna aplikacija (iOS/Android) s potisnimi obvestili.
- Napredna napoved proizvodnje s strojnim učenjem na zgodovinskih podatkih.
- Integracija z dejanskimi API-ji proizvajalcev (SolarEdge, Huawei, Growatt).
- Skupinsko upravljanje več sistemov (npr. za podjetja z več lokacijami).
- Avtomatsko naročanje rezervnih delov ob servisnem nalogu.
## Out of scope
- Neposredno krmiljenje strojne opreme (npr. izklop inverterja prek aplikacije).
- Obračun in plačilni promet med lastnikom in serviserjem znotraj platforme.
- Podpora za komercialne/industrijske elektrarne (le gospodinjski sistemi).
