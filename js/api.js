// Link iz APPSCRIPT-a (Google Sheets) preko kojeg dobijamo informacije o trkama i linkovima ka snimcima
const API_URL = "https://script.google.com/macros/s/AKfycbz0XKdsMCumankM6C8dg4TR4yw-JjEUDaXw8Mgriv32t-phVn0T92o6sA-Cg1-teBh90w/exec";

const CACHE_KEY = "formulacija-cache-v1";
const CACHE_TIME = 1000 * 60 * 2; // 2 minuta

// Popunjava se kad stignu podaci iz tabele
let VIDEOS = [];

const SES_ORDER = ["Kvalifikacije", "Sprint", "Trka"];
const MON = ["januara", "februara", "marta", "aprila", "maja", "juna", "jula", "avgusta", "septembra", "oktobra", "novembra", "decembra"];

/* Ucitavanje */
function readCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (parsed && Array.isArray(parsed.data)) return parsed;
  } catch (e) {}
  return null;
}

async function loadVideos() {
  if (!API_URL) throw new Error("API_URL nije podesen u api.js");

  // svez kes (manje od 2 minuta): ne zovemo API
  const cached = readCache();
  if (cached && Date.now() - cached.time < CACHE_TIME) return normalize(cached.data);

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API: HTTP " + res.status);
    const raw = await res.json();
    if (!Array.isArray(raw)) throw new Error("API nije vratio listu");
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data: raw }));
    } catch (e) {}
    return normalize(raw);
  } catch (err) {
    // API ne radi: prikazi poslednje sacuvane podatke, bilo koje starosti
    if (cached) {
      console.warn("API nije dostupan, prikazujem sačuvane podatke:", err);
      return normalize(cached.data);
    }
    throw err;
  }
}
 
/* ciscenje unosa */
const clean = s => String(s ?? "").trim().replace(/\s+/g, " ");
const key = s => clean(s).toLocaleLowerCase("sr");
 
// "spa" == "Spa", ali "SAD" i "Velika Britanija" ostaju kakvi su
const pretty = s => s === s.toLocaleLowerCase("sr")
  ? s.replace(/(^|[\s-])(\S)/g, (m, a, b) => a + b.toLocaleUpperCase("sr"))
  : s;
 
// isto ime napisano drugacije (spa / Spa / SPA) postaje jedna stvar (Spa)
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
      flag: clean(r.zastava),   // opciono: skracenica kod drzave, npr. ae
      _ts: d ? +d : 0,
      _idx: idx
    });
  });
 
  // najnovije prvo: sezona, datum, sesija, pa redosled unosa
  return out.sort((a, b) =>
    (+b.season - +a.season) || (b._ts - a._ts) ||
    (rank(b.session) - rank(a.session)) || (b._idx - a._idx));
}