/* =====================================================================
   HEMŞİRELİK AKADEMİ - OYUN MOTORU
   ===================================================================== */
const SURUM = "1.2.0";
const TASARIMCI = "HANSoft";
const KAYIT_ANAHTAR = "hemsire_akademi_v1";
const HARF = ["A", "B", "C", "D", "E"];
const VAKA_ADET = 10;
const ESLES_ADET = 6;
const ARENA_ADET = 10;
const MARATON_ADET = 30;

const el = (id) => document.getElementById(id);
const karistir = (dizi) => {
  const d = dizi.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
};
const tarihBugun = () => {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};
const gunEkle = (gun, n) => {
  const d = new Date(gun + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

/* ---------------- KAYIT ---------------- */
const VARSAYILAN = {
  xp: 0, seri: 0, enUzunSeri: 0, toplam: 0, dogru: 0,
  kat: {}, defter: {}, vakaBiten: {}, rozetler: {}, favori: {}, gunler: {},
  gunSeri: 0, sonOynama: "", gunVaka: "", tamTur: 0,
  ayarlar: { ses: true, sure: 30, titre: true, hareket: true, tema: "koyu" }
};

function kayitOku() {
  const bos = () => JSON.parse(JSON.stringify(VARSAYILAN));
  try {
    const ham = localStorage.getItem(KAYIT_ANAHTAR);
    if (!ham) return bos();
    const d = JSON.parse(ham) || {};
    return {
      ...bos(), ...d,
      ayarlar: { ...VARSAYILAN.ayarlar, ...(d.ayarlar || {}) },
      kat: d.kat || {}, defter: d.defter || {}, vakaBiten: d.vakaBiten || {},
      rozetler: d.rozetler || {}, favori: d.favori || {}, gunler: d.gunler || {}
    };
  } catch (e) { return bos(); }
}

let D = kayitOku();
const kaydet = () => { try { localStorage.setItem(KAYIT_ANAHTAR, JSON.stringify(D)); } catch (e) { } };

function seviyeHesapla(xp) {
  let lv = 1, kalan = xp, gereken = 100;
  while (kalan >= gereken) { kalan -= gereken; lv++; gereken = 100 + (lv - 1) * 25; }
  return { lv, kalan, gereken };
}

/* ---------------- GÜNLÜK SERİ ---------------- */
function gunSeriIsle() {
  const b = tarihBugun();
  if (D.sonOynama === b) return D.gunSeri;
  D.gunSeri = D.sonOynama === gunEkle(b, -1) ? (D.gunSeri || 0) + 1 : 1;
  D.sonOynama = b;
  D.gunler[b] = D.gunler[b] || 0;
  kaydet();
  return D.gunSeri;
}
function gunIsle(n) {
  const b = tarihBugun();
  D.gunler[b] = (D.gunler[b] || 0) + (n || 1);
  kaydet();
}

/* ---------------- TEMA / HAREKET ---------------- */
function temaUygula() {
  const aydinlik = D.ayarlar.tema === "aydinlik";
  document.body.classList.toggle("aydinlik", aydinlik);
  document.body.classList.toggle("hareket-off", !D.ayarlar.hareket);
  el("tema-btn").textContent = aydinlik ? "☀️" : "🌙";
  el("temaRenk").setAttribute("content", aydinlik ? "#e9f0fa" : "#0e1a2e");
  ecgCiz();
}

/* ---------------- SES ---------------- */
let SesC = null;
function sesAc() {
  if (SesC === false) return null;
  if (!SesC) {
    try { SesC = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { SesC = false; return null; }
  }
  if (SesC.state === "suspended") SesC.resume();
  return SesC;
}
function bip(frek, sure, tip) {
  if (!D.ayarlar.ses) return;
  const c = sesAc();
  if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = tip || "sine";
  o.frequency.value = frek;
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.15, c.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (sure || 0.16));
  o.connect(g); g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + (sure || 0.16) + 0.03);
}
const Sesi = {
  dogru: () => { bip(660, 0.11, "triangle"); setTimeout(() => bip(880, 0.15, "triangle"), 95); },
  yanlis: () => { bip(190, 0.22, "sawtooth"); tit(30); },
  tik: () => bip(1150, 0.05, "sine"),
  kazanc: () => [523, 659, 784, 1046, 1319].forEach((f, i) => setTimeout(() => bip(f, 0.17, "triangle"), i * 85))
};
function tit(ms) {
  if (!D.ayarlar.titre) return;
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { }
}

/* ---------------- TOAST ---------------- */
function toast(yazi) {
  const t = el("toast");
  t.textContent = yazi;
  t.classList.add("gor");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("gor"), 1900);
}

/* ---------------- KONFETİ ---------------- */
function konfeti() {
  if (!D.ayarlar.hareket) return;
  const kap = el("konfeti");
  const renk = ["#22d3ee", "#818cf8", "#34d399", "#fbbf24", "#f87171", "#f472b6"];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("i");
    p.className = "konf";
    p.style.left = Math.round(Math.random() * 96) + "%";
    p.style.top = "-20px";
    p.style.background = renk[i % renk.length];
    p.style.animationDelay = (i * 22) + "ms";
    p.style.animationDuration = (700 + Math.random() * 550) + "ms";
    kap.appendChild(p);
    setTimeout(() => p.remove(), 1600);
  }
}

/* ---------------- ARKA PLAN NABIZ DALGASI ---------------- */
let ecgDurum = null;
let ecgDinle = false;
function ecgNokta(u) {
  if (u < 0.10) return Math.sin(u / 0.10 * Math.PI) * 0.11;
  if (u < 0.155) return -0.16;
  if (u < 0.195) return 1;
  if (u < 0.245) return -0.34;
  if (u < 0.315) return 0;
  if (u < 0.55) return Math.sin((u - 0.315) / 0.235 * Math.PI) * 0.24;
  return 0;
}
function ecgCiz() {
  const c = el("dalga");
  if (!c || !c.getContext) return;
  const ctx = c.getContext("2d");
  if (ecgDurum) { ecgDurum.raf && cancelAnimationFrame(ecgDurum.raf); ecgDurum.raf = null; }
  ecgDurum = { t: 0, raf: null, ctx: ctx, c: c, iw: 0, ih: 0, d: 0 };
  const boyutla = () => {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    const iw = Math.max(1, Math.round(c.clientWidth || window.innerWidth));
    const ih = Math.max(1, Math.round(c.clientHeight || window.innerHeight));
    if (iw === ecgDurum.iw && ih === ecgDurum.ih && d === ecgDurum.d) return;
    ecgDurum.iw = iw; ecgDurum.ih = ih; ecgDurum.d = d;
    c.width = Math.round(iw * d);
    c.height = Math.round(ih * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };

  const renk = () => D.ayarlar.tema === "aydinlik" ? "8,145,178" : "34,211,238";
  const ciz = () => {
    const { iw, ih } = ecgDurum;
    ctx.clearRect(0, 0, iw, ih);
    const y0 = ih * 0.62, amp = ih * 0.11;
    const orta = ih * 0.86;
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "rgba(" + renk() + ",0.85)";
    ctx.beginPath();
    for (let x = 0; x <= iw; x += 2) {
      let v = ((x / iw) * 3 - ecgDurum.t) % 3;
      if (v < 0) v += 3;
      const y = y0 - amp * ecgNokta(v);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(" + renk() + ",0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, orta); ctx.lineTo(iw, orta);
    ctx.stroke();
    if (D.ayarlar.hareket && !document.hidden) {
      ecgDurum.t += 0.0032;
      ecgDurum.raf = requestAnimationFrame(ciz);
    } else {
      ecgDurum.raf = null;
    }
  };

  const yenidenCiz = () => { boyutla(); ciz(); };
  if (!ecgDinle) {
    ecgDinle = true;
    window.addEventListener("resize", yenidenCiz, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (ecgDurum.raf) { cancelAnimationFrame(ecgDurum.raf); ecgDurum.raf = null; } }
      else if (D.ayarlar.hareket && !ecgDurum.raf) ciz();
    });
  }
  boyutla();
  ciz();
}

