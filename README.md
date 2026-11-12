## 🏎️ FORMULACIJA — Arhiva Formule 1

**FORMULACIJA** je nezavisan projekat nastao iz ljubavi prema Formuli 1 i želje da ljubiteljima ovog sporta omogući jednostavniji pristup trkama iz prethodnih sezona.

Na jednom mestu okupljamo informacije i linkove ka dostupnim snimcima trka, kvalifikacija i sprintova, kako bismo olakšali pronalaženje i ponovno proživljavanje nezaboravnih trenutaka Formule 1.

DEPLOYMENT TEST

---

## 🏁 Funkcionalnosti

- **Arhiva trka** — pregled dostupnih trka iz različitih sezona Formule 1.
- **Napredni filteri** — filtriranje prema sezoni, Velikoj nagradi, komentatoru i vrsti sesije.
- **Pretraga** — brzo pronalaženje trka, vozača i drugih pojmova.
- **Različite sesije** — pregled kvalifikacija, sprintova i glavnih trka.
- **Informativne kartice** — prikaz naziva Velike nagrade, sezone, komentatora, datuma i trajanja snimka.
- **Zastave država** — vizuelno prepoznavanje Velikih nagrada putem zastava.
- **Optimizovano učitavanje** — lokalno keširanje podataka i postepeno prikazivanje arhivskih kartica.
- **Responzivan dizajn** — prilagođen korišćenju na računarima, tabletima i mobilnim uređajima.

## 🛠️ Tehnologije

Projekat je razvijen korišćenjem:

- **HTML5** — struktura i organizacija sadržaja.
- **CSS3** — dizajn, animacije i responzivnost.
- **JavaScript** — pretraga, filteri, prikaz arhive i interakcije.
- **Google Sheets** — čuvanje i organizacija podataka o trkama.
- **Google Apps Script** — API za preuzimanje arhivskih podataka u JSON formatu.
- **Cloudflare Pages** — podržana opcija za hosting statičke internet prezentacije.

Dodatni resursi:
- **Google Fonts** — font Titillium Web.
- **FlagCDN** — slike zastava država.

## ⚙️ Kako funkcioniše arhiva?

Podaci o trkama organizovani su u Google Sheets tabeli, dok Google Apps Script omogućava njihovo preuzimanje putem API-ja.

Prilikom učitavanja stranice:

1. JavaScript proverava da li postoje prethodno sačuvani podaci u lokalnom skladištu pregledača.
2. Ako je keš svež, koristi se postojeća verzija arhive.
3. U suprotnom, podaci se preuzimaju iz Google Apps Script API-ja.
4. Preuzeti podaci se obrađuju i sortiraju prema sezoni i datumu.
5. Arhiva se prikazuje od najnovijih ka najstarijim trkama, uz postepeno učitavanje kartica.

Pretraga i filtriranje obavljaju se lokalno u internet pregledaču.

 
 ## 🚀 Pokretanje projekta

Projekat je napravljen kao statička internet prezentacija i ne zahteva posebnu serversku aplikaciju za prikaz HTML, CSS i JavaScript sadržaja.

Za povezivanje arhive potrebno je:

1. Pripremiti Google Sheets tabelu sa podacima o trkama.
2. Povezati tabelu sa Google Apps Script projektom.
3. Objaviti Apps Script kao Web App i dobiti API adresu.
4. Podesiti API adresu u fajlu `js/api.js`.
5. Postaviti projekat na statički hosting ili lokalni razvojni server.

**Napomena:** API treba da vraća javne podatke namenjene prikazu u arhivi. U Google tabelu ne treba unositi privatne ili poverljive informacije.

## 🏎️ O projektu

FORMULACIJA je nastala kao nezavisan fanovski projekat, sa ciljem da arhivski sadržaji Formule 1 budu organizovaniji i dostupniji ljubiteljima motosporta.

Ideja je jednostavna: pronaći željenu sezonu, Veliku nagradu ili sesiju i vratiti se trenucima koji su obeležili istoriju ovog sporta.

## ⚖️ Napomena o pravima

FORMULACIJA je nezavisan projekat i nije zvanično povezana sa Formula 1, FIA, Formula One Management, Liberty Media, timovima ili televizijskim emiterima.

Projekat ne skladišti video-snimke na sopstvenim serverima, već prikazuje informacije i linkove ka spoljnim platformama. Prava na video-snimke, žigove, logotipe i druge zaštićene materijale pripadaju njihovim odgovarajućim nosiocima.

Više informacija nalazi se na stranici **Pravne informacije** na internet prezentaciji.

---

**FORMULACIJA — Arhiva Formule 1**

*Strast prema brzini. Sećanje na istoriju. Sve trke na jednom mestu.* 🏁
