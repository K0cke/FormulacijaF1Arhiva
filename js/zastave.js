// =====================================================
// ZASTAVE ZA VELIKE NAGRADE
// Svaka kartica dobija zastavu drzave u pozadini slike.
// Slike dolaze sa flagcdn.com. Ako zelis svoje slike (iz foldera), promeni samo FLAG_URL:
//   const FLAG_URL = code => `./img/flags/${code}.png`;
// =====================================================
const FLAG_URL = code => `https://flagcdn.com/w640/${code}.png`;

// mala slova, bez dijakritika: "Mađarska" -> "madjarska"
const norm = s => String(s ?? "").trim().toLocaleLowerCase("sr")
  .replace(/đ/g, "dj").replace(/[čć]/g, "c").replace(/š/g, "s").replace(/ž/g, "z")
  .replace(/\s+/g, " ");

// [ime koje klijent moze da upise, ISO kod drzave]
// Ako VN fali, dodaj red ovde, ili u tabeli popuni opcionu kolonu "zastava" (npr. ae).
const GP_COUNTRY = [
  ["Australija", "au"], ["Melburn", "au"], ["Adelejd", "au"],
  ["Kina", "cn"], ["Šangaj", "cn"],
  ["Japan", "jp"], ["Suzuka", "jp"], ["Pacifik", "jp"],
  ["Bahrein", "bh"],
  ["Saudijska Arabija", "sa"], ["Džeda", "sa"],
  ["SAD", "us"], ["Sjedinjene Države", "us"], ["Amerika", "us"], ["Majami", "us"], ["Austin", "us"], ["Teksas", "us"], ["Las Vegas", "us"], ["Detroit", "us"], ["Dalas", "us"],
  ["Italija", "it"], ["Monca", "it"], ["Monza", "it"], ["Emilija-Romanja", "it"], ["Imola", "it"], ["Toskana", "it"],
  ["San Marino", "sm"],
  ["Monako", "mc"],
  ["Španija", "es"], ["Barselona", "es"],
  ["Kanada", "ca"], ["Montreal", "ca"],
  ["Austrija", "at"], ["Špilberg", "at"],
  ["Velika Britanija", "gb"], ["Britanija", "gb"], ["Silverstoun", "gb"],
  ["Belgija", "be"], ["Spa", "be"], ["Spa-Frankoršamp", "be"],
  ["Mađarska", "hu"],
  ["Holandija", "nl"], ["Zandvort", "nl"],
  ["Azerbejdžan", "az"], ["Baku", "az"],
  ["Singapur", "sg"],
  ["Meksiko", "mx"],
  ["Brazil", "br"], ["Interlagos", "br"], ["Sao Paulo", "br"],
  ["Katar", "qa"],
  ["Abu Dabi", "ae"], ["Abu Dhabi", "ae"], ["UAE", "ae"],
  ["Francuska", "fr"], ["Nemačka", "de"], ["Evropa", "de"], ["Nirburgring", "de"], ["Hokenhajm", "de"],
  ["Portugalija", "pt"], ["Turska", "tr"], ["Rusija", "ru"], ["Soči", "ru"],
  ["Malezija", "my"], ["Koreja", "kr"], ["Indija", "in"], ["Argentina", "ar"],
  ["Švedska", "se"], ["Švajcarska", "ch"], ["Maroko", "ma"], ["Luksemburg", "lu"], ["Južna Afrika", "za"]
];

const FLAG_MAP = new Map(GP_COUNTRY.map(([name, code]) => [norm(name), code]));

// override = opciona kolona "zastava" iz tabele (ISO kod, npr. "ae")
function flagFor(gp, override) {
  const o = norm(override);
  if (/^[a-z]{2}(-[a-z]{2,3})?$/.test(o)) return o;
  return FLAG_MAP.get(norm(gp)) || "";
}