/* ---------------- SORU HAVUZU ---------------- */
const TUMU = SORULAR.map((s, i) => ({ s: s, id: s.k + "|" + i }));

const vakaSorulari = () => TUMU.filter(x => x.s.t === "vaka" && !D.vakaBiten[x.id]);
const bilgiHavuzu = (z) => {
  let h = TUMU.filter(x => x.s.t === "bilgi" && (!z || x.s.z === z));
  if (h.length < 10) h = TUMU.filter(x => x.s.t === "bilgi");
  return h;
};
const gununVaka = () => {
  const havuz = TUMU.filter(x => x.s.t === "vaka");
  let h = 0;
  const b = tarihBugun();
  for (let i = 0; i < b.length; i++) h = (h * 31 + b.charCodeAt(i)) >>> 0;
  return havuz[h % havuz.length];
};

/* ---------------- ROZETLER ---------------- */
const ROZETLER = [
  { id: "ilk", ad: "İlk Adım", ikon: "👣", acik: "İlk sorunu çöz", kosul: d => d.toplam >= 1 },
  { id: "m10", ad: "Alışkanlık", ikon: "🔁", acik: "10 soru çöz", kosul: d => d.toplam >= 10 },
  { id: "m50", ad: "Çalışkan", ikon: "📚", acik: "50 soru çöz", kosul: d => d.toplam >= 50 },
  { id: "m100", ad: "Efsane", ikon: "🏆", acik: "100 soru çöz", kosul: d => d.toplam >= 100 },
  { id: "seri5", ad: "Seri Başı", ikon: "🔥", acik: "5 doğru üst üste", kosul: d => d.enUzunSeri >= 5 },
  { id: "seri10", ad: "Ateş Serisi", ikon: "⚡", acik: "10 doğru üst üste", kosul: d => d.enUzunSeri >= 10 },
  { id: "seri20", ad: "Kırılmaz", ikon: "🛡️", acik: "20 doğru üst üste", kosul: d => d.enUzunSeri >= 20 },
  { id: "vaka5", ad: "Vaka Avcısı", ikon: "🚨", acik: "5 vaka çöz", kosul: d => Object.keys(d.vakaBiten).length >= 5 },
  { id: "vaka15", ad: "Vaka Ustası", ikon: "🎯", acik: "Tüm vakaları çöz", kosul: d => Object.keys(d.vakaBiten).length >= 17 },
  { id: "defter10", ad: "Defter Dolu", ikon: "📕", acik: "10 yanlışı deftere ekle", kosul: d => Object.keys(d.defter).length >= 10 },
  { id: "favori5", ad: "Koleksiyoncu", ikon: "⭐", acik: "5 soruyu yıldızla", kosul: d => Object.keys(d.favori).length >= 5 },
  { id: "g7", ad: "Yedi Gün", ikon: "📅", acik: "7 gün üst üste oyna", kosul: d => (d.gunSeri || 0) >= 7 },
  { id: "g30", ad: "Bir Ay", ikon: "🗓️", acik: "30 gün üst üste oyna", kosul: d => (d.gunSeri || 0) >= 30 },
  { id: "lv5", ad: "Yükseliş", ikon: "⭐", acik: "5. seviyeye ulaş", kosul: d => seviyeHesapla(d.xp).lv >= 5 },
  { id: "lv10", ad: "Usta", ikon: "👑", acik: "10. seviyeye ulaş", kosul: d => seviyeHesapla(d.xp).lv >= 10 },
  { id: "kesif", ad: "Keşif", ikon: "🧭", acik: "5 kategoride doğru yap", kosul: d => Object.keys(d.kat).filter(k => d.kat[k].d > 0).length >= 5 },
  { id: "tam", ad: "Yüzde Yüz", ikon: "💯", acik: "Bir turda tam doğru", kosul: d => !!d.tamTur }
];

function rozetKontrol() {
  let yeni = 0;
  ROZETLER.forEach(r => {
    if (D.rozetler[r.id]) return;
    let tamam = false;
    try { tamam = !!r.kosul(D); } catch (e) { tamam = false; }
    if (tamam) { D.rozetler[r.id] = tarihBugun(); yeni++; }
  });
  if (yeni > 0) {
    kaydet();
    const liste = ROZETLER.filter(r => D.rozetler[r.id] === tarihBugun());
    liste.slice(0, 3).forEach((r, i) => setTimeout(() => toast(r.ikon + " Rozet: " + r.ad), 400 + i * 900));
    if (yeni > 3) setTimeout(() => toast("+" + (yeni - 3) + " rozet daha açıldı!"), 400 + 3 * 900);
    Sesi.kazanc();
  }
  return yeni;
}
const rozetSayisi = () => ROZETLER.filter(r => D.rozetler[r.id]).length;

function rozetCiz() {
  el("rozet-sayi").textContent = rozetSayisi() + " / " + ROZETLER.length;
  el("rozet-izgara").innerHTML = ROZETLER.map(function (r) {
    const a = !!D.rozetler[r.id];
    return '<div class="rozetKutu' + (a ? " a" : "") + '"><div class="i">' + r.ikon + "</div>" +
      '<div class="n">' + r.ad + '</div><div class="h">' + r.acik + "</div></div>";
  }).join("");
}

/* ---------------- PROFİL ---------------- */
const UNVANLAR = [
  { e: 2, ad: "Çaylak" }, { e: 4, ad: "Stajyer" }, { e: 6, ad: "Hemşire" },
  { e: 9, ad: "Kıdemli Hemşire" }, { e: 12, ad: "Uzman Hemşire" },
  { e: 15, ad: "Başhemşire" }, { e: 19, ad: "Klinik Mentor" }, { e: 999, ad: "Hemşirelik Doçenti" }
];
const PALETLER = [
  { a: "#22d3ee", b: "#3b82f6" }, { a: "#34d399", b: "#22d3ee" },
  { a: "#fbbf24", b: "#f97316" }, { a: "#f472b6", b: "#a78bfa" },
  { a: "#a78bfa", b: "#6366f1" }
];

function unvanHesapla(lv) { return (UNVANLAR.find(u => lv <= u.e) || UNVANLAR[UNVANLAR.length - 1]).ad; }
function paletHesapla(lv) { return PALETLER[Math.min(PALETLER.length - 1, Math.floor((lv - 1) / 4))]; }

