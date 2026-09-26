/* =====================================================================
   HEMŞİRELİK AKADEMİ - OYUN MOTORU
   ===================================================================== */
const SURUM = "1.0.0";
const KAYIT_ANAHTAR = "hemsire_akademi_v1";
const HARF = ["A", "B", "C", "D", "E"];
const VAKA_ADET = 10;
const ESLES_ADET = 6;

const el = (id) => document.getElementById(id);
const karistir = (dizi) => {
  const d = dizi.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
};

/* ---------------- KAYIT ---------------- */
const VARSAYILAN = {
  xp: 0, seri: 0, enUzunSeri: 0, toplam: 0, dogru: 0,
  kat: {}, defter: {}, vakaBiten: {},
  ayarlar: { ses: true, sure: 30 }
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
      kat: d.kat || {}, defter: d.defter || {}, vakaBiten: d.vakaBiten || {}
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
  yanlis: () => bip(190, 0.22, "sawtooth"),
  tik: () => bip(1150, 0.05, "sine"),
  kazanc: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => bip(f, 0.17, "triangle"), i * 90))
};

/* ---------------- TOAST ---------------- */
function toast(yazi) {
  const t = el("toast");
  t.textContent = yazi;
  t.classList.add("gor");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("gor"), 1900);
}

/* ---------------- SORU HAVUZU ---------------- */
const TUMU = SORULAR.map((s, i) => ({ s: s, id: s.k + "|" + i }));

const vakaSorulari = () => TUMU.filter(x => x.s.t === "vaka" && !D.vakaBiten[x.id]);
const bilgiHavuzu = (z) => {
  let h = TUMU.filter(x => x.s.t === "bilgi" && (!z || x.s.z === z));
  if (h.length < 10) h = TUMU.filter(x => x.s.t === "bilgi");
  return h;
};

/* ---------------- GEÇİŞ ---------------- */
const EKRANLAR = { ana: "ek-ana", defter: "ek-defter", istat: "ek-istat", ayar: "ek-ayar", oyun: "ek-oyun" };

function sayfaGoster(ad) {
  document.querySelectorAll(".ekran").forEach(e => e.classList.remove("aktif"));
  el(EKRANLAR[ad]).classList.add("aktif");
  el("alt-menu").style.display = (ad === "oyun") ? "none" : "flex";
  document.querySelectorAll("#alt-menu button").forEach(b =>
    b.classList.toggle("secili", b.dataset.sayfa === ad));
  if (ad === "ana") ustGuncelle();
  if (ad === "defter") defterCiz();
  if (ad === "istat") istatCiz();
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
  const vakaKalan = vakaSorulari().length;
  const vk = el("vaka-ok");
  vk.style.display = vakaKalan === 0 ? "none" : "block";
  vk.textContent = "✓";
}

function xpEkle(p) {
  const once = seviyeHesapla(D.xp);
  D.xp += p;
  const sonra = seviyeHesapla(D.xp);
  kaydet(); ustGuncelle();
  if (sonra.lv > once.lv) { Sesi.kazanc(); toast("🎉 Seviye " + sonra.lv + "!"); }
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
  soruyuCevapla(-1, true);
}

function oyunBaslat(ayar) {
  O = Object.assign({
    mod: "", ad: "", i: 0, toplam: 0, liste: [], aktif: null,
    puan: 0, dogru: 0, yanlis: 0, enIyiSeri: 0, kazanilanXp: 0,
    kalanSn: 0, bitti: false, cevapVerildi: false, _t0: null
  }, ayar);
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
    "</small>" + s.s + "</div>");

  g.insertAdjacentHTML("beforeend", s.o.map((t, i) =>
    '<button class="sik" data-i="' + i + '"><span class="harf">' + HARF[i] +
    '</span><span class="txt">' + t + "</span></button>").join(""));

  g.insertAdjacentHTML("beforeend",
    '<button class="ipucu" id="ipucu"><span>💡 İPUCU AL</span>' +
    "İlk adımı düşün: yaşam bulguları ve önceliklendirme ne diyor?" +
    "</button>");
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
  katGuncelle(s.k, dogru);
  if (s.t === "vaka") D.vakaBiten[x.id] = 1;
  const xp = dogru ? 8 + s.z * 2 : 2;
  O.kazanilanXp += xp;
  xpEkle(xp);
  kaydet();

  el("ipucu").dataset.acik = "";
  el("ipucu").classList.remove("acik");
  el("ipucu").style.display = "none";
  const ileri = el("ileri");
  ileri.style.display = "block";
  const sonSoru = O.mod === "sprint" ? O.i >= O.liste.length - 1 : O.i >= O.toplam - 1;
  ileri.textContent = sonSoru ? "Sonucu Gör" : "Sonraki Soru";
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
  if (O.mod === "sprint" ? O.i >= O.liste.length : O.i >= O.toplam) { turBitir(); return; }
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
      '<div class="esles" data-c="' + idx + '"><div class="bas"><b>' + (idx + 1) + '. Terim</b>' +
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
    D.toplam++; D.dogru++;
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
    D.toplam++;
    katGuncelle("guvenlik", false);
    O.kazanilanXp += 2;
    xpEkle(2);
    const tbn = document.querySelectorAll(".terim[data-d]")[idx];
    if (tbn) { tbn.classList.add("yanlis"); setTimeout(() => tbn.classList.remove("yanlis"), 700); }
    toast("Bu eşleşme değil, tekrar dene");
  }
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
  kaydet();
  el("p-skor").textContent = O.puan + " puan";
  ustGuncelle();
  sonucCiz(O.mod === "sprint" ? Math.ceil(O.kalanSn) * 2 : 0);
}

