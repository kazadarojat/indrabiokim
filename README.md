# 🧠 Indra Lab — Biokimia Sistem Indra

> Laboratorium belajar interaktif untuk memahami bagaimana rangsangan sensorik diubah menjadi sinyal biologis melalui jalur transduksi pada sistem indra.

Indra Lab adalah aplikasi web edukasi berbahasa Indonesia yang menyajikan **enam jalur sinyal sensorik** melalui diagram 2D interaktif, penjelasan bertahap, dan kuis dengan penilaian otomatis. Dirancang sebagai pendamping belajar Biokimia Sistem Indra, aplikasi ini membantu menghubungkan rangsangan, reseptor, molekul pensinyalan, perubahan ion, potensial membran, hingga pelepasan neurotransmiter.

## ✨ Fitur Utama

- 🧬 **Enam jalur transduksi sensorik** dengan penjelasan mekanisme molekuler secara bertahap.
- 🔬 **Diagram 2D interaktif** yang menampilkan komponen anatomi, molekul, kanal, pergerakan ion, dan perubahan potensial membran.
- ⏯️ **Navigasi langkah demi langkah** untuk mempelajari urutan peristiwa dalam setiap jalur.
- 📝 **Kuis interaktif** dengan soal pilihan ganda dan soal mengurutkan tahapan.
- 🎯 **Penilaian otomatis** beserta penjelasan jawaban.
- 📊 **Pelacakan kemajuan belajar** untuk melihat skor terbaik, status penguasaan tiap jalur, dan riwayat sesi.
- 💾 **Penyimpanan lokal** melalui `localStorage` pada browser, sehingga kemajuan dapat tersedia kembali di browser yang sama.
- 📱 **Tampilan responsif** untuk desktop maupun perangkat seluler.
- ♿ **Fitur aksesibilitas dasar**, termasuk navigasi semantik, tautan lewati ke konten, dan pengumuman status bagi pembaca layar.

## 🔎 Enam Jalur yang Dipelajari

| Jalur | Fokus | Rangsangan / proses utama |
|---|---|---|
| 👁️ **Optik** | Fototransduksi retina | Cahaya mengaktifkan rodopsin dan memulai kaskade transduksi fotoreseptor. |
| 🌡️ **Integumen** | Transduksi termal pada kulit | Rangsangan panas mengaktifkan ujung saraf sensorik. |
| 👃 **Olfaktori** | Transduksi penciuman | Molekul odoran mengaktifkan neuron sensorik olfaktori. |
| 👅 **Gustatori** | Transduksi rasa manis | Aktivasi reseptor rasa pada sel pengecap tipe II. |
| 🧭 **Vestibular** | Transduksi percepatan linier | Pergerakan otokonia membengkokkan berkas rambut pada makula sakulus. |
| 🎧 **Koklear** | Transduksi pendengaran | Getaran koklea membengkokkan stereosilia sel rambut dan memicu pelepasan glutamat. |

Setiap jalur dilengkapi langkah-langkah mekanisme, konteks fisiologis, dan poin penting untuk membantu pengulangan materi.

## 🚀 Menjalankan Aplikasi

Indra Lab merupakan aplikasi web statis yang menggunakan HTML, CSS, dan JavaScript biasa. **Tidak memerlukan instalasi paket, server backend, atau API key.**

### Opsi 1 — Buka langsung

1. Unduh atau kloning repositori ini.
2. Buka file `index.html` menggunakan browser modern.

### Opsi 2 — Jalankan melalui server lokal

Untuk pengalaman yang lebih konsisten, jalankan server HTTP sederhana dari direktori proyek.

Dengan Python:

```bash
python -m http.server 8000
```

Kemudian buka:

```text
http://localhost:8000
```

### Opsi 3 — GitHub Pages

Repositori ini dapat dipublikasikan sebagai situs statis melalui GitHub Pages:

1. Buka **Settings → Pages** pada repositori.
2. Pada bagian *Build and deployment*, pilih **Deploy from a branch**.
3. Pilih branch `main` dan folder `/(root)`, lalu simpan.
4. Tunggu proses deployment selesai dan buka URL yang ditampilkan oleh GitHub Pages.