/* baş harflerden avatar üret */
function avatarCiz(lv, ad) {
  const p = paletHesapla(lv);
  const gid = "av" + lv;
  const bas = (ad || "HA").trim().split(/\s+/).map(w => w[0] || "").slice(0, 2).join("").toUpperCase();
  return '<svg viewBox="0 0 100 100" role="img" aria-label="Profil avatarı">' +
    '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="' + p.a + '"/><stop offset="1" stop-color="' + p.b + '"/>' +
    "</linearGradient></defs>" +
    '<rect width="100" height="100" fill="url(#' + gid + ')"/>' +
    '<circle cx="50" cy="38" r="20" fill="rgba(255,255,255,.9)"/>' +
    '<path d="M14 104c0-22 16-32 36-32s36 10 36 32z" fill="rgba(255,255,255,.9)"/>' +
    '<rect x="42" y="16" width="16" height="42" rx="3" fill="rgba(255,255,255,.28)"/>' +
    '<text x="50" y="94" text-anchor="middle" font-size="19" font-weight="800" ' +
    'font-family="system-ui,sans-serif" fill="rgba(4,16,32,.82)">' + bas + "</text></svg>";
}

function sayacYaz(id, hedef, ek) {
  const n = el(id);
  if (!n) return;
  const bic = D.ayarlar.hareket;
  if (!bic) { n.textContent = hedef + (ek || ""); return; }
  const bas = Number(String(n.textContent).replace(/\D/g, "")) || 0;
  const t0 = performance.now(), sure = 700;
  (function adim(t) {
    const o = Math.min(1, (t - t0) / sure);
    const g = bas + (hedef - bas) * (1 - Math.pow(1 - o, 3));
    n.textContent = Math.round(g) + (ek || "");
    if (o < 1) requestAnimationFrame(adim);
  })(t0);
}

function profilCiz() {
  const h = seviyeHesapla(D.xp);
  const oran = Math.min(1, h.kalan / h.gereken);
  const p = paletHesapla(h.lv);

  el("avatar").innerHTML = avatarCiz(h.lv, "HA");
  el("profil-unvan").textContent = unvanHesapla(h.lv);
  el("profil-lv").textContent = h.lv;
  el("profil-xp").textContent = h.kalan + " / " + h.gereken + " XP";
  el("profil-chip").innerHTML = [
    '<span class="chip altın">⭐ ' + D.xp + ' XP</span>',
    D.gunSeri > 1 ? '<span class="chip sicak">🔥 ' + D.gunSeri + ' günlük seri</span>' : "",
    '<span class="chip">🏅 ' + rozetSayisi() + " / " + ROZETLER.length + "</span>",
    '<span class="chip">📚 ' + (D.dogru + D.yanlis ? Math.round(D.dogru / (D.dogru + D.yanlis) * 100) : 0) + "% başarı</span>"
  ].join("");

  el("halka").style.strokeDashoffset = 276.5 * (1 - oran);
  el("xp-dolgu").style.width = (oran * 100) + "%";

  const t = D.toplam ? Math.round(D.dogru / D.toplam * 100) : 0;
  sayacYaz("pf-toplam", D.toplam);
  sayacYaz("pf-dogru", D.dogru);
  sayacYaz("pf-oran", t, "%");
  sayacYaz("pf-seri", D.gunSeri || 0);
  sayacYaz("pf-rozet", rozetSayisi());
  sayacYaz("pf-favori", Object.keys(D.favori).length);

  const kazanilan = ROZETLER.filter(r => D.rozetler[r.id]);
  const vitrin = el("profil-vitrin");
  if (!kazanilan.length) {
    vitrin.innerHTML = '<div class="vitrinBos">Henüz rozet yok. İlk sorunu çöz, rozetler burada birikecek!</div>';
  } else {
    vitrin.innerHTML = kazanilan.map(r =>
      '<div class="vitrinKutu a" title="' + r.acik + '"><div class="i">' + r.ikon + "</div>" +
      '<div class="n">' + r.ad + "</div></div>").join("") +
      '<div class="vitrinKutu kilit" style="grid-column:1/-1">' +
      '<div class="n">' + (ROZETLER.length - kazanilan.length) + " rozet seni bekliyor</div></div>";
  }

  el("profil-takvim").innerHTML = takvimHtml();
}

/* ---------------- GEÇİŞ ---------------- */
const EKRANLAR = { ana: "ek-ana", profil: "ek-profil", defter: "ek-defter", istat: "ek-istat", rozet: "ek-rozet", ayar: "ek-ayar", oyun: "ek-oyun" };

let defSekme = "yanlis";

function sayfaGoster(ad) {
  document.querySelectorAll(".ekran").forEach(e => e.classList.remove("aktif"));
  el(EKRANLAR[ad]).classList.add("aktif");
  el("alt-menu").style.display = (ad === "oyun") ? "none" : "flex";
  document.querySelectorAll("#alt-menu button").forEach(b =>
    b.classList.toggle("secili", b.dataset.sayfa === ad));
  if (ad === "ana") { ustGuncelle(); gunKutuCiz(); }
  if (ad === "profil") profilCiz();
  if (ad === "defter") defterCiz();
  if (ad === "istat") istatCiz();
  if (ad === "rozet") rozetCiz();
  if (ad === "ayar") ayarCiz();
  window.scrollTo(0, 0);
}

document.querySelectorAll("#alt-menu button").forEach(b =>
  b.addEventListener("click", () => { Sesi.tik(); sayfaGoster(b.dataset.sayfa); }));

/* ---------------- XP / İLERLEME ---------------- */
function ustGuncelle() {
  const h = seviyeHesapla(D.xp);
  el("p-seviye").textContent = "Lv " + h.lv + (D.seri > 1 ? " 🔥" + D.seri : "");
  el("p-xp").textContent = D.xp + " XP";
  el("xpi").textContent = "Seviye " + h.lv;
  el("xps").textContent = h.kalan + " / " + h.gereken + " XP";
  el("xpbar").style.width = Math.min(100, (h.kalan / h.gereken) * 100) + "%";
  el("p-rozet").textContent = "🏅 " + rozetSayisi() + " / " + ROZETLER.length;
  el("p-seri").textContent = "🔥 " + (D.gunSeri || 0) + " gün";
  el("p-toplam").textContent = D.toplam + " soru";
  el("favori-ac").textContent = Object.keys(D.favori).length
    ? Object.keys(D.favori).length + " soru yıldızlı" : "Yıldızladığın sorular";
  const vk = el("vaka-ok");
  vk.style.display = vakaSorulari().length === 0 ? "block" : "none";
}

function gunKutuCiz() {
  const v = gununVaka();
  const b = tarihBugun();
  el("gun-baslik").textContent = v.s.hasta.yas + " yaş · " + v.s.hasta.ad + " · " + KAT[v.s.k].ad;
  el("gun-seri").textContent = "Günlük seri: " + (D.gunSeri || 0) + " gün" +
    (D.gunVaka === b ? " · ✅ Bugün tamamlandı" : " · " + b);
}

function xpEkle(p) {
  const once = seviyeHesapla(D.xp);
  D.xp += p;
  const sonra = seviyeHesapla(D.xp);
  kaydet(); ustGuncelle();
  if (sonra.lv > once.lv) { Sesi.kazanc(); konfeti(); toast("🎉 Seviye " + sonra.lv + "!"); }
}

