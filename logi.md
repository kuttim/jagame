# Jagame – arenduslogi

Logi kasutatakse päevakokkuvõtete ja blogipostituste koostamiseks. Reeglid: vt CLAUDE.md.

## 2026-11-13

- 17:58 – Seadistasin Next.js projekti (TypeScript, Tailwind, ESLint, App Router, `src/`) – README teostusplaani samm 2. Tegin create-next-app'i ajutises kaustas, et mitte README.md-d üle kirjutada.
- 18:01 – Lisasin CLAUDE.md projekti juhise koos automaatse tegevuslogi nõudega ja lõin selle faili (`logi.md`). 💡 Blogiidee: kuidas panna AI-abiline ise arenduslogi pidama.
- 18:04 – `npm install` + `npm run build` õnnestusid, algne leht ehitub. Commit'in algseadistuse.

## 2026-11-14

- 21:05 – Alustasin arenduspäevikuga (mitte blogiga): `src/lib/logi.ts` parsib `logi.md` päevadeks (iga `## AAAA-KK-PP` on üks päev), lehed `/paevik` (päevade ajajoon) ja `/paevik/[date]` (päeva kirjed ajajoonena, eelmine/järgmine päev, 💡 mõte eraldi „Idee" kastis). Lugemine toimub ehitamise ajal, seega uus logikirje + uus build = uus päev päevikus, eraldi sisu kopeerida ei pea. Otsus: logi on tegevuste kronoloogia, mitte artiklid, seega on see kohe päevik, mitte blogi; üks päev = üks leht ja lisasõltuvusi (MDX, CMS) pole vaja. Lisaks `lang="et"`, Geist-font (globals.css kirjutas selle Arialiga üle) ja link avalehelt päevikusse. 💡 Blogiidee: logi kui ainus tõe allikas – kuidas arenduslogist saab ise blogi.
- 21:11 – `next dev` andis hoiatuse „`params` accessed outside of `<Suspense>`" lehel `/paevik/[date]`. Põhjus: projektis on `cacheComponents` ja `partialPrefetching` sees ning ma ootasin `params`-i lehe tipptasemel. Lahendus Next.js dokumentatsiooni järgi (migrating-to-cache-components): leht on nüüd sünkroonne ja `await params` on eraldi komponendis `<Suspense>` sees. Valisin selle, mitte `export const instant = false`, sest viimane lihtsalt vaigistaks hoiatuse.
