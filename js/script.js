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

const warned = new Set();

const uniq = arr => [...new Set(arr)];

const pl = n => n === 1 ? "snimak" : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 > 20)) ? "snimka" : "snimaka";

// za pretragu: mala slova i bez kvacica
const fold = s => key(s)
  .replace(/đ/g, "dj")
  .replace(/[čć]/g, "c")
  .replace(/š/g, "s")
  .replace(/ž/g, "z");


// SEZONE

function getSeasons() {
  return uniq(VIDEOS.map(v => v.season)).sort((a, b) => b - a);
}

function populateSeasons() {
  const seasons = getSeasons();

  $("season").innerHTML =
    `<option value="">Sve sezone</option>` +
    seasons.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("");

  // Pocetno stanje: prikazuju se sve sezone, sve velike nagrade, svi komentatori i sve sesije
  st.season = "";
  $("season").value = "";
}


// VELIKE NAGRADE

function populateGP() {

  const gps = uniq(
    VIDEOS
      .filter(v => !st.season || v.season === st.season)
      .map(v => v.gp)
  );

  $("gp").innerHTML =
    `<option value="">Sve Velike nagrade</option>` +
    gps.map(gp =>
      `<option value="${esc(gp)}">${esc(gp)}</option>`
    ).join("");

  st.gp = "";
  $("gp").value = "";
}


//komentatori

function populateCommentators() {

  const list = uniq(
    VIDEOS
      .filter(v =>
        (!st.season || v.season === st.season) &&
        (!st.gp || v.gp === st.gp)
      )
      .map(v => v.commentator)
      .filter(Boolean)
  );

  $("commentator").innerHTML =
    `<option value="">Svi komentatori</option>` +
    list.map(c =>
      `<option value="${esc(c)}">${esc(c)}</option>`
    ).join("");


  if (!list.includes(st.commentator)) {
    st.commentator = "";
  }

  $("commentator").value = st.commentator;
}


// sesije

function populateSessions() {

  const list = uniq(
    VIDEOS
      .filter(v =>
        (!st.season || v.season === st.season) &&
        (!st.gp || v.gp === st.gp) &&
        (!st.commentator || v.commentator === st.commentator)
      )
      .map(v => v.session)
  ).sort((a, b) => rank(a) - rank(b));

  if (!list.includes(st.session)) {
    st.session = "";
  }

  $("seg").innerHTML = ["", ...list].map(s =>
    `<button type="button"
      data-s="${esc(s)}"
      aria-pressed="${s === st.session}">
      ${s ? esc(s) : "Sve"}
    </button>`
  ).join("");
}


// prikaz kartica

function renderCards() {

  const words = fold(st.q).split(" ").filter(Boolean);


  const filtered = words.length

    ? VIDEOS.filter(video => {
        const hay = fold([
          video.season,
          video.gp,
          video.session,
          video.commentator
        ].join(" "));

        return words.every(w => hay.includes(w));
      })

    : VIDEOS.filter(video =>
        (!st.season || video.season === st.season) &&
        (!st.gp || video.gp === st.gp) &&
        (!st.commentator || video.commentator === st.commentator) &&
        (!st.session || video.session === st.session)
      );

  // prikazuju se samo prvih 9 kartica, a ostale se prikazuju klikom na dugme "Prikaži još"
  const shown = filtered.slice(0, st.n);


  // naslov arhive

  if (words.length) {
    $("title").textContent = "Rezultati pretrage";

  } else if (st.gp && st.season) {
    $("title").textContent = `VN ${st.gp} ${st.season}`;

  } else if (st.gp) {
    $("title").textContent = `VN ${st.gp}`;

  } else if (st.season) {
    $("title").textContent = `Sezona ${st.season}`;

  } else {
    $("title").textContent = "Sve trke u arhivi";
  }


  // broj rezultata

  $("count").textContent =
    `${filtered.length} ${pl(filtered.length)}`;

  $("more").style.display =
    filtered.length > shown.length ? "block" : "none";


  // prazna arhiva

  if (!shown.length) {

    $("grid").innerHTML =
      `<p class="empty">${
        VIDEOS.length
          ? "Nema snimaka za ovaj izbor."
          : "Arhiva je trenutno prazna."
      }</p>`;

    return;
  }


  //kartice

  $("grid").innerHTML = shown.map(video => {

    const colors = COL[video.session] ||
      ["#9b000c", "#e10600"];

    // zastave drzava kao pozadine videa

    const flag = flagFor(video.gp, video.flag);

    if (!flag && !warned.has(video.gp)) {
      warned.add(video.gp);

      console.warn(
        "Nema zastave za VN:",
        video.gp,
        "- dodaj je u zastave.js ili u kolonu 'zastava'"
      );
    }

    const bg = flag
      ? `background:linear-gradient(180deg,rgba(14,14,17,.12) 0%,rgba(14,14,17,.82) 100%),url('${FLAG_URL(flag)}') center/cover no-repeat;`
      : "";

    return `
      <a class="card"
         href="${esc(video.link)}"
         target="_blank"
         rel="noopener noreferrer">

        <div class="thumb"
             style="--c1:${colors[0]};--c2:${colors[1]};${bg}">

          <span class="tag">${esc(video.session)}</span>
          <b>${esc(video.gp)}</b>

        </div>

        <div class="info">

          <h3>VN ${esc(video.gp)} ${esc(video.season)}</h3>

          ${DESC[video.session]
            ? `<p>${DESC[video.session]}</p>`
            : ""}

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


// osvezavanje filtera i prikaza kartica

function refresh() {

  st.q = "";
  $("q").value = "";

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


// ucitavanje arhive text

$("grid").innerHTML =
  `<p class="empty">Učitavanje arhive…</p>`;

$("more").style.display = "none";

loadVideos()

  .then(videos => {

    VIDEOS = videos;

    //prvobitno se prikazuju sve sezone, sve velike nagrade, svi komentatori i sve sesije

    init();

  })

  .catch(err => {

    console.error(err);

    $("grid").innerHTML =
      `<p class="empty">
        Arhiva trenutno nije dostupna.
        Probaj ponovo za nekoliko minuta.
      </p>`;

  });


//promena filtera

//sezona

$("season").onchange = e => {

  st.season = e.target.value;

  populateGP();

  refresh();
};


//velika nagrada

$("gp").onchange = e => {

  st.gp = e.target.value;

  refresh();
};


//komentator

$("commentator").onchange = e => {

  st.commentator = e.target.value;

  refresh();
};


//tip sesija

$("seg").onclick = e => {

  const b = e.target.closest("button");

  if (!b) return;

  st.session = b.dataset.s;

  st.q = "";
  $("q").value = "";

  st.n = PAGE;

  populateSessions();

  renderCards();
};


//prikazi jos dugme

$("more").onclick = () => {

  st.n += PAGE;

  renderCards();
};


// pretraga

$("q").oninput = e => {

  st.q = e.target.value;

  st.n = PAGE;

  renderCards();
};


//fiksni navbar (kada se skroluje dole, navbar ostaje na vrhu)

const bar = document.querySelector(".bar");

window.addEventListener("scroll", () => {

  if (window.scrollY > 120) {
    bar.classList.add("fixed");
  } else {
    bar.classList.remove("fixed");
  }

});