function katGuncelle(k, dogruMu) {
  const kk = D.kat[k] || (D.kat[k] = { d: 0, y: 0 });
  if (dogruMu) kk.d++; else kk.y++;
}

function deftereEkle(x, secilen) {
  const s = x.s;
  const gec = D.defter[x.id] || { hata: 0 };
  D.defter[x.id] = {
    k: s.k, soru: s.s, secenekler: s.o.slice(), dogru: s.d, secilen: secilen,
    aciklama: s.a, hata: gec.hata + 1
  };
}

/* =====================================================================
   OYUN ÇERÇEVESİ
   ===================================================================== */
let O = null;
let zamanlayici = null;

function sureDurdur() {
  if (zamanlayici) { clearInterval(zamanlayici); zamanlayici = null; }
  if (O && O._t0) { O.kalanSn = Math.max(0, O.kalanSn - (Date.now() - O._t0) / 1000); O._t0 = null; }
}
function sureBaslat() {
  sureDurdur();
  if (!O || O.kalanSn <= 0) return;
  O._t0 = Date.now();
      zamanlayici = setInterval(() => {
        if (!O) { clearInterval(zamanlayici); zamanlayici = null; return; }
        O.kalanSn = Math.max(0, O.kalanSn - 0.2);
    el("p-sure").textContent = sureYaz();
    el("p-sure").style.color = O.kalanSn <= 10 ? "var(--no)" : "";
    if (O.kalanSn <= 0) { sureDurdur(); zamanBitti(); }
  }, 200);
}
function sureYaz() {
  if (!O) return "00:00";
  const t = Math.max(0, Math.ceil(O.kalanSn));
  return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
}
function zamanBitti() {
  if (!O || O.bitti) return;
  if (O.mod === "sprint" || O.mod === "esles") { turBitir(); return; }
  if (O.mod === "maraton") { O.hayat = 0; soruyuCevapla(-1, true); return; }
  soruyuCevapla(-1, true);
}

function oyunBaslat(ayar) {
  O = Object.assign({
    mod: "", ad: "", i: 0, toplam: 0, liste: [], aktif: null,
    puan: 0, dogru: 0, yanlis: 0, enIyiSeri: 0, kazanilanXp: 0,
        kalanSn: 0, bitti: false, erkenBitti: false, cevapVerildi: false, _t0: null, hayat: 1
  }, ayar);
  gunSeriIsle();
  el("p-sure").textContent = sureYaz();
  el("p-sure").style.color = "";
  el("p-skor").textContent = "0 puan";
  sayfaGoster("oyun");
  el("oyun-ad").textContent = O.ad;
  ilerlemeCiz();
  ekranCiz();
}

function ilerlemeCiz() {
  let yuzde, no;
  if (O.mod === "sprint") { yuzde = ((60 - O.kalanSn) / 60) * 100; no = O.dogru + " doğru"; }
  else if (O.mod === "esles") { yuzde = (O.cozulen / O.toplam) * 100; no = O.cozulen + " / " + O.toplam + " eşleşti"; }
  else { yuzde = (O.i / O.toplam) * 100; no = (O.i + 1) + " / " + O.toplam; }
  el("oyun-bar").style.width = Math.max(3, Math.min(100, yuzde)) + "%";
  el("oyun-no").textContent = no;
}

function ekranCiz() {
  if (O.mod === "esles") { eslesCiz(); return; }
  O.aktif = O.liste[O.i];
  soruCiz();
}

/* =====================================================================
   SORU MODLARI (vaka + bilgi)
   ===================================================================== */
const VITAL_ALANLARI = [
  { et: "TA", ana: "TA" }, { et: "Nabız", ana: "nabiz" }, { et: "Solunum", ana: "solunum" },
  { et: "SpO2", ana: "SpO2" }, { et: "GKS", ana: "GKS" }, { et: "Ağrı", ana: "Aci" }
];

function vitalKotu(deger, yas) {
  if (deger === undefined) return false;
  const n = parseFloat(String(deger).replace(",", "."));
  if (isNaN(n)) return false;
  const t = String(deger);
  if (t.indexOf("%") >= 0) return n < 92;
  if (t.indexOf("/") >= 0) return n < 90 || n > (yas > 65 ? 150 : 120);
  return n < 80 || n > 130;
}

function soruCiz() {
  const g = el("oyun-govde");
  g.innerHTML = "";
  const s = O.aktif.s;
  g.style.setProperty("--kAcc", KAT[s.k] ? KAT[s.k].renk : "var(--acc)");

  if (s.t === "vaka") {
    const h = s.hasta, v = s.vital || {};
    let vit = "";
    VITAL_ALANLARI.forEach(a => {
      const d = v[a.ana];
      const kotu = vitalKotu(d, h.yas);
      vit += '<div' + (kotu ? ' class="uyari"' : "") + '><span>' + a.et.toLocaleUpperCase("tr") +
        "</span><b>" + (d === undefined ? "-" : d) + "</b></div>";
    });
    g.insertAdjacentHTML("beforeend",
      '<div class="hasta"><div class="demograf">' + h.yas + " yaş · " + h.c +
      '</div><div class="ad">' + h.ad + '</div><div class="sikayet">“' + h.sikayet + '”</div>' +
      '<div class="vital">' + vit + "</div></div>");
  }

  g.insertAdjacentHTML("beforeend",
    '<div class="soru"><small>' + KAT[s.k].ad.toLocaleUpperCase("tr") + " · Zorluk " + s.z +
    (O.mod === "maraton" ? " · Tur " + (O.i + 1) : "") +
    (O.mod === "gunun" ? " · GÜNÜN VAKASI" : "") +
    "</small>" + s.s + "</div>");

  g.insertAdjacentHTML("beforeend", s.o.map((t, i) =>
    '<button class="sik" data-i="' + i + '"><span class="harf">' + HARF[i] +
    '</span><span class="txt">' + t + "</span></button>").join(""));

  g.insertAdjacentHTML("beforeend",
    '<button class="ipucu" id="ipucu"><span>💡 İPUCU AL</span>' +
    "İlk adımı düşün: yaşam bulguları ve önceliklendirme ne diyor?" +
    "</button>");
  g.insertAdjacentHTML("beforeend",
    '<div class="araBar"><button class="ipucu yildiz" id="favori-btn" title="Yıldızla" aria-label="Soruyu yıldızla">' +
    (D.favori[O.aktif.id] ? "⭐" : "☆") + "</button></div>");
  g.insertAdjacentHTML("beforeend",
    '<div class="gb" id="gb"></div><button class="buton" id="ileri" style="display:none">Devam Et</button>');

  g.querySelectorAll(".sik").forEach(b => b.addEventListener("click", () => {
    if (O.cevapVerildi) return;
    Sesi.tik();
    soruyuCevapla(parseInt(b.dataset.i, 10), false);
  }));
  el("ipucu").addEventListener("click", function () {
    if (this.dataset.acik) return;
    this.dataset.acik = "1";
    this.innerHTML = "<span>💡 İPUCU</span>" + (s.ipucu ||
      "Önce yaşam bulgularını (ABCDE) ve önceliklendirmeyi düşün. Sadece semptoma odaklanma.");
    this.classList.add("acik");
    Sesi.tik();
  });
  el("favori-btn").addEventListener("click", function () {
    Sesi.tik();
    if (D.favori[O.aktif.id]) { delete D.favori[O.aktif.id]; this.textContent = "☆"; toast("Favorilerden çıkarıldı"); }
    else { D.favori[O.aktif.id] = 1; this.textContent = "⭐"; toast("⭐ Soru yıldızlandı"); rozetKontrol(); }
    kaydet(); ustGuncelle();
  });
  el("ileri").addEventListener("click", sonraki);
  sureBaslat();
}

