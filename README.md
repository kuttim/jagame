# Jagame – ühiste kulude jagamise rakendus

## Projekti nimi

**Jagame** – lihtne veebirakendus, millega sõbrad, korterikaaslased või reisikaaslased saavad ühiseid kulusid kirja panna ja välja arvutada, kes kellele palju võlgneb.

## Lingid

- **Avalik leht:** <https://jagame.vercel.app/>
- **Arenduspäevik:** <https://jagame.vercel.app/diary>
- **Lähtekood (GitHub):** <https://github.com/kuttim/jagame>

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

## Käivitamine arvutis

Vajalik on [Node.js](https://nodejs.org/) 20.9 või uuem ja Git.

```bash
git clone https://github.com/kuttim/jagame.git
cd jagame
npm install
npm run dev
```

Seejärel avaneb rakendus aadressil <http://localhost:3000> ja arenduspäevik aadressil <http://localhost:3000/diary>.

| Käsk | Mida teeb |
|---|---|
| `npm run dev` | käivitab arendusserveri |
| `npm run build` | ehitab rakenduse avaldamiseks |
| `npm start` | käivitab ehitatud rakenduse (enne `npm run build`) |
| `npm test` | käivitab ühiktestid (Vitest) |
| `npm run test:coverage` | käivitab ühiktestid ja näitab, kui suur osa `src/lib` koodist on testidega kaetud |
| `npm run test:e2e` | käivitab brauseritestid (Playwright), vt „Testimine" |
| `npm run lint` | kontrollib koodi ESLintiga |

Rakendus vajab andmebaasi: ilma selleta ei saa kontosid ega gruppe teha. Tee PostgreSQL-andmebaas (nt tasuta [Neon](https://neon.com/)) ja loo projekti juurkausta fail `.env` (Git seda ei jälgi):

```
DATABASE_URL=postgresql://...          # rakenduse ühendus
DATABASE_URL_UNPOOLED=postgresql://... # otseühendus migratsioonide jaoks
AUTH_SECRET=...                        # saladus, millega sisselogimise küpsised allkirjastatakse
```

`AUTH_SECRET` tee ise ja ära jaga seda kellegagi. Selle saab nii: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Kui käivitad ehitatud rakenduse (`npm start`) oma arvutis, lisa käsu ette ka `AUTH_TRUST_HOST=true` (Verceli peal pole seda vaja).

Seejärel loo tabelid käsuga `npx prisma migrate deploy` ja kontrolli ühendust käsuga `npm run db:check`.

| Andmebaasi käsk | Mida teeb |
|---|---|
| `npx prisma migrate deploy` | rakendab migratsioonid andmebaasi |
| `npx prisma migrate dev` | loob ja rakendab uue migratsiooni pärast skeemi muutmist |
| `npx prisma generate` | uuendab Prisma klienti (tee pärast iga skeemimuutust, `migrate dev` ei tee seda ise) |
| `npm run db:check` | kontrollib, et rakendus saab andmebaasiga ühenduse |

## Kasutusjuhend

1. **Registreeru** lehel „Registreeru" (nimi, e-post, parool vähemalt 8 tähemärki). Konto on vaja ainult grupi loomiseks.
2. **Loo grupp** lehel „Minu grupid": anna grupile nimi (nt „Rootsi reis"). Sa oled grupi omanik ja esimene liige.
3. **Kutsu teisi:** kopeeri grupi lehelt link nupuga „Kopeeri" ja saada see sõpradele. Kes lingi avab, näeb kutset, kirjutab oma nime ja on liige, kontot pole vaja. Omanik saab liikmeid lisada ka ise nime järgi (nt kui keegi ei viitsi linki avada).
4. **Lisa kulu** nupuga „Lisa kulu": kirjeldus, summa, kuupäev, kes maksis ja kes osalevad. Jagada saab **võrdselt**, **summadena** (summad peavad andma kokku kulu summa) või **protsentidena** (kokku 100 %). Sendid ei lähe kaduma: kui summa ei jagu võrdselt, saavad mõned liikmed 1 sendi rohkem.
5. **Vaata saldosid:** jaotis „Saldod" näitab iga liikme juures, kui palju ta maksis, kui suur oli tema osa ja kas ta on plussis (talle võlgnetakse) või miinuses (ta võlgneb). Kõigi saldode summa on alati 0.
6. **Tasa võlad:** „Kes kellele maksab" soovitab kõige vähemate ülekannetega plaani. Kui ülekanne on tehtud, vajuta „Märgi tasutuks"; kui eksisid, siis „Võta tagasi".
7. **Lae alla:** „Lae alla (CSV)" annab kulud, saldod või tehtud tasumised faili, mille saab avada Excelis või Google'i tabelites.

Kulu saab muuta ja kustutada, vajutades kulu juures „Muuda". Liiget, kellel on kulusid või tasumisi, ei saa eemaldada, sest kulud viitavad talle.

## Testimine

Arvutus on kõige olulisem osa, sest vigane saldo on vale raha. Seetõttu on see kaetud mitmel tasemel:

| Tase | Käsk | Mida kontrollib |
|---|---|---|
| Ühiktestid | `npm test` | jagamine ja ümardamine sentideni, saldod, tasaarvestus, valideerimine, CSV, õigused, küpsise allkiri |
| Näidisreis | `npm test` (`__tests__/scenarios/`) | terve tee vormist ülekanneteni nelja inimese Rootsi reisil, käsitsi läbi arvutatud summadega, ja 400 juhuslikku reisi (jagamise summa = kulu summa, saldode summa = 0, soovitatud ülekanded viivad kõik nulli) |
| Brauseritestid | `npm run test:e2e` | põhivoog päris Chrome'is: konto, grupp, liikmed, kulud, saldod, tasumine, CSV, kutse ja õigused |
| Katvus | `npm run test:coverage` | arvutuskood (`src/lib/calculation`) on 100 % ridade ulatuses kaetud |

**Brauseritestide kohta:** need vajavad arvutisse paigaldatud Google Chrome'i ja `.env` faili andmebaasiga. Testid ehitavad rakenduse, käivitavad selle pordil 3100, teevad kontod aadressiga `e2e-…@example.com` ja **kustutavad need pärast ära** (muud andmebaasis ei puutu). Kui sinu `.env` osutab päris saidi andmebaasile, tee testimiseks eraldi Neoni haru (vt allpool).

## Avaldamine (Vercel ja Neon)

1. Ühenda GitHubi hoidla Verceliga (Vercel ehitab ja avaldab iga `main` haru muudatuse automaatselt).
2. Lisa Verceli projekti keskkonnamuutujad `DATABASE_URL`, `DATABASE_URL_UNPOOLED` (Neon lisab need ise, kui ühendad Neoni Verceli kaudu) ja `AUTH_SECRET` (oma salajane väärtus, eraldi igale keskkonnale).
3. Kui skeem muutus, rakenda migratsioonid Neoni andmebaasi: `npx prisma migrate deploy` (kohalikult, `.env` osutab sellele andmebaasile).
4. Kontrolli pärast avaldamist: ava sait, registreeri, tee grupp ja kulu, ava grupi link teises brauseris.

**Soovitus: eralda arendus ja päris sait.** Praegu kasutavad kohalik arendus ja avalik sait sama Neoni andmebaasi, seega testikontod ja -grupid satuvad päris andmete hulka. Loo Neoni konsoolis **uus haru** (Branches → Create branch), pane selle ühendusstringid oma kohalikku `.env` faili ja jooksuta `npx prisma migrate deploy`. Nii saab brauseritestide ja arenduse andmeid vabalt muuta, ilma et päris kasutajate andmed ohtu satuksid.

## Valmisoleku kriteeriumid

Projekt loetakse valmis, kui:

- kõik ülaltoodud funktsioonid (1–10) töötavad;
- uus kasutaja saab luua grupi, lisada liikmed ja kulud ning näha tasaarvestuse soovitust ilma abita;
- saldod on korrektsed: kõigi liikmete saldode summa on alati 0 ja arvutuse ühiktestid läbivad (sh ümardamine sentideni);
- tasaarvestuse plaani järgi ülekandeid tehes saavad kõik saldod nulli;
- jagatud link annab ligipääsu ainult sellele grupile ning teisi gruppe ei ole võimalik näha;
- rakendus töötab telefonis ja arvutis ning peamistes brauserites;
- rakendus on avalikult kättesaadav internetis ja README sisaldab käivitusjuhendit.

## Valmisoleku seis

Teostusplaani sammud 1–9 on tehtud. Funktsioonide seis:

| # | Funktsioon | Seis |
|---|---|---|
| 1 | Registreerimine ja sisselogimine | ✅ Leht „Minu grupid" näitab gruppe ja liikmete arvu, **aga mitte seda, kui palju kasutaja igas saab või võlgneb** (konto pole grupi liikmega seotud) |
| 2 | Grupi loomine ja jagatav link | ✅ |
| 3 | Liikmete haldus | ✅ Omanik lisab ja eemaldab, liikmed liituvad lingiga ja saavad ise lahkuda |
| 4 | Kulu lisamine | ✅ |
| 5 | Jagamisviisid (võrdselt, summadena, protsentidena) | ✅ |
| 6 | Saldode ülevaade | ✅ |
| 7 | Tasaarvestuse soovitus | ✅ |
| 8 | Kulude muutmine ja kustutamine | ✅ Muutmine ja kustutamine töötavad, **muudatuste ajalugu puudub** |
| 9 | Tasumine | ✅ Märkida saab soovitatud ülekande täissumma; tagasivõtmine on võimalik |
| 10 | CSV eksport | ✅ Kulud, saldod ja tasumised |

## Teadaolevad piirangud

- **Ligipääs põhineb lingil.** Kes grupi lingi teab, saab liituda, ja valikuga „Oled juba loendis?" saab esineda kellegi teisena. Jaga linki ainult nendega, kes peavad grupis olema.
- **Sisselogimisel ja registreerimisel pole katsete piirangut.** Paroolid on räsitud (bcrypt), aga kellegi järjest proovimist rakendus ei peata.
- **Pole paroolitaastet, e-posti kinnitamist ega konto ja grupi kustutamist** (projekt ei kasuta e-posti teenust).
- **Osamakseid** ei saa käsitsi sisestada, ainult soovitatud täissumma.
- **Sama nime kordumist** grupis kontrollib rakendus, mitte andmebaas; kaks täpselt samal hetkel tehtud lisamist võiksid duplikaadi tekitada.
- **Brausereid:** testitud on Chrome'is (arvuti ja 390 px mobiilivaade), mitte teistes brauserites ega päris telefonides.
- **Arendus ja avalik sait jagavad ühte andmebaasi**, kuni eraldi Neoni haru pole tehtud.