function sonucCiz(bonus) {
  const g = el("oyun-govde");
  const oran = O.dogru + O.yanlis > 0 ? Math.round((O.dogru / (O.dogru + O.yanlis)) * 100) : 0;
  let baslik, mesaj;
  if (oran >= 90) { baslik = "🏆 Mükemmel!"; mesaj = "Bu konuda neredeyse kusursuzsun."; }
  else if (oran >= 70) { baslik = "👏 Çok iyi!"; mesaj = "Sağlam temel var, tekrar ederek pekiştir."; }
  else if (oran >= 50) { baslik = "💪 Gayet iyi"; mesaj = "Doğru temel oluşuyor, defterine göz at."; }
  else { baslik = "📚 Tekrar zamanı"; mesaj = "Önce yanlış yaptıklarına odaklan, sonra tekrar dene."; }

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
    "</p></div>" +
    '<button class="buton" id="tekrar">Tekrar Oyna</button>' +
    '<button class="buton ghost" id="ana-don">Ana Menü</button>';

  el("tekrar").addEventListener("click", function () {
    Sesi.tik();
    if (O.mod === "vaka") baslatVaka();
    else if (O.mod === "sprint") baslatSprint();
    else baslatEsles();
  });
  el("ana-don").addEventListener("click", function () { Sesi.tik(); O = null; sayfaGoster("ana"); });
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

/* =====================================================================
   DEFTER / İSTATİSTİK / AYARLAR
   ===================================================================== */
function defterCiz() {
  const ids = Object.keys(D.defter);
  el("def-sayi").textContent = ids.length + " kayıt";
  const g = el("def-liste");
  if (ids.length === 0) {
    g.innerHTML = "<h2>Tekrar defteri boş</h2><p class=\"metin\">Yanlış yaptığın sorular burada birikir. " +
      "Vaka modunu veya Bilgi Sprinti'ni oyna.</p>";
    return;
  }
  g.innerHTML = "<h2>Yanlışlarım</h2>" + ids.map(function (id) {
    const d = D.defter[id];
    const s = d.secenekler || [];
    const kats = d.k && KAT[d.k] ? KAT[d.k].ad : d.k;
    return '<div style="border-top:1px solid rgba(42,61,92,.55);padding:12px 0">' +
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
}

function ayarCiz() {
  el("ay-ses-ac").textContent = D.ayarlar.ses ? "Açık" : "Kapalı";
  el("ay-timer-ac").textContent = D.ayarlar.sure > 0 ? "Soru başına " + D.ayarlar.sure + " sn" : "Süre kapalı";
  el("ay-surum").textContent = SURUM;
}

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
el("def-temizle").addEventListener("click", function () {
  if (Object.keys(D.defter).length === 0) { toast("Defter zaten boş"); return; }
  if (window.confirm("Tekrar defteri silinsin mi?")) {
    D.defter = {}; kaydet(); defterCiz(); toast("Defter temizlendi");
  }
});
el("ay-sifirla").addEventListener("click", function () {
  if (window.confirm("Tüm ilerleme sıfırlansın mi? Bu işlem geri alınamaz.")) {
    D = JSON.parse(JSON.stringify(VARSAYILAN));
    kaydet(); ustGuncelle(); toast("İlerleme sıfırlandı");
  }
});

document.querySelectorAll(".mod[data-git]").forEach(b =>
  b.addEventListener("click", function () {
    Sesi.tik();
    if (b.dataset.git === "vaka") baslatVaka();
    else if (b.dataset.git === "sprint") baslatSprint();
    else baslatEsles();
  }));

el("kapat").addEventListener("click", function () {
  Sesi.tik();
  if (O && !O.bitti) {
    if (window.confirm("Oyunu bırakıp ana menüye dönmek istiyor musun? İlerlemen kaydedilir.")) {
      sureDurdur(); O = null; sayfaGoster("ana");
    }
  } else { sureDurdur(); O = null; sayfaGoster("ana"); }
});

/* ---------------- BAŞLAT ---------------- */
el("ay-surum").textContent = SURUM;
ustGuncelle();
sayfaGoster("ana");
