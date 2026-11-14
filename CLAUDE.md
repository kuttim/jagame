# Jagame – projekti juhis

Ühiste kulude jagamise rakendus (vt README.md). Next.js + TypeScript + Tailwind, hiljem Prisma + PostgreSQL, Auth.js, Vitest.

@AGENTS.md

## Tegevuslogi (kohustuslik)

Pea töö käigus automaatselt tegevuslogi failis `./logi.md`. Eesmärk on koostada logist hiljem päevakokkuvõtteid ja blogipostitusi.

- Lisa kirje **iga sisulise tegevuse järel** (funktsiooni lisamine, vea parandus, otsus, katsetus, tööriista seadistus, commit) – ära oota päeva lõppu.
- Uued kirjed lisa faili **lõppu**; vanu kirjeid ära kustuta ega muuda.
- Rühmita kirjed kuupäeva järgi pealkirja all `## AAAA-KK-PP`.
- Iga kirje on üks lühike punkt kujul: `- HH:MM – mida tehti – miks / mis õpiti / mis ebaõnnestus`.
- Kirjuta eesti keeles. Märgi ära otsused ja põhjendused, tehtud vead ja nende lahendused ning ideed blogipostituseks (`💡`).
- Ära salvesta logisse paroole, võtmeid ega muid saladusi.
- `logi.md` commit'i koos vastava muudatusega.

## Töökorraldus

- Järgi README teostusplaani sammude järjekorda.
- Arvutusloogika (saldod, tasaarvestus, ümardamine sentideni) kirjuta puhaste funktsioonidena ja kata Vitest-ühiktestidega.
- Rahasummad hoia täisarvuna sentides, mitte ujukomaarvuna.
- Commit'i väikeste loogiliste sammudena eestikeelse selge sõnumiga.

## Keel

- **Veebileht on eesti keeles:** kõik kasutajale nähtavad tekstid (pealkirjad, nupud, veateated, kuupäevad, meta-kirjeldused).
- **Kood on inglise keeles:** muutujad, funktsioonid, tüübid, failide ja kaustade nimed, kommentaarid, testide kirjeldused ja arendajale mõeldud veateated (nt `throw new RangeError(...)`). Kasutajale näidatavad veateated tõlgi eesti keelde kasutajaliideses.
- **Erandid, mis jäävad eesti keelde:** `logi.md` ja selle faili nimi, commit'i sõnumid, README ja see juhis. Marsruudi `/paevik` URL on kasutajale nähtav, seega on see eestikeelne; kaust `src/app/paevik` järgib marsruuti.
