const GP = [
  ["Australija", "03-16"], ["Kina", "03-23", 1], ["Japan", "04-06"], 
  ["Bahrein", "04-13"], ["Saudijska Arabija", "04-20"], ["Majami", "05-04", 1], 
  ["Emilija-Romanja", "05-18"], ["Monako", "05-25"], ["Španija", "06-01"], 
  ["Kanada", "06-15"], ["Austrija", "06-29"], ["Velika Britanija", "07-06"], 
  ["Belgija", "07-27", 1], ["Mađarska", "08-03"], ["Holandija", "08-31"], 
  ["Italija", "09-07"], ["Azerbejdžan", "09-21"], ["Singapur", "10-05"], 
  ["SAD", "10-19", 1], ["Meksiko", "10-26"], ["Brazil", "11-09", 1], 
  ["Las Vegas", "11-22"], ["Katar", "11-30", 1], ["Abu Dabi", "12-07"]
];

const SES = ["Sve", "Kvalifikacije", "Sprint", "Trka"];

const DESC = {
  Kvalifikacije: "Cela kvalifikaciona sesija, od prvog do poslednjeg kruga.",
  Sprint: "Sprint trka od starta do cilja, sa svim duelima.",
  Trka: "Cela trka od formacionog kruga do kockaste zastave."
};

const COL = {
  Kvalifikacije: ["#2a0509", "#6a0610"],
  Sprint: ["#7a0610", "#c40a14"],
  Trka: ["#9b000c", "#e10600"]
};

const MON = [
  "januara", "februara", "marta", "aprila", "maja", "juna", 
  "jula", "avgusta", "septembra", "oktobra", "novembra", "decembra"
];

const st = { season: "2025", gp: "", ses: "Sve", q: "", n: 9 };
const $ = id => document.getElementById(id);
let shown = [];

function all() {
  const out = [];
  
  GP.forEach(([g, d, sp], i) => {
    const [m, dd] = d.split("-").map(Number);
    
    ["Kvalifikacije", ...(sp ? ["Sprint"] : []), "Trka"].forEach((s, k) => {
      const base = { Kvalifikacije: 14, Sprint: 16, Trka: 24 }[s] + ((i * 7 + k * 3) % (s === "Trka" ? 30 : 9));
      
      out.push({
        g, 
        s, 
        k, 
        dt: new Date(+st.season, m - 1, dd + (s === "Trka" ? 0 : -1)),
        title: `VN ${g} ${st.season}: ${s}`,
        dur: `${String(base).padStart(2, "0")}:${String((i * 13 + k * 17) % 60).padStart(2, "0")} min`
      });
    });
  });
  
  return out.sort((a, b) => b.dt - a.dt || b.k - a.k);
}

const pl = n => n === 1 ? "snimak" : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 > 20)) ? "snimka" : "snimaka";

function render() {
  const q = st.q.trim().toLowerCase();
  
  const list = all().filter(v => 
    (!st.gp || v.g === st.gp) && 
    (st.ses === "Sve" || v.s === st.ses) && 
    (!q || (v.title + " " + DESC[v.s]).toLowerCase().includes(q))
  );
  
  const limited = !st.gp && !q;
  shown = limited ? list.slice(0, st.n) : list;
  
  $("title").textContent = st.gp ? `VN ${st.gp} ${st.season}` : q ? "Rezultati pretrage" : "Najnovije u arhivi";
  $("count").textContent = `${list.length} ${pl(list.length)}`;
  
  $("grid").innerHTML = shown.length ? shown.map((v, i) => {
    const [c1, c2] = COL[v.s];
    return `
      <button class="card" type="button" data-i="${i}">
        <div class="thumb" style="--c1:${c1};--c2:${c2}">
          <span class="tag">${v.s}</span>
          <b>${v.g}</b>
          <span class="play">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" style="margin-left:3px">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </span>
        </div>
        <div class="info">
          <h3>${v.title}</h3>
          <p>${DESC[v.s]}</p>
          <div class="meta">
            <span>${v.dt.getDate()}. ${MON[v.dt.getMonth()]} ${v.dt.getFullYear()}.</span>
            <em>${v.dur}</em>
          </div>
        </div>
      </button>
    `;
  }).join("") : `<p class="empty">Nema snimaka za ovaj izbor. Probaj drugu sesiju ili Veliku nagradu.</p>`;
  
  $("more").hidden = !(limited && list.length > shown.length);
  [...$("seg").children].forEach(b => b.setAttribute("aria-pressed", b.textContent === st.ses));
}

// Inicijalizacija i događaji
$("gp").innerHTML = `<option value="">Sve Velike nagrade</option>` + GP.map(g => `<option>${g[0]}</option>`).join("");
$("seg").innerHTML = SES.map(s => `<button type="button">${s}</button>`).join("");

$("season").onchange = e => { st.season = e.target.value; st.n = 9; render(); };
$("gp").onchange = e => { st.gp = e.target.value; render(); };
$("q").oninput = e => { st.q = e.target.value; st.n = 9; render(); };
$("seg").onclick = e => { if (e.target.tagName === "BUTTON") { st.ses = e.target.textContent; render(); } };
$("more").onclick = () => { st.n += 9; render(); };

$("grid").onclick = e => {
  const c = e.target.closest(".card");
  if (!c) return;
  $("ptitle").textContent = shown[+c.dataset.i].title;
  $("player").showModal();
};

$("close").onclick = () => $("player").close();
$("player").onclick = e => { if (e.target.id === "player") e.target.close(); };

render();


const bar = document.querySelector(".bar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 120) {
    bar.classList.add("fixed");
  } else {
    bar.classList.remove("fixed");
  }
});


const homeLink = document.getElementById("nav-home");
const arhivaLink = document.getElementById("nav-arhiva");
const aboutLink = document.getElementById("nav-about");
const aboutSection = document.getElementById("o-nama-sekcija");

function updateActiveNav() {

    const scroll = window.scrollY;
    const trigger = aboutSection.offsetTop - 600;

    homeLink.classList.remove("active");
    arhivaLink.classList.remove("active");
    aboutLink.classList.remove("active");

    if (scroll < 10) {
        homeLink.classList.add("active");
    } 
    else if (scroll >= trigger) {
        aboutLink.classList.add("active");
    } 
    else {
        arhivaLink.classList.add("active");
    }
}

window.addEventListener("scroll", updateActiveNav);
window.addEventListener("resize", updateActiveNav);

updateActiveNav();