function soruyuCevapla(secilen, zamanDoldu) {
  if (O.cevapVerildi) return;
  O.cevapVerildi = true;
  sureDurdur();
  const x = O.aktif, s = x.s;
  const dogru = secilen === s.d;
  const puan = 10 + s.z * 5;

  guncelleSik(s, secilen);

  const gb = el("gb");
  gb.className = "gb gor " + (dogru ? "dg" : "yr");
  gb.setAttribute("aria-live", "polite");
  gb.innerHTML = "<h3>" + (dogru ? "✅ Doğru!" : zamanDoldu ? "⏰ Süre doldu" : "❌ Yanlış") +
    ' <span class="kucuk">· Doğru: ' + HARF[s.d] + "</span></h3><p>" + s.a + "</p>";

  if (dogru) {
    D.dogru++; O.dogru++; O.puan += puan;
    O.enIyiSeri++; D.seri++; D.enUzunSeri = Math.max(D.enUzunSeri, D.seri);
    Sesi.dogru();
  } else {
    O.yanlis++; O.enIyiSeri = 0; D.seri = 0;
    Sesi.yanlis();
    deftereEkle(x, secilen);
  }
  D.toplam++;
  gunIsle(1);
  katGuncelle(s.k, dogru);
  if (s.t === "vaka") D.vakaBiten[x.id] = 1;

  const carpma = O.mod === "maraton" ? 1 : 1;
  const xp = dogru ? (8 + s.z * 2) * carpma : 2;
  O.kazanilanXp += xp;
  xpEkle(xp);
  kaydet();
  rozetKontrol();

  el("ipucu").style.display = "none";
  const ileri = el("ileri");
  ileri.style.display = "block";

  if (O.mod === "maraton" && !dogru) {
    O.erkenBitti = true;
    ileri.textContent = "Sonucu Gör";
    el("p-skor").textContent = O.puan + " puan";
    ilerlemeCiz();
    return;
  }
  if (O.mod === "sprint") {
    const sonSoru = O.i >= O.liste.length - 1;
    ileri.textContent = sonSoru ? "Sonucu Gör" : "Sonraki Soru";
  } else {
    ileri.textContent = O.i >= O.toplam - 1 ? "Sonucu Gör" : "Sonraki Soru";
  }
  el("p-skor").textContent = O.puan + " puan";
  ilerlemeCiz();
}

function guncelleSik(s, secilen) {
  document.querySelectorAll(".sik").forEach((b, i) => {
    b.classList.add("kilitli");
    if (i === s.d) b.classList.add("dogru");
    else if (i === secilen) b.classList.add("yanlis", "sesli");
  });
}

function sonraki() {
  Sesi.tik();
  O.i++;
  if (O.erkenBitti || (O.mod === "sprint" ? O.i >= O.liste.length : O.i >= O.toplam)) { turBitir(); return; }
  O.cevapVerildi = false;
  ilerlemeCiz();
  ekranCiz();
}

/* =====================================================================
   TERİM EŞLEŞTİRME
   ===================================================================== */
function eslesCiz() {
  const g = el("oyun-govde");
  g.innerHTML = "";
  g.insertAdjacentHTML("beforeend",
    '<div class="kart" style="padding:13px;margin-bottom:12px"><b style="font-size:14px">📌 Nasıl oynanır</b>' +
    '<p class="kucuk" style="margin-top:4px">Önce bir terime dokun, sonra kutu içinden doğru tanımı seç. ' +
    "Doğru eşleşme +20 XP.</p></div>");

  O.liste.forEach(function (c, idx) {
    let tanimlar = "";
    O.tanimlar.forEach(function (d, j) {
      tanimlar += '<button class="terim" data-d="' + j + '">' + d + "</button>";
    });
    g.insertAdjacentHTML("beforeend",
      '<div class="esles" data-c="' + idx + '"><div class="bas"><b>' + (idx + 1) + ". Terim</b>" +
      '<span>terimi seç →</span></div>' +
      '<button class="terim" data-t="' + idx + '">' + c[0] + "</button>" +
      '<div class="tanimlar">' + tanimlar + "</div></div>");
  });

  g.querySelectorAll(".terim[data-t]").forEach(b =>
    b.addEventListener("click", () => eslesTerimSec(b.dataset.t)));
  g.querySelectorAll(".terim[data-d]").forEach(b =>
    b.addEventListener("click", () => eslesTanimSec(b.dataset.d)));
  ilerlemeCiz();
}

function eslesTerimSec(idx) {
  if (O.secili === idx) {
    O.secili = null;
    document.querySelectorAll(".terim[data-t]").forEach(b => b.classList.remove("sectili"));
    return;
  }
  O.secili = idx;
  Sesi.tik();
  document.querySelectorAll(".terim[data-t]").forEach(b =>
    b.classList.toggle("sectili", b.dataset.t === String(idx)));
}

function eslesTanimSec(idx) {
  if (O.secili === null) { toast("Önce bir terim seç 👆"); return; }
  const dogruTerim = O.liste[O.secili];
  const dogruMu = dogruTerim[1] === O.tanimlar[idx];

  if (dogruMu) {
    Sesi.dogru();
    O.cozulen++;
    O.puan += 20;
    D.toplam++; D.dogru++; D.seri++;
    D.enUzunSeri = Math.max(D.enUzunSeri, D.seri);
    katGuncelle("guvenlik", true);
    O.kazanilanXp += 20;
    xpEkle(20);
    const kutu = document.querySelector('.esles[data-c="' + O.secili + '"]');
    const bas = kutu ? kutu.querySelector(".bas span") : null;
    if (bas) bas.textContent = "✓ eşleşti";
    kutu.querySelectorAll(".terim").forEach(function (b) { b.disabled = true; });
    kutu.querySelectorAll(".terim[data-t]").forEach(function (b) { b.classList.add("bitti"); });
    kutu.style.opacity = ".55";
    O.secili = null;
    el("p-skor").textContent = O.puan + " puan";
    ilerlemeCiz();
    if (O.cozulen >= O.toplam) { sureDurdur(); setTimeout(turBitir, 550); }
  } else {
    Sesi.yanlis();
    O.yanlis++;
    D.toplam++; D.seri = 0;
    katGuncelle("guvenlik", false);
    O.kazanilanXp += 2;
    xpEkle(2);
    const tbn = document.querySelectorAll(".terim[data-d]")[idx];
    if (tbn) { tbn.classList.add("yanlis"); setTimeout(() => tbn.classList.remove("yanlis"), 700); }
    toast("Bu eşleşme değil, tekrar dene");
  }
  gunIsle(1);
  rozetKontrol();
  kaydet();
}

/* =====================================================================
   SONUÇ
   ===================================================================== */
