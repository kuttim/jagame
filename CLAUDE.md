# Jagame – projekti juhis

Ühiste kulude jagamise rakendus (vt README.md). Next.js + TypeScript + Tailwind, hiljem Prisma + PostgreSQL, Auth.js, Vitest.

@AGENTS.md

## Tegevuslogi (kohustuslik)

Pea töö käigus automaatselt tegevuslogi failis `./logi.md`. Eesmärk on koostada logist hiljem päevakokkuvõtteid ja blogipostitusi.

- Lisa kirje **iga sisulise tegevuse järel** (funktsiooni lisamine, vea parandus, otsus, katsetus, tööriista seadistus, commit) – ära oota päeva lõppu.
- Uued kirjed lisa faili **lõppu**; vanu kirjeid ära kustuta ega muuda.
- Rühmita kirjed kuupäeva järgi pealkirja all `## AAAA-KK-PP`.
- Iga kirje on üks lühike punkt kujul: `- HH:MM – mida tehti – miks / mis õpiti / mis ebaõnnestus`.
- Hoia kirje lugejasõbralik: **kuni umbes 600 tähemärki**. Kui tegevust on rohkem, jaga see mitmeks kirjeks (nt üks kirje sammu, üks olulise vea või otsuse kohta), mitte ühte tekstimüüri.
- Alusta kirjet **lühikese ühelauselise pealkirjaga** (mida tehti, kuni ~100 tähemärki), seejärel detailid. Päevikuleht (`/diary`) näitab esimest lauset pealkirjana ja voltib pika teksti kokku.
- Alusta detailide lõiku märksõnaga, et leht saaks need siltidena esile tõsta: `Otsus:`, `Viga:`, `Õppetund:`, `Kontrollisin …`, `Piirang:` või `Märkus:` (vt `src/lib/devlog-format.ts`). Üks lõik, üks märksõna.
- Kirjuta eesti keeles. Märgi ära otsused ja põhjendused, tehtud vead ja nende lahendused ning ideed blogipostituseks (`💡`).
- Ära salvesta logisse paroole, võtmeid ega muid saladusi.
- `logi.md` commit'i koos vastava muudatusega.

## Töökorraldus

- Järgi README teostusplaani sammude järjekorda.
- Arvutusloogika (saldod, tasaarvestus, ümardamine sentideni) kirjuta puhaste funktsioonidena ja kata Vitest-ühiktestidega.
- Rahasummad hoia täisarvuna sentides, mitte ujukomaarvuna.
- Testid on kaustas `__tests__/` (peegeldab `src/` struktuuri, nt `src/lib/auth/password.ts` → `__tests__/lib/auth/password.test.ts`), mitte `src/` sees. Testides impordi koodi aliasega `@/...`.
- Commit'i väikeste loogiliste sammudena eestikeelse selge sõnumiga.

## Keel

- **Veebileht on eesti keeles:** kõik kasutajale nähtavad tekstid (pealkirjad, nupud, veateated, kuupäevad, meta-kirjeldused).
- **Kood on inglise keeles:** muutujad, funktsioonid, tüübid, failide ja kaustade nimed, kommentaarid, testide kirjeldused ja arendajale mõeldud veateated (nt `throw new RangeError(...)`). Kasutajale näidatavad veateated tõlgi eesti keelde kasutajaliideses.
- **Marsruudid ja kaustad on inglise keeles:** `/diary`, `/register`, `/login`, `/groups`; kaust `src/app/<marsruut>` järgib marsruuti.
- **Erandid, mis jäävad eesti keelde:** `logi.md` ja selle faili nimi, commit'i sõnumid, README ja see juhis.
