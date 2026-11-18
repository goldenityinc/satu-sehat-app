# Modul Aplikasi Pelayanan · demo aplikasi pemantauan pasien per modul

Prototipe web aplikasi pasien–dokter–perawat RS JIH Solo. Beranda bergaya aplikasi layanan (seperti JKN Mobile) dengan tujuh modul: **KIA**, **Diabetes**, **Hipertensi**, **Jantung**, **Stroke**, **TBC**, **Ginjal kronis**. RS menentukan modul mana yang aktif; pasien melihat modul aktif yang ia ikuti. Di laptop tampil dalam bingkai HP dengan panel demo, di HP tampil layar penuh.

## Menjalankan di localhost

```bash
npm install
npm run dev
```

Buka http://localhost:5173. Server juga terbuka di jaringan lokal, jadi bisa dibuka dari HP yang satu Wi-Fi lewat alamat "Network" di terminal. Build statis: `npm run build` → folder `dist/`.

## Peran

| Peran | Bisa apa |
| --- | --- |
| Pasien | Membaca rekam medis, modul, jadwal, edukasi. **Satu-satunya yang bisa diubah: centang minum obat.** Menampilkan Kartu QR. |
| Dokter | Scan QR pasien → akses 24 jam (tercatat, pasien diberi notifikasi) → lihat riwayat lintas faskes → input pemeriksaan → terkirim ke SATUSEHAT dan muncul di HP pasien. Bisa praktik di RS JIH Solo atau faskes mitra. |
| Perawat | Ruang Perawat: saksikan minum obat TBC (PMO), daftar pasien per modul, scan QR saat kunjungan untuk membuka pemantauan dan mencatat kunjungan rumah. Tidak melihat rekam medis lengkap. |

Ganti peran dan akun lewat panel demo (desktop) atau menu **Akun** (HP).

**Modul aktif di RS:** panel demo punya pengaturan admin untuk menyalakan/mematikan modul. Modul yang dimatikan hilang dari aplikasi pasien, dokter, dan perawat. Diagnosis dari dokter hanya dicatat di rekam medis dan tidak mengaktifkan modul.

## Keamanan akses & dokter pribadi

- **QR dinamis:** token sesi berlaku 10 menit, sekali pakai. Dokter/perawat tidak memilih pasien: kamera mendeteksi otomatis QR yang sedang ditampilkan pasien. QR lama atau tangkapan layar ditolak dan pasien diberi tahu.
- **Sesi akses:** scan QR yang valid membuka sesi 24 jam untuk dokter tersebut. Pasien melihat sesi aktif di Kartu QR dan bisa **Akhiri** kapan saja; dokter langsung kehilangan akses.
- **Rekam medis:** diagnosis berkode ICD-10 (Condition di SATUSEHAT), tim dokter per penyakit (bisa lebih dari satu dokter untuk penyakit yang sama), obat, dan alergi. Dokter bisa menambah diagnosis; diagnosis tercatat di rekam medis dan terkirim ke SATUSEHAT.
- **Dokter pribadi:** wajib untuk Jantung dan Stroke. Menerima notifikasi darurat (tombol Darurat pasien, nilai di luar batas dari faskes mana pun). Rekam medis tetap hanya dibuka lewat scan QR.
- **Notifikasi darurat otomatis:** aturan di `src/lib/thresholds.js` (mis. TD ≥ 180/120, TD ≥ 140/90 saat hamil, nadi > 120/< 50, DJJ < 110/> 160, Hb < 8, NIHSS naik ≥ 2, BB turun > 5% saat TBC, gula darah < 70 atau ≥ 300 mg/dL, HbA1c ≥ 9%, kalium ≥ 6,0 mmol/L, eGFR < 15 atau turun > 25%). Pelanggaran memicu notifikasi ke pasien, dokter pribadi, dan tim dokter modul.
- **Navigasi seragam:** semua peran memakai 5 slot yang sama (Beranda · Pasien/Riwayat · QR di tengah · Notifikasi/Darurat · Akun).

## Pasien contoh

- **Rina Kartika**: modul KIA (hamil 24 minggu + anak Arka 17 bulan).
- **Slamet Riyadi**: modul Jantung (pasca stent, hipertensi) + Stroke (pasca stroke iskemik, rehabilitasi).
- **Dimas Prasetyo**: modul TBC (fase lanjutan, didampingi perawat PMO, berobat di klinik mitra).
- **Sri Wahyuni**: modul Diabetes (DM tipe 2, HbA1c 7,8% membaik, gula darah dari glukometer di rumah, cek komplikasi mata/ginjal/kaki).
- **Budi Santoso**: modul Hipertensi (tekanan darah dari tensimeter di rumah) + Ginjal kronis (stadium 3b, eGFR dan kalium per hasil lab). Dokter: dr. Bayu Aditya, Sp.PD-KGH.

## Alur demo yang disarankan

1. Pasien Pak Slamet: beranda dengan 2 modul, grafik TD/LDL vs target, NIHSS dan skala Rankin.
2. Ganti ke Dokter → Scan QR → pilih Pak Slamet → Input pemeriksaan → Simpan.
3. Ganti ke Pasien Pak Slamet → notifikasi akses dokter + hasil baru, grafik ikut ter-update, Riwayat menampilkan catatan baru.
4. Ganti ke Perawat → saksikan minum obat Dimas → catat kunjungan rumah. Lalu Pasien Dimas: obat tertanda "Disaksikan perawat (PMO)".
5. KIA tetap utuh: dokter input K3 untuk Ibu Rina (atau tombol "Bidan simpan hasil K3"), lalu buka akun Rina.
6. Modul sesuai kebutuhan RS: di panel demo matikan salah satu modul (mis. Ginjal kronis) → modul hilang dari beranda Pak Budi dan menu dokter.
7. Ginjal kronis: Dokter dr. Bayu → QR Pak Budi → input kalium 6,2 → notifikasi darurat hiperkalemia di HP Pak Budi.
8. **Reset demo ke awal** untuk mengulang.

Tanggal demo dikunci ke Kamis, 8 Oktober 2026. Semua state disimpan di `localStorage` browser, sehingga semua peran berbagi data seperti satu server.

## Struktur

```
src/
  data/patients.js   Pasien, dokter, faskes mitra, kader, modul, data klinis per modul
  data/simrs.js      Data KIA (kehamilan, anak, imunisasi) + simulasi API SIMRS
  data/vaccines.js   Jadwal imunisasi rutin Kemenkes (Buku KIA 2025)
  data/articles.js   Edukasi, diringkas dari Buku KIA
  lib/clinical.js    Aturan klinis: usia kehamilan, HPL, status imunisasi
  lib/patientView.js Agenda, peringatan, riwayat gabungan per pasien
  store.jsx          State: peran, catatan obat, input dokter, kunjungan kader, log akses, notifikasi
  screens/           Pasien.jsx, Modul.jsx (TBC/Jantung/Stroke/Diabetes/Hipertensi/Ginjal), Dokter.jsx, Kader.jsx, Ibu.jsx, Anak.jsx, Edukasi.jsx
```

Untuk produksi: scan QR memakai kamera sungguhan, `store.jsx` diganti backend dengan autentikasi per peran dan audit log, integrasi SIMRS dan SATUSEHAT (FHIR) sungguhan, serta semua aturan klinis divalidasi tim medis.

Semua nama pasien, tenaga kesehatan, nomor identitas, dan No. batch adalah fiktif.
