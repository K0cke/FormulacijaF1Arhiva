// =====================================================
// ZASTAVE ZA VELIKE NAGRADE
// Svaka kartica dobija zastavu drzave u pozadini slike.
// Slike dolaze sa flagcdn.com. Ako zelis svoje slike (iz foldera), promeni samo FLAG_URL:
//   const FLAG_URL = code => `./img/flags/${code}.png`;
// =====================================================
const FLAG_URL = code => `https://flagcdn.com/w640/${code}.png`;

// mala slova, bez kvacica: "Mađarska" == "madjarska"
const norm = s => String(s ?? "").trim().toLocaleLowerCase("sr")
  .replace(/đ/g, "dj").replace(/[čć]/g, "c").replace(/š/g, "s").replace(/ž/g, "z")
  .replace(/\s+/g, " ");


// Ako VN fali, dodaj red ovde
const GP_COUNTRY = [
  ["Australije", "au"], ["Melburna", "au"], ["Adelejda", "au"],
  ["Kine", "cn"], ["Šangaja", "cn"], ["Sangaja", "cn"], ["Šangaja", "cn"], 
  ["Japana", "jp"], ["Suzuke", "jp"], ["Pacifika", "jp"], ["Fudžija", "jp"],
  ["Bahreina", "bh"],
  ["Saudijska Arabije", "sa"], ["Džede", "sa"],
  ["SAD", "us"], ["Sjedinjenih Država", "us"], ["Amerike", "us"], ["Majamija", "us"], ["Miami", "us"], ["Austina", "us"], ["Teksasa", "us"], ["Las Vegasa", "us"], ["Detroita", "us"], ["Dalasa", "us"], ["Indijanapolisa", "us"],
  ["Italije", "it"], ["Monce", "it"], ["Monza", "it"], ["Emilija-Romanje", "it"], ["Imole", "it"], ["Toskane", "it"],
  ["San Marina", "sm"],
  ["Monaka", "mc"],
  ["Španije", "es"], ["Barselone", "es"], ["Madrida", "es"],
  ["Kanade", "ca"], ["Montreala", "ca"],
  ["Austrije", "at"], ["Špilberga", "at"],
  ["Velike Britanije", "gb"], ["Britanije", "gb"], ["Silverstona", "gb"], ["Silverston", "gb"], ["Engleske", "gb"], 
  ["Belgije", "be"], ["Spa", "be"], ["Spa-Frankoršana", "be"],
  ["Mađarske", "hu"], ["Madjarske", "hu"],
  ["Holandije", "nl"], ["Zandvorta", "nl"],
  ["Azerbejdžana", "az"], ["Bakua", "az"], ["Azerbejdzana", "az"],
  ["Singapura", "sg"],
  ["Meksika", "mx"],
  ["Brazila", "br"], ["Interlagosa", "br"], ["Sao Paula", "br"],
  ["Katara", "qa"],
  ["Abu Dabi", "ae"], ["Abu Dabija", "ae"] ,["Abu Dhabi", "ae"], ["UAE", "ae"],
  ["Francuske", "fr"], ["Nemačke", "de"], ["Evrope", "de"], ["Nirburgringa", "de"], ["Hokenhajma", "de"],
  ["Portugala", "pt"], ["Turske", "tr"], ["Rusije", "ru"], ["Sočija", "ru"],
  ["Malezije", "my"], ["Južne Koreje", "kr"], ["Indije", "in"], ["Argentine", "ar"],
  ["Švedske", "se"], ["Švajcarske", "ch"], ["Maroka", "ma"], ["Luksemburga", "lu"], ["Južne Afrike", "za"]
];

const FLAG_MAP = new Map(GP_COUNTRY.map(([name, code]) => [norm(name), code]));


function flagFor(gp, override) {
  const o = norm(override);
  if (/^[a-z]{2}(-[a-z]{2,3})?$/.test(o)) return o;
  return FLAG_MAP.get(norm(gp)) || "";
}