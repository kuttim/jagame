# Jagame – ühiste kulude jagamise rakendus

## Projekti nimi

**Jagame** – lihtne veebirakendus, millega sõbrad, korterikaaslased või reisikaaslased saavad ühiseid kulusid kirja panna ja välja arvutada, kes kellele palju võlgneb.

## Eesmärk

Ühisel reisil või ühes korteris maksab erinev inimene erinevaid arveid (toit, bensiin, üür, kommunaalid). Lõpus on keeruline meenutada, kes kui palju maksis ja kes kellele raha võlgneb. Tulemuseks on kas arvutustabeli jantimine või ebamugavad vaidlused.

Jagame lahendab selle nii, et:

- kõik kulud on ühes jagatud nimekirjas,
- rakendus arvutab iga inimese saldo automaatselt,
- rakendus näitab, kuidas kõik võlad kõige vähemate ülekannetega tasa saab.

Grupi loomiseks on vaja kontot, kuid grupiga liitumiseks piisab lingist.

## Sihtgrupp

- sõbrad, kes reisivad koos,
- korterikaaslased, kes jagavad igakuiseid kulusid,
- pered ja kolleegid, kes korraldavad ühiseid üritusi või kingitusi.

## Funktsionaalsus

1. **Registreerimine ja sisselogimine** – kasutaja loob konto e-posti ja parooliga ning näeb lehel „Minu grupid" kõiki oma gruppe koos sellega, kui palju ta igas saab või võlgneb.
2. **Grupi loomine** – kasutaja loob grupi (nt „Rootsi reis") ja saab unikaalse lingi, mille jagamisega pääsevad teised gruppi ilma registreerimata.
3. **Liikmete haldus** – gruppi saab lisada ja eemaldada liikmeid nime järgi.
4. **Kulu lisamine** – kuludel on kirjeldus, summa, kuupäev, maksja ja inimesed, kelle vahel kulu jagatakse.
5. **Erinevad jagamisviisid** – kulu saab jagada võrdselt, kindlate summade või protsentide järgi.
6. **Saldode ülevaade** – iga liikme juures on näha, kui palju ta on kokku maksnud, kui palju tema osa oli ning kas ta on plussis või miinuses.
7. **Tasaarvestamise soovitus** – rakendus arvutab välja kõige vähemate ülekannetega võlgade tasumise plaani (nt „Mari maksab Jaanile 12,50 €").
8. **Kulude muutmine ja kustutamine** – vigu saab parandada ning muudatuste ajalugu on nähtav.
9. **Tasumine** – tehtud ülekande saab märkida tasutuks, mis uuendab saldosid.
10. **Eksport** – kulude nimekirja saab alla laadida CSV-failina.

## Tehnoloogiad

| Valdkond | Valik |
|---|---|
| Programmeerimiskeel | TypeScript |
| Raamistik | Next.js (React) – esikülg ja server ühes projektis |
| Stiil | Tailwind CSS |
| Autentimine | Auth.js (e-post + parool, paroolid räsitud) |
| Andmebaas | PostgreSQL, ligipääs Prisma ORM-iga |
| Testimine | Vitest (eriti arvutusloogika jaoks), Playwright (põhivoog) |
| Tööriistad | Git ja GitHub, VS Code, ESLint, Prettier |
| Majutus | Vercel ja tasuta PostgreSQL (Neon) |

Projekt ei vaja ühtegi välist API-t, kaamerat ega e-posti teenust.

## Teostusplaan

1. **Planeerimine** – ekraaniskeemid, andmemudel (grupp, liige, kulu, osalus, tasumine), repositooriumi loomine.
2. **Projekti ülesseadmine** – Next.js, andmebaas ja Prisma, esimene avaldamine.
3. **Kontod** – registreerimine, sisselogimine ja leht „Minu grupid".
4. **Grupid ja liikmed** – grupi loomine, jagatav link, liikmete lisamine.
5. **Kulud** – kulu lisamine, muutmine, kustutamine ja kuvamine nimekirjas.
6. **Arvutusloogika** – saldode arvutamine, jagamisviisid ja tasaarvestuse algoritm, mille katavad ühiktestid (kõige olulisem osa).
7. **Tasumised ja eksport** – tasutuks märkimine ja CSV allalaadimine.
8. **Kujundus** – mobiilisõbralik paigutus, selged veateated.
9. **Testimine ja avaldamine** – automaattestid, proovimine päris reisi või kulude peal, README juhend.

## Valmisoleku kriteeriumid

Projekt loetakse valmis, kui:

- kõik ülaltoodud funktsioonid (1–10) töötavad;
- uus kasutaja saab luua grupi, lisada liikmed ja kulud ning näha tasaarvestuse soovitust ilma abita;
- saldod on korrektsed: kõigi liikmete saldode summa on alati 0 ja arvutuse ühiktestid läbivad (sh ümardamine sentideni);
- tasaarvestuse plaani järgi ülekandeid tehes saavad kõik saldod nulli;
- jagatud link annab ligipääsu ainult sellele grupile ning teisi gruppe ei ole võimalik näha;
- rakendus töötab telefonis ja arvutis ning peamistes brauserites;
- rakendus on avalikult kättesaadav internetis ja README sisaldab käivitusjuhendit.
