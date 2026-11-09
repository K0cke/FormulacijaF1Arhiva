const $ = id => document.getElementById(id);

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

const PAGE = 9;   // koliko kartica se prikazuje odjednom

const st = {
  season: "",
  gp: "",
  commentator: "",
  session: "",
  q: "",
  n: PAGE
};

// bezbedan ispis teksta (apostrof, navodnik, < >)
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

const warned = new Set();   // da se upozorenje o VN bez zastave ispise samo jednom

const uniq = arr => [...new Set(arr)];
const pl = n => n === 1 ? "snimak" : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 > 20)) ? "snimka" : "snimaka";

// za pretragu: mala slova i bez kvacica, pa "madjarska" == "Mađarska"
const fold = s => key(s)   // key() je u api.js
  .replace(/đ/g, "dj").replace(/[čć]/g, "c").replace(/š/g, "s").replace(/ž/g, "z");

function getSeasons() {
  return uniq(VIDEOS.map(v => v.season)).sort((a, b) => b - a);
}

function populateSeasons() {
  const seasons = getSeasons();

  $("season").innerHTML = seasons
    .map(s => `<option>${esc(s)}</option>`)
    .join("");

  st.season = seasons[0] || "";
}

function populateGP() {
  const gps = uniq(
    VIDEOS
      .filter(v => v.season === st.season)
      .map(v => v.gp)
  );

  $("gp").innerHTML =
    `<option value="">Sve Velike nagrade</option>` +
    gps.map(gp => `<option value="${esc(gp)}">${esc(gp)}</option>`).join("");

  st.gp = "";
}

// komentatori se uzimaju iz podataka za izabranu sezonu (i VN, ako je izabrana)
function populateCommentators() {
  const list = uniq(
    VIDEOS
      .filter(v => v.season === st.season && (!st.gp || v.gp === st.gp))
      .map(v => v.commentator)
      .filter(Boolean)
  );

  $("commentator").innerHTML =
    `<option value="">Svi komentatori</option>` +
    list.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");

  // ako izabrani komentator ne postoji u novom izboru, vrati na "Svi"
  if (!list.includes(st.commentator)) st.commentator = "";
  $("commentator").value = st.commentator;
}

// dugmad sesije (Kvalifikacije / Sprint / Trka) - prikazuju se samo one koje postoje
function populateSessions() {
  const list = uniq(
    VIDEOS
      .filter(v =>
        v.season === st.season &&
        (!st.gp || v.gp === st.gp) &&
        (!st.commentator || v.commentator === st.commentator))
      .map(v => v.session)
  ).sort((a, b) => rank(a) - rank(b));   // rank() je u api.js

  if (!list.includes(st.session)) st.session = "";

  $("seg").innerHTML = ["", ...list].map(s =>
    `<button type="button" data-s="${esc(s)}" aria-pressed="${s === st.session}">${s ? esc(s) : "Sve"}</button>`
  ).join("");
}

function renderCards() {
  const words = fold(st.q).split(" ").filter(Boolean);

  // dok se nesto kuca u pretragu, trazi se kroz celu arhivu
  const filtered = words.length
    ? VIDEOS.filter(video => {
        const hay = fold([video.season, video.gp, video.session, video.commentator].join(" "));
        return words.every(w => hay.includes(w));
      })
    : VIDEOS.filter(video =>
        video.season === st.season &&
        (!st.gp || video.gp === st.gp) &&
        (!st.commentator || video.commentator === st.commentator) &&
        (!st.session || video.session === st.session)
      );
  const shown = filtered.slice(0, st.n);

  $("title").textContent = words.length ? "Rezultati pretrage"
    : st.gp ? `VN ${st.gp} ${st.season}` : `Sezona ${st.season}`;
  $("count").textContent = `${filtered.length} ${pl(filtered.length)}`;
  $("more").style.display = filtered.length > shown.length ? "block" : "none";

  if (!shown.length) {
    $("grid").innerHTML = `<p class="empty">${VIDEOS.length ? "Nema snimaka za ovaj izbor." : "Arhiva je trenutno prazna."}</p>`;
    return;
  }

  $("grid").innerHTML = shown.map(video => {
    const colors = COL[video.session] || ["#9b000c", "#e10600"];

    // zastava drzave kao pozadina
    const flag = flagFor(video.gp, video.flag);
    if (!flag && !warned.has(video.gp)) {
      warned.add(video.gp);
      console.warn("Nema zastave za VN:", video.gp, "- dodaj je u zastave.js ili u kolonu 'zastava'");
    }
    const bg = flag
      ? `background:linear-gradient(180deg,rgba(14,14,17,.12) 0%,rgba(14,14,17,.82) 100%),url('${FLAG_URL(flag)}') center/cover no-repeat;`
      : "";

    return `
      <a class="card" href="${esc(video.link)}" target="_blank" rel="noopener noreferrer">

        <div class="thumb" style="--c1:${colors[0]};--c2:${colors[1]};${bg}">
          <span class="tag">${esc(video.session)}</span>
          <b>${esc(video.gp)}</b>
        </div>

        <div class="info">
          <h3>VN ${esc(video.gp)} ${esc(video.season)}</h3>

          ${DESC[video.session] ? `<p>${DESC[video.session]}</p>` : ""}

          ${video.commentator ? `
            <p style="color:#e10600;font-weight:600;">
              Komentator: ${esc(video.commentator)}
            </p>` : ""}

          <div class="meta">
            <span>${esc(video.date || "")}</span>
            <em>${esc(video.duration || "")}</em>
          </div>
        </div>

      </a>
    `;
  }).join("");
}

// kad se promeni neki filter: osvezi zavisne filtere pa kartice
function refresh() {
  st.q = "";
  $("q").value = "";   // promena filtera brise pretragu
  populateCommentators();
  populateSessions();
  st.n = PAGE;
  renderCards();
}

function init() {
  populateSeasons();
  populateGP();
  refresh();
}

$("grid").innerHTML = `<p class="empty">Učitavanje arhive…</p>`;
$("more").style.display = "none";

loadVideos()
  .then(videos => { VIDEOS = videos; init(); })
  .catch(err => {
    console.error(err);
    $("grid").innerHTML = `<p class="empty">Arhiva trenutno nije dostupna. Probaj ponovo za nekoliko minuta.</p>`;
  });

$("season").onchange = e => {
  st.season = e.target.value;
  populateGP();
  refresh();
};

$("gp").onchange = e => {
  st.gp = e.target.value;
  refresh();
};

$("commentator").onchange = e => {
  st.commentator = e.target.value;
  refresh();
};

$("seg").onclick = e => {
  const b = e.target.closest("button");
  if (!b) return;
  st.session = b.dataset.s;
  st.q = "";
  $("q").value = "";
  st.n = PAGE;
  populateSessions();   // samo da se osvezi istaknuto dugme
  renderCards();
};

$("more").onclick = () => {
  st.n += PAGE;
  renderCards();
};

$("q").oninput = e => {
  st.q = e.target.value;
  st.n = PAGE;
  renderCards();
};

// fiksni navbar kad se skroluje
const bar = document.querySelector(".bar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 120) {
    bar.classList.add("fixed");
  } else {
    bar.classList.remove("fixed");
  }
});