function turBitir() {
  if (!O || O.bitti) return;
  O.bitti = true;
  sureDurdur();
  if (O.mod === "sprint") {
    const bonus = Math.ceil(O.kalanSn) * 2;
    if (bonus > 0) { O.puan += bonus; O.kazanilanXp += Math.floor(bonus / 2); }
  }
  const toplamCevap = O.dogru + O.yanlis;
  if (toplamCevap > 0 && O.dogru === toplamCevap) D.tamTur = 1;
  if (O.mod === "gunun") D.gunVaka = tarihBugun();
  kaydet();
  el("p-skor").textContent = O.puan + " puan";
  rozetKontrol();
  ustGuncelle();
  sonucCiz(O.mod === "sprint" ? Math.ceil(O.kalanSn) * 2 : 0);
}

function sonucCiz(bonus) {
  const g = el("oyun-govde");
  const toplamCevap = O.dogru + O.yanlis;
  const oran = toplamCevap > 0 ? Math.round((O.dogru / toplamCevap) * 100) : 0;
  let baslik, mesaj;
  if (oran >= 90) { baslik = "🏆 Mükemmel!"; mesaj = "Bu konuda neredeyse kusursuzsun."; }
  else if (oran >= 70) { baslik = "👏 Çok iyi!"; mesaj = "Sağlam temel var, tekrar ederek pekiştir."; }
  else if (oran >= 50) { baslik = "💪 Gayet iyi"; mesaj = "Doğru temel oluşuyor, defterine göz at."; }
  else { baslik = "📚 Tekrar zamanı"; mesaj = "Önce yanlış yaptıklarına odaklan, sonra tekrar dene."; }

  const notlar = [];
  if (O.mod === "maraton") notlar.push("Maraton " + O.i + " soruda bitti" + (O.yanlis ? " (ilk hata)" : ""));
  if (O.mod === "gunun") notlar.push("Günün vakası tamamlandı");

  g.innerHTML =
    '<div class="sonuc"><div class="daire">' + oran + "%<i>BAŞARI</i></div>" +
    "<h2>" + baslik + "</h2><p class=\"metin\" style=\"margin-top:4px\">" + mesaj + "</p></div>" +
    '<div class="istat"><div><b>' + O.dogru + "</b><span>DOĞRU</span></div>" +
    "<div><b>" + O.yanlis + "</b><span>YANLIŞ</span></div>" +
    "<div><b>" + O.puan + "</b><span>PUAN</span></div></div>" +
    '<div class="kart"><h2>Kazanımlar</h2><p class="metin">' +
    "En uzun seri: <b style=\"color:var(--txt)\">" + O.enIyiSeri + "</b> · " +
    "Kazanılan XP: <b style=\"color:var(--txt)\">+" + O.kazanilanXp + "</b>" +
    (bonus > 0 ? " · Süre bonusu: <b style=\"color:var(--acc)\">+" + bonus + "</b>" : "") +
    (notlar.length ? "<br>" + notlar.join("<br>") : "") +
    "</p></div>" +
    '<div class="ikili"><button class="buton" id="paylas">📤 Paylaş</button></div>' +
    '<button class="buton" id="tekrar">Tekrar Oyna</button>' +
    '<button class="buton ghost" id="ana-don">Ana Menü</button>';

  el("paylas").addEventListener("click", function () { Sesi.tik(); paylas(); });
  el("tekrar").addEventListener("click", function () {
    Sesi.tik();
    if (O.mod === "vaka") baslatVaka();
    else if (O.mod === "sprint") baslatSprint();
    else if (O.mod === "esles") baslatEsles();
    else if (O.mod === "maraton") baslatMaraton();
    else if (O.mod === "gunun") baslatGunun();
    else if (O.mod === "arena") baslatArena(O.kat);
    else baslatFavori();
  });
  el("ana-don").addEventListener("click", function () { Sesi.tik(); sureDurdur(); O = null; sayfaGoster("ana"); });
}

/* ---------------- PAYLAŞ ---------------- */
function paylasMetni() {
  const h = seviyeHesapla(D.xp);
  const oran = D.toplam ? Math.round((D.dogru / D.toplam) * 100) : 0;
  return "Hemşirelik Akademi'nde " + D.toplam + " soru çözdüm, %" + oran + " başarı! " +
    h.lv + ". seviye, " + rozetSayisi() + " rozet. 🩺 #HemşirelikAkademi";
}
async function paylas() {
  const metin = paylasMetni();
  if (navigator.share) {
    try { await navigator.share({ title: "Hemşirelik Akademi", text: metin, url: location.href }); return; }
    catch (e) { }
  }
  try { await navigator.clipboard.writeText(metin); toast("Metin panoya kopyalandı"); return; }
  catch (e) { }
  toast(metin);
}

/* =====================================================================
   MOD BAŞLATICILARI
   ===================================================================== */
function baslatVaka() {
  let havuz = vakaSorulari();
  if (havuz.length === 0) {
    toast("Tüm vakaları çözdün! 🔄 Yeni tur açıldı");
    D.vakaBiten = {};
    havuz = vakaSorulari();
  }
  const liste = karistir(havuz).slice(0, VAKA_ADET);
  oyunBaslat({
    mod: "vaka", ad: "Acil Servis Vakası",
    toplam: liste.length, liste: liste, kalanSn: D.ayarlar.sure
  });
}

function baslatGunun() {
  const x = gununVaka();
  oyunBaslat({
    mod: "gunun", ad: "Günün Vakası", kat: x.s.k,
    toplam: 1, liste: [x], kalanSn: Math.max(45, D.ayarlar.sure)
  });
}

function baslatArena(kat) {
  const havuz = TUMU.filter(x => x.s.k === kat);
  const liste = karistir(havuz).slice(0, ARENA_ADET);
  oyunBaslat({
    mod: "arena", ad: "Meydan · " + KAT[kat].ad, kat: kat,
    toplam: liste.length, liste: liste, kalanSn: D.ayarlar.sure
  });
}

function baslatMaraton() {
  const liste = [];
  const z1 = karistir(bilgiHavuzu(1)), z2 = karistir(bilgiHavuzu(2)), z3 = karistir(bilgiHavuzu(3));
  const havuzlar = [z1, z2, z3];
  let i = 0;
  while (liste.length < MARATON_ADET) {
    const h = havuzlar[Math.min(2, Math.floor(i / 6))];
    const q = h[i % h.length];
    if (q && !liste.find(x => x.id === q.id)) liste.push(q);
    i++;
    if (i > 900) break;
  }
  oyunBaslat({
    mod: "maraton", ad: "Maraton", hayat: 1,
    toplam: liste.length, liste: liste, kalanSn: D.ayarlar.sure
  });
}

function baslatSprint() {
  const liste = karistir(bilgiHavuzu(null));
  oyunBaslat({
    mod: "sprint", ad: "Bilgi Sprinti",
    toplam: 999, liste: liste, kalanSn: 60
  });
}

function baslatEsles() {
  const liste = karistir(TERIMLER).slice(0, ESLES_ADET);
  oyunBaslat({
    mod: "esles", ad: "Terim Eşleştirme",
    toplam: liste.length, liste: liste,
    tanimlar: karistir(liste.map(x => x[1])),
    secili: null, cozulen: 0, kalanSn: D.ayarlar.sure > 0 ? D.ayarlar.sure * 2 : 0
  });
  sureBaslat();
}

