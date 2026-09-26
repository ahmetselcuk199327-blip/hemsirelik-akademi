# Hemşirelik Akademi 🩺

Vaka tabanlı hemşirelik tekrar oyunu. Mobil tarayıcıda çalışır, kurulum gerektirmez (PWA).

**Tasarım ve kodlama: [HANSoft](https://github.com/ahmetselcuk199327-blip)**

## Modlar
| Mod | Açıklama |
|---|---|
| **Günün Vakası** | Her gün değişen tek vaka; günlük seri takibiyle. |
| **Acil Servis Vakası** | Hastanın yaşı, şikâyeti ve 6 vital bulgusu verilir; önceliklendirme sorusu sorulur. |
| **Kategori Meydanı** | 15 kategoriden birini seç, yalnızca o konudan 10 soruluk tur. |
| **Maraton** | Kolaydan zora 30 soruluk seri; ilk hata turu bitirir. |
| **Bilgi Sprinti** | 60 saniyede olabildiğince çok doğru cevap; artan süre puan olarak eklenir. |
| **Terim Eşleştirme** | 6 terim, karışık tanımlarla eşleştirilir. |
| **Favori Sınavı** | ⭐ ile yıldızladığın sorulardan kendi sınavını oluştur. |

## İçerik
- 15 kategori, **124 soru** (17 vaka + 107 bilgi), **73 terim–tanım** çifti.
- Kategoriler: Vaka & Öncelik, Vital Bulgular, Solunum Sistemi, Kardiyovasküler, Sinir Sistemi, Sıvı & Elektrolit, Enfeksiyon & İzolasyon, Farmakoloji, Endokrin & Diyabet, Cerrahi Bakım, Kan Transfüzyonu, Çocuk Sağlığı, Kadın Doğum, İlk Yardım & CPR, Hasta Güvenliği.
- Zorluk seviyesi 1–3; her sorunun gerekçeli açıklaması vardır.

## Özellikler
- **17 rozet** ve 28 günlük aktivite takvimi
- XP / seviye sistemi, günlük seri, kategori bazlı başarı istatistikleri
- Yanlış yapılan sorular otomatik **Tekrar Defteri**'ne yazılır
- Karanlık / aydınlık tema, nabız dalgası arka planı, seviye konfeti
- Soru başına süre ayarı (15 / 20 / 30 / 45 sn veya kapalı), ses ve titreşim aç/kapa
- Klavye kısayolları: `1-4` şık, `Enter` devam, `Esc` çıkış
- **Yedekleme / geri yükleme** ve tek dokunuşla paylaşım
- Tüm ilerleme `localStorage` içinde tutulur (bu cihaza özel)
- Çevrimdışı çalışma; yeni sürüm çıktığında uygulama içinden bildirilir

## Dosyalar
| Dosya | İçerik |
|---|---|
| `index.html` | Ekranlar, stiller ve arayüz |
| `oyun.js` | Oyun motoru, modlar, rozetler, kayıt, ses |
| `veri.js` | Kategori, soru ve terim bankası |
| `service-worker.js` | Çevrimdışı önbellek + sürüm bildirimi |
| `manifest.json` | PWA yapılandırması |
| `icon-*.png` | Uygulama ikonları |

## Sürüm geçmişi
- **1.2.0** — Günün Vakası, Kategori Meydanı, Maraton, Favori Sınavı, rozetler, tema sistemi, yedekleme ve paylaşım eklendi.
- 1.1.0 — Acil Servis Vakası, Bilgi Sprinti, Terim Eşleştirme, Tekrar Defteri.
- 1.0.0 — İlk sürüm.

## Uyarı
Bu oyun **yalnızca tekrar ve öğrenme amaçlıdır**. Güncel protokoller, ilaç kılavuzları ve öğretmen/hekim yönlendirmesi esas alınmalıdır. Kişisel hasta kararı yerine geçmez.