## 🗂️ Struktur Proyek

```text
indrabiokim/
├── index.html       # Kerangka halaman dan titik masuk aplikasi
├── styles.css       # Gaya visual, layout responsif, dan komponen UI
├── data.js          # Data jalur, langkah mekanisme, soal kuis, dan kredit aset
├── scenes.js        # Ilustrasi SVG/2D untuk jalur sensorik
├── app.js           # Navigasi, interaksi diagram, kuis, dan progres belajar
├── assets/
│   ├── fonts/       # Berkas font lokal
│   └── img/         # Gambar anatomi dan histologi
└── README.md
```

## 🧭 Cara Menggunakan

1. Buka **Indeks jalur** untuk melihat materi yang tersedia.
2. Pilih salah satu jalur sensorik.
3. Ikuti urutan langkah untuk memahami rangsangan, perubahan molekuler, pergerakan ion, dan respons sel.
4. Gunakan menu **Kuis** untuk menguji pemahaman pada satu jalur atau seluruh materi.
5. Buka **Kemajuan** untuk memantau skor dan riwayat latihan.

Kuis mendukung sesi dengan jumlah soal tertentu maupun seluruh soal yang tersedia. Jenis soal mencakup pilihan ganda dan pengurutan tahapan.

## 💾 Data dan Privasi

Kemajuan belajar disimpan secara lokal pada browser menggunakan kunci penyimpanan `indralab.kemajuan.v1`. Data ini tidak membutuhkan akun atau backend untuk fungsi penyimpanan yang tersedia di aplikasi.

- Kemajuan tersimpan pada browser dan perangkat yang digunakan.
- Menghapus data situs atau penyimpanan browser dapat menghapus kemajuan belajar.
- Data tidak otomatis tersinkronisasi antarperangkat atau antarbrowser.

## 🧰 Teknologi

- **HTML5** — struktur dan semantik halaman.
- **CSS3** — layout responsif, desain antarmuka, dan animasi.
- **JavaScript** — navigasi berbasis hash, diagram interaktif, kuis, dan penyimpanan progres.
- **SVG** — visualisasi jalur dan ilustrasi 2D.
- **Web Storage API** — penyimpanan kemajuan di browser.

Aplikasi tidak menggunakan framework JavaScript maupun dependensi paket eksternal untuk menjalankan fitur inti.

## 📚 Catatan Akademik

Indra Lab merupakan **media bantu belajar**, bukan pengganti buku ajar, kuliah, atau penilaian dosen. Detail fisiologi dan biokimia sebaiknya diverifikasi dengan sumber akademik yang relevan, terutama ketika digunakan untuk laporan, ujian, atau keperluan klinis.

Aset gambar yang dicantumkan dalam data aplikasi memiliki kredit dan informasi lisensi masing-masing. Periksa sumber serta ketentuan lisensi sebelum menggunakan kembali aset di luar proyek ini.

## 🛣️ Pengembangan Berikutnya

Beberapa peningkatan yang dapat dipertimbangkan:

- [ ] Menambahkan referensi akademik untuk setiap jalur dan klaim fisiologis.
- [ ] Menyediakan opsi ekspor atau impor progres belajar.
- [ ] Menambah mode latihan berbasis topik dan pengulangan soal yang belum dikuasai.
- [ ] Melakukan peninjauan ilmiah dan uji aksesibilitas secara sistematis.
- [ ] Menambahkan panduan kontribusi dan pelaporan masalah.

## 👩‍💻 Kontribusi

Saran perbaikan materi, koreksi ilmiah, laporan bug, dan ide fitur sangat terbuka. Silakan buat *issue* untuk mendiskusikan masalah atau usulan sebelum mengajukan perubahan.

## 📄 Lisensi

Lisensi repositori belum dinyatakan secara eksplisit. Sebelum menggunakan atau mendistribusikan ulang kode proyek, pastikan pemilik repositori telah menentukan lisensi yang sesuai. Lisensi kode dan lisensi aset pihak ketiga dapat berbeda.

---

<p align="center">
  <strong>Belajar bukan sekadar menghafal jalur—pahami bagaimana rangsangan menjadi sinyal. 🧠✨</strong>
</p>
