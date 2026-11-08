// Link dobijen posle deploy-a Apps Script web app-a (zavrsava se na /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbz_jtk_DZGO12gmC2ZRJjzvbbgBMGwpRRzoSA01a2cNBAN6iZUcMhd8D6iW3UaXXa9WVQ/exec";

const CACHE_KEY = "formulacija-cache";
const CACHE_TIME = 1000 * 60 * 2; // 2 minuta

// Popunjava se kad stignu podaci iz tabele (vidi script.js)
let VIDEOS = [];
 
const SES_ORDER = ["Kvalifikacije", "Sprint", "Trka"];
const MON = ["januara", "februara", "marta", "aprila", "maja", "juna", "jula", "avgusta", "septembra", "oktobra", "novembra", "decembra"];
 
/* ---------- ucitavanje ---------- */
async function loadVideos() {
  if (!API_URL) throw new Error("API_URL nije podesen u api.js");

  // Provera keša
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    try {
      const parsed = JSON.parse(cache);
      if (parsed && parsed.time && (Date.now() - parsed.time < CACHE_TIME) && parsed.data) {
        return normalize(parsed.data);
      }
    } catch (e) {
      // Ako je keš oštećen, nastavlja se dalje ka API-ju
    }
  }

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("API: HTTP " + res.status);
  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error("API nije vratio listu");

  // Upis u keš
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        time: Date.now(),
        data: raw
      })
    );
  } catch (e) {
    // Ignoriši grešku ako je localStorage pun
  }

  return normalize(raw);
}
 
/* ---------- ciscenje unosa ---------- */
const clean = s => String(s ?? "").trim().replace(/\s+/g, " ");
const key = s => clean(s).toLocaleLowerCase("sr");
 
// "spa" -> "Spa", ali "SAD" i "Velika Britanija" ostaju kakvi su
const pretty = s => s === s.toLocaleLowerCase("sr")
  ? s.replace(/(^|[\s-])(\S)/g, (m, a, b) => a + b.toLocaleUpperCase("sr"))
  : s;
 
// isto ime napisano drugacije (spa / Spa / SPA) postaje jedna stavka
const canon = (map, v) => {
  const k = key(v);
  if (!map.has(k)) map.set(k, pretty(clean(v)));
  return map.get(k);
};
 
function fixLink(s) {
  s = clean(s);
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    return /^https?:$/.test(u.protocol) ? u.href : "";
  } catch { return ""; }
}
 
function parseDate(s) {
  s = clean(s);
  let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return new Date(+m[1], +m[2] - 1, +m[3]);
  if ((m = s.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/))) return new Date(+m[3], +m[2] - 1, +m[1]);
  if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) return new Date(+m[3], +m[1] - 1, +m[2]);
  return null;
}
 
const formatDate = d => d ? `${d.getDate()}. ${MON[d.getMonth()]} ${d.getFullYear()}.` : "";
const rank = s => { const i = SES_ORDER.indexOf(s); return i < 0 ? 99 : i; };
 
// redovi iz tabele (kolone: sezona, vn, sesija, komentator, link, datum, trajanje)
// -> objekti koje koristi script.js
function normalize(raw) {
  const gps = new Map(), coms = new Map();
  const ses = new Map(SES_ORDER.map(s => [key(s), s]));
  const out = [];
 
  raw.forEach((r, idx) => {
    const season = clean(r.sezona), gp = clean(r.vn ?? r["velika nagrada"]), session = clean(r.sesija), link = fixLink(r.link);
    if (!season || !gp || !session || !link) return;   // nepotpun red se preskace
    const d = parseDate(r.datum);
    out.push({
      season,
      gp: canon(gps, gp),
      session: canon(ses, session),
      commentator: canon(coms, r.komentator),
      link,
      date: formatDate(d),
      duration: clean(r.trajanje),
      flag: clean(r.zastava),   // opciono: ISO kod drzave, npr. ae
      _ts: d ? +d : 0,
      _idx: idx
    });
  });
 
  // najnovije prvo: sezona, datum, sesija, pa redosled unosa
  return out.sort((a, b) =>
    (+b.season - +a.season) || (b._ts - a._ts) ||
    (rank(b.session) - rank(a.session)) || (b._idx - a._idx));
}