function baslatFavori() {
  const ids = Object.keys(D.favori);
  if (!ids.length) { toast("Önce bir soruyu ⭐ ile yıldızla"); return; }
  const liste = karistir(TUMU.filter(x => ids.indexOf(x.id) >= 0)).slice(0, 20);
  oyunBaslat({
    mod: "favori", ad: "Favori Sınav",
    toplam: liste.length, liste: liste, kalanSn: D.ayarlar.sure
  });
}

const MODLAR = {
  vaka: baslatVaka, gunun: baslatGunun, arena: () => katmanAc("Kategori Meydanı",
    Object.keys(KAT).map(k => ({
      renk: KAT[k].renk, ad: KAT[k].ad,
      sag: TUMU.filter(x => x.s.k === k).length + " soru",
      tik: () => { katmanKapat(); baslatArena(k); }
    }))),
  maraton: baslatMaraton, sprint: baslatSprint, esles: baslatEsles, favori: baslatFavori
};

/* =====================================================================
   KATMAN (SEÇİCİ)
   ===================================================================== */
function katmanAc(baslik, secenekler) {
  const k = el("katman");
  k.classList.remove("gizli");
  k.innerHTML = '<div class="panel"><button class="kapat" aria-label="Kapat">✕</button>' +
    "<h3>" + baslik + '</h3><p class="kucuk">Bir kategori seç, 10 soruluk meydan turu başlasın.</p>' +
    secenekler.map((s, i) => '<button class="secenek" data-i="' + i + '">' +
      '<span class="nokta" style="background:' + s.renk + '"></span>' +
      '<span class="ad">' + s.ad + '</span><span class="sag">' + s.sag + "</span></button>").join("") +
    "</div>";
  k.querySelectorAll(".secenek").forEach(b =>
    b.addEventListener("click", () => secenekler[parseInt(b.dataset.i, 10)].tik()));
  k.querySelector(".kapat").addEventListener("click", katmanKapat);
  k.onclick = (e) => { if (e.target === k) katmanKapat(); };
}
function katmanKapat() {
  const k = el("katman");
  k.classList.add("gizli");
  k.innerHTML = "";
}

/* =====================================================================
   DEFTER / İSTATİSTİK / AYARLAR
   ===================================================================== */
function defterCiz() {
  document.querySelectorAll("#def-seg button").forEach(b =>
    b.classList.toggle("secili", b.dataset.seg === defSekme));
  const g = el("def-liste");

  if (defSekme === "favori") {
    const ids = Object.keys(D.favori);
    el("def-sayi").textContent = ids.length + " favori";
    el("def-temizle").style.display = "none";
    if (!ids.length) {
      g.innerHTML = "<h2>Favori yok</h2><p class=\"metin\">Bir soruyu çözerken ⭐ düğmesine basarak " +
        "yıldızlayabilir, buradan sınavını çözebilirsin.</p>";
      return;
    }
    g.innerHTML = "<h2>⭐ Favorilerim</h2><p class=\"metin\" style=\"margin-bottom:10px\">" +
      "Bu sorulardan sınav oluşturabilirsin.</p>" +
      '<button class="buton" id="fav-sınav" style="margin:0 0 12px">Favorilerle Sınav Yap</button>' +
      ids.map(function (id) {
        const x = TUMU.find(q => q.id === id);
        if (!x) return "";
        return '<div style="border-top:1px solid var(--line);padding:12px 0">' +
          '<span class="pill" style="font-size:10px">' + (KAT[x.s.k] ? KAT[x.s.k].ad : x.s.k) + "</span>" +
          '<div style="font-weight:700;font-size:13.5px;margin:6px 0">' + x.s.s + "</div>" +
          '<p class="kucuk">' + x.s.a + "</p></div>";
      }).join("");
    el("fav-sınav").addEventListener("click", function () { Sesi.tik(); baslatFavori(); });
    return;
  }

  const ids = Object.keys(D.defter);
  el("def-sayi").textContent = ids.length + " kayıt";
  el("def-temizle").style.display = "block";
  if (ids.length === 0) {
    g.innerHTML = "<h2>Tekrar defteri boş</h2><p class=\"metin\">Yanlış yaptığın sorular burada birikir. " +
      "Vaka modunu veya Bilgi Sprinti'ni oyna.</p>";
    return;
  }
  g.innerHTML = "<h2>Yanlışlarım</h2>" + ids.map(function (id) {
    const d = D.defter[id];
    const s = d.secenekler || [];
    const kats = d.k && KAT[d.k] ? KAT[d.k].ad : d.k;
    return '<div style="border-top:1px solid var(--line);padding:12px 0">' +
      '<span class="pill" style="font-size:10px">' + kats + "</span>" +
      '<div style="font-weight:700;font-size:13.5px;margin:6px 0">' + d.soru + "</div>" +
      (s.length ? '<div class="kucuk" style="color:var(--ok)">✓ ' + s[d.dogru] + "</div>" : "") +
      (s.length && d.secilen >= 0 ? '<div class="kucuk" style="color:var(--no)">✗ ' + s[d.secilen] + "</div>" : "") +
      '<p class="kucuk" style="margin-top:6px">' + d.aciklama + "</p>" +
      '<div class="kucuk" style="margin-top:4px;color:var(--warn)">' + d.hata + " kez yanlış</div></div>";
  }).join("");
}

function istatCiz() {
  el("i-toplam").textContent = D.toplam;
  el("i-dogru").textContent = D.dogru;
  el("i-oran").textContent = "%" + (D.toplam ? Math.round((D.dogru / D.toplam) * 100) : 0);
  el("ist-ozet").textContent = D.toplam + " soru";
  el("kat-liste").innerHTML = Object.keys(KAT).map(function (k) {
    const v = D.kat[k] || { d: 0, y: 0 };
    const t = v.d + v.y;
    const o = t ? Math.round((v.d / t) * 100) : 0;
    return '<div class="kat"><span class="nokta" style="background:' + KAT[k].renk + '"></span>' +
      '<span class="ad">' + KAT[k].ad + '<div class="bar" style="height:6px;margin-top:5px">' +
      '<i style="width:' + o + "%;background:" + KAT[k].renk + '"></i></div></span>' +
      '<span class="y">' + v.d + "/" + t + " · %" + o + "</span></div>";
  }).join("");

  const bugun = tarihBugun();
  el("takvim").innerHTML = takvimHtml();
}

function takvimHtml() {
  const bugun = tarihBugun();
  let html = "";
  for (let i = 27; i >= 0; i--) {
    const g = gunEkle(bugun, -i);
    const n = D.gunler[g] || 0;
    const sinif = n === 0 ? "" : n < 5 ? "b1" : n < 15 ? "b2" : "b3";
    html += '<div class="gun ' + sinif + (g === bugun ? " bugun" : "") + '" title="' + g + ": " + n + ' soru"></div>';
  }
  return html;
}

