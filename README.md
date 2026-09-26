# Hemşirelik Akademi 🩺

Vaka tabanlı hemşirelik tekrar oyunu. Mobil tarayıcıda çalışır, kurulum gerektirmez (PWA).

## Modlar
- **Acil Servis Vakası** — hastanın yaşı, şikâyeti ve vital bulguları verilir; önceliklendirme sorusu sorulur.
- **Bilgi Sprinti** — 60 saniyede olabildiğince çok doğru cevap.
- **Terim Eşleştirme** — 6 terim, karışık tanımlarla eşleştirilir.

## İçerik
- 15 kategori, 78 soru (9 vaka + 69 bilgi), 30 terim–tanım çifti.
- Kategoriler: Vaka & Öncelik, Vital Bulgular, Solunum, Kardiyovasküler, Sinir Sistemi, Sıvı & Elektrolit, Enfeksiyon & İzolasyon, Farmakoloji, Endokrin & Diyabet, Cerrahi Bakım, Kan Transfüzyonu, Çocuk Sağlığı, Kadın Doğum, İlk Yardım & CPR, Hasta Güvenliği.

## Özellikler
- XP / seviye, seri takibi, kategori bazlı başarı istatistikleri
- Yanlış yapılan sorular otomatik **Tekrar Defteri**'ne yazılır
- Soru başına süre ayarı (15 / 20 / 30 / 45 sn veya kapalı), ses aç/kapa
- Tüm ilerleme `localStorage` içinde tutulur (bu cihaza özel)
- Çevrimdışı çalışma (service worker)

## Dosyalar
| Dosya | İçerik |
|---|---|
| `index.html` | Ekranlar ve arayüz |
| `oyun.js` | Oyun motoru, kayıt, ses |
| `veri.js` | Kategori, soru ve terim bankası |
| `service-worker.js` | Çevrimdışı önbellek |
| `manifest.json` | PWA yapılandırması |

## Uyarı
Bu oyun **yalnızca tekrar ve öğrenme amaçlıdır**. Güncel protokoller, ilaç kılavuzları ve öğretmen/hekim yönlendirmesi esas alınmalıdır. Kişisel hasta kararı yerine geçmez.