function ayarCiz() {
  el("ay-ses-ac").textContent = D.ayarlar.ses ? "Açık" : "Kapalı";
  el("ay-timer-ac").textContent = D.ayarlar.sure > 0 ? "Soru başına " + D.ayarlar.sure + " sn" : "Süre kapalı";
  el("ay-titre-ac").textContent = D.ayarlar.titre ? "Açık" : "Kapalı";
  el("ay-hareket-ac").textContent = D.ayarlar.hareket ? "Açık" : "Kapalı";
  el("ay-tema-ac").textContent = D.ayarlar.tema === "aydinlik" ? "Aydınlık" : "Karanlık";
  el("ay-surum").textContent = SURUM + " · Tasarım: " + TASARIMCI;
}

/* ---------------- YEDEKLEME ---------------- */
function yedekMetni() {
  return JSON.stringify({
    uygulama: "hemsirelik-akademi", surum: SURUM, tasarimci: TASARIMCI,
    tarih: new Date().toISOString(), kayit: D
  }, null, 2);
}
function yedekle() {
  try {
    const blob = new Blob([yedekMetni()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hemsirelik-akademi-yedek-" + tarihBugun() + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast("Yedek dosyası indirildi");
  } catch (e) { toast("Yedek alınamadı"); }
}
function geriYukleMetni(metin) {
  const d = JSON.parse(metin);
  const k = d && d.kayit ? d.kayit : d;
  if (!k || typeof k !== "object" || typeof k.xp !== "number" || typeof k.toplam !== "number") {
    throw new Error("geçersiz");
  }
  D = {
    ...JSON.parse(JSON.stringify(VARSAYILAN)), ...k,
    ayarlar: { ...VARSAYILAN.ayarlar, ...(k.ayarlar || {}) },
    kat: k.kat || {}, defter: k.defter || {}, vakaBiten: k.vakaBiten || {},
    rozetler: k.rozetler || {}, favori: k.favori || {}, gunler: k.gunler || {}
  };
  kaydet();
  temaUygula(); ustGuncelle(); ayarCiz(); gunKutuCiz();
  rozetKontrol();
  return true;
}
function geriYukleDosya(dosya) {
  const okuyucu = new FileReader();
  okuyucu.onload = () => {
    try { geriYukleMetni(String(okuyucu.result)); toast("Yedek geri yüklendi ✅"); }
    catch (e) { toast("Dosya okunamadı, geçersiz yedek"); }
  };
  okuyucu.onerror = () => toast("Dosya okunamadı");
  okuyucu.readAsText(dosya);
}

/* =====================================================================
   OLAYLAR
   ===================================================================== */
el("ay-ses").addEventListener("click", function () {
  D.ayarlar.ses = !D.ayarlar.ses; kaydet(); ayarCiz();
  if (D.ayarlar.ses) Sesi.dogru();
});
el("ay-timer").addEventListener("click", function () {
  const s = [15, 20, 30, 45, 0];
  D.ayarlar.sure = s[(s.indexOf(D.ayarlar.sure) + 1) % s.length];
  kaydet(); ayarCiz(); Sesi.tik();
  toast(D.ayarlar.sure === 0 ? "Süre kapalı" : "Süre: " + D.ayarlar.sure + " sn");
});
el("ay-titre").addEventListener("click", function () {
  D.ayarlar.titre = !D.ayarlar.titre; kaydet(); ayarCiz(); Sesi.tik(); tit(20);
});
el("ay-hareket").addEventListener("click", function () {
  D.ayarlar.hareket = !D.ayarlar.hareket; kaydet(); ayarCiz(); temaUygula(); Sesi.tik();
});
el("ay-tema").addEventListener("click", function () {
  D.ayarlar.tema = D.ayarlar.tema === "aydinlik" ? "koyu" : "aydinlik";
  kaydet(); ayarCiz(); temaUygula(); Sesi.tik();
});
el("tema-btn").addEventListener("click", function () {
  D.ayarlar.tema = D.ayarlar.tema === "aydinlik" ? "koyu" : "aydinlik";
  kaydet(); ayarCiz(); temaUygula(); Sesi.tik();
});
el("ay-yedekle").addEventListener("click", function () { Sesi.tik(); yedekle(); });
el("ay-geri").addEventListener("click", function () { Sesi.tik(); el("ay-dosya").click(); });
el("ay-dosya").addEventListener("change", function () {
  if (this.files && this.files[0]) geriYukleDosya(this.files[0]);
  this.value = "";
});
el("ay-paylas").addEventListener("click", function () { Sesi.tik(); paylas(); });
["profil-paylas", "profil-paylas2"].forEach(function (id) {
  el(id).addEventListener("click", function () { Sesi.tik(); paylas(); });
});

el("def-temizle").addEventListener("click", function () {
  if (Object.keys(D.defter).length === 0) { toast("Defter zaten boş"); return; }
  if (window.confirm("Tekrar defteri silinsin mi?")) {
    D.defter = {}; kaydet(); defterCiz(); toast("Defter temizlendi");
  }
});
el("ay-sifirla").addEventListener("click", function () {
  if (window.confirm("Tüm ilerleme sıfırlansın mi? Bu işlem geri alınamaz.")) {
    D = JSON.parse(JSON.stringify(VARSAYILAN));
    kaydet(); ustGuncelle(); gunKutuCiz(); ayarCiz(); temaUygula();
    rozetKontrol(); toast("İlerleme sıfırlandı");
  }
});
document.querySelectorAll("#def-seg button").forEach(b =>
  b.addEventListener("click", function () { Sesi.tik(); defSekme = b.dataset.seg; defterCiz(); }));

el("gun-btn").addEventListener("click", function () { Sesi.tik(); baslatGunun(); });

document.querySelectorAll(".mod[data-git]").forEach(b =>
  b.addEventListener("click", function () {
    Sesi.tik();
    const f = MODLAR[b.dataset.git];
    if (f) f();
  }));

el("kapat").addEventListener("click", function () {
  Sesi.tik();
  if (O && !O.bitti) {
    if (window.confirm("Oyunu bırakıp ana menüye dönmek istiyor musun? İlerlemen kaydedilir.")) {
      sureDurdur(); O = null; sayfaGoster("ana");
    }
  } else { sureDurdur(); O = null; sayfaGoster("ana"); }
});

/* ---------------- KLAVYE KISAYOLLARI ---------------- */
document.addEventListener("keydown", function (e) {
  if (document.getElementById("ek-oyun").classList.contains("aktif") && O && !O.bitti) {
    if (e.key === "Escape") { el("kapat").click(); return; }
    if (O.cevapVerildi) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el("ileri") ? el("ileri").click() : null; }
      return;
    }
    if (O.mod === "esles") return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) { const b = document.querySelector('.sik[data-i="' + (n - 1) + '"]'); if (b) b.click(); return; }
    if (e.key.toLowerCase() === "h") { const b = el("ipucu"); if (b) b.click(); return; }
    return;
  }
  if (e.key.toLowerCase() === "t") el("tema-btn").click();
});

/* ---------------- BAŞLAT ---------------- */
temaUygula();
el("ay-surum").textContent = SURUM + " · Tasarım: " + TASARIMCI;
ustGuncelle();
gunKutuCiz();
rozetKontrol();
sayfaGoster("ana");
requestAnimationFrame(() => {
  document.body.classList.add("hazir");
  setTimeout(() => { const a = el("acilis"); if (a) a.remove(); }, 500);
});
