// Artikel edukasi, diringkas dengan kata-kata sendiri dari Buku KIA Kemenkes 2025.
// Di produksi, konten ini dikelola tim edukasi JIH melalui CMS dan ditinjau tim medis.

const portionsT2 = [
  { n: '6 porsi', name: 'Nasi atau makanan pokok', example: '1 porsi = ¾ gelas nasi atau 3 iris roti' },
  { n: '4 porsi', name: 'Lauk hewani', example: '1 potong sedang ikan atau 1 butir telur' },
  { n: '4 porsi', name: 'Lauk nabati', example: '1 potong tempe atau 2 potong tahu' },
  { n: '4 porsi', name: 'Sayuran', example: '1 mangkuk sayur matang tanpa kuah' },
  { n: '4 porsi', name: 'Buah', example: '1 pisang sedang atau 1 potong besar pepaya' },
  { n: '5 porsi', name: 'Minyak/lemak', example: '1 sendok teh, dari menumis atau santan' },
  { n: '2 porsi', name: 'Gula', example: '1 sendok makan, termasuk teh manis' }
];

const dangerT2 = 'Demam tinggi · muntah darah · sesak napas dan jantung berdebar · perdarahan atau keluar cairan dari jalan lahir · nyeri perut hebat · gerak janin berkurang';

export const articles = [
  {
    id: 'anemia', audience: 'ibu', topic: 'Gizi ibu hamil', category: 'Kehamilan', minutes: 4, pages: '6–7, 16',
    title: 'Mencegah dan mengatasi anemia saat hamil',
    teaser: 'Cara minum tablet tambah darah yang benar dan makanan sumber zat besi.',
    sentBy: 'k3',
    blocks: [
      { type: 'h', text: 'Kenapa anemia perlu dicegah?' },
      { type: 'p', text: 'Saat hamil, tubuh Ibu membuat lebih banyak darah untuk janin. Bila zat besi kurang, kadar Hb turun. Ibu jadi mudah lelah dan pusing, dan risiko perdarahan saat melahirkan serta bayi lahir dengan berat rendah ikut naik.' },
      { type: 'h', text: 'Cara minum tablet tambah darah' },
      { type: 'steps', items: [
        'Minum <b>setiap hari</b> selama hamil, sebaiknya <b>malam sebelum tidur</b> agar tidak mual.',
        'Minum bersama buah atau minuman <b>kaya vitamin C</b>, misalnya jeruk, supaya zat besi lebih mudah diserap.',
        '<b>Jangan bersamaan</b> dengan teh, kopi, susu, kalsium, atau obat maag. Kalsium dari dokter diminum pagi atau siang.',
        'Untuk <b>anemia ringan</b> (Hb 10–10,9 g/dL), dosisnya menjadi 2 tablet per hari sesuai anjuran nakes.'
      ] },
      { type: 'ttdTracker' },
      { type: 'h', text: 'Porsi makan sehari, trimester 2' },
      { type: 'p', text: 'Makan porsi kecil tapi sering: 3 kali makan utama dan 2 kali selingan. Utamakan lauk hewani untuk zat besi.' },
      { type: 'portions', items: portionsT2, foot: 'Garam paling banyak 1 sendok teh per hari. Minum air putih 8–12 gelas.' },
      { type: 'h', text: 'Sumber zat besi sehari-hari' },
      { type: 'chips', items: [
        { label: 'Hati ayam', tone: 'coral' }, { label: 'Daging sapi', tone: 'coral' }, { label: 'Ikan', tone: 'coral' }, { label: 'Telur', tone: 'coral' },
        { label: 'Bayam', tone: 'green' }, { label: 'Daun kelor', tone: 'green' }, { label: 'Tempe & kacang', tone: 'green' }
      ] },
      { type: 'danger', title: 'Segera ke RS bila mengalami', text: dangerT2, action: 'Telepon IGD Kebidanan RS JIH Solo' }
    ]
  },
  {
    id: 'porsi-hamil', audience: 'ibu', topic: 'Gizi ibu hamil', category: 'Kehamilan', minutes: 3, pages: '16',
    title: 'Porsi makan harian ibu hamil trimester 2',
    teaser: 'Takaran sehari untuk makanan pokok, lauk, sayur, dan buah.',
    blocks: [
      { type: 'p', text: 'Di trimester 2, kebutuhan energi Ibu bertambah. Bagi makan menjadi 3 kali makan utama dan 2 kali selingan agar tidak terlalu kenyang dan tetap nyaman.' },
      { type: 'portions', items: portionsT2, foot: 'Petugas kesehatan dapat menyesuaikan porsi dengan bahan makanan lokal dan berat badan Ibu.' },
      { type: 'callout', title: 'Tips', text: 'Batasi garam paling banyak 1 sendok teh per hari dan minum air putih 8–12 gelas.' }
    ]
  },
  {
    id: 'trimester-2', audience: 'ibu', topic: 'Kehamilan', category: 'Kehamilan', minutes: 5, pages: '16–17',
    title: 'Trimester 2: saatnya merencanakan kelahiran',
    teaser: 'Yang dialami Ibu dan bayi di bulan ke-4 sampai ke-6.',
    blocks: [
      { type: 'p', text: 'Di bulan ke-4 sampai ke-6, mual biasanya mereda dan nafsu makan membaik. Bayi tumbuh dari sebesar apel menjadi sebesar melon kecil, dan gerakannya mulai terasa.' },
      { type: 'h', text: 'Yang perlu Ibu lakukan' },
      { type: 'list', items: [
        'Periksa kehamilan ke dokter atau bidan paling sedikit dua kali di trimester ini.',
        'Pantau gerak bayi setiap hari.',
        'Mulai susun rencana persalinan: tempat bersalin, pendamping, kendaraan, biaya, dan calon donor darah.',
        'Ikuti kelas ibu hamil dan ajak Ayah.'
      ] },
      { type: 'danger', title: 'Tanda bahaya trimester 2', text: dangerT2 }
    ]
  },
  {
    id: 'tanda-bahaya-t2', audience: 'ibu', topic: 'Tanda bahaya', category: 'Kehamilan', minutes: 3, pages: '17',
    title: 'Kenali tanda bahaya trimester 2 dan kapan ke RS',
    teaser: 'Kondisi yang tidak boleh ditunda pemeriksaannya.',
    blocks: [
      { type: 'p', text: 'Tanda bahaya perlu diketahui Ibu dan keluarga. Bila salah satunya muncul, jangan menunggu jadwal kontrol berikutnya.' },
      { type: 'danger', title: 'Segera ke RS bila mengalami', text: dangerT2, action: 'Telepon IGD Kebidanan RS JIH Solo' },
      { type: 'callout', title: 'Cek mandiri setiap minggu', text: 'Isi ceklis tanda bahaya mingguan di aplikasi. Bila ada yang dicentang, aplikasi akan menyarankan Ibu segera ke RS.' }
    ]
  },
  {
    id: 'jiwa', audience: 'ibu', topic: 'Kesehatan jiwa', category: 'Kehamilan', minutes: 4, pages: '14',
    title: 'Menjaga kesehatan jiwa selama hamil',
    teaser: 'Gejolak emosi itu wajar, tapi kenali kapan perlu bantuan.',
    blocks: [
      { type: 'p', text: 'Selama hamil, Ibu bisa merasa mudah sedih, mudah marah, cemas, atau stres. Kondisi ini memengaruhi kesehatan Ibu dan perkembangan bayi.' },
      { type: 'h', text: 'Kenali gejalanya' },
      { type: 'list', items: ['Cemas dan khawatir berlebihan', 'Gelisah, gemetar, sulit rileks, sakit kepala', 'Jantung berdebar, sesak, atau tidak nyaman di ulu hati', 'Lelah berkepanjangan tapi sulit tidur', 'Mudah tersinggung dan hubungan dengan suami berubah'] },
      { type: 'h', text: 'Yang bisa dilakukan' },
      { type: 'list', items: ['Tidur cukup dan makan bergizi', 'Minta dukungan suami dan keluarga', 'Ceritakan ke bidan atau dokter saat kontrol, skrining kesehatan jiwa tersedia di RS'] }
    ]
  },
  {
    id: 'kelas-hamil', audience: 'ibu', topic: 'Kelas ibu hamil', category: 'Kehamilan', minutes: 2, pages: '15',
    title: 'Ikut kelas ibu hamil, ajak Ayah minimal sekali',
    teaser: 'Persiapan tubuh dan mental untuk melahirkan.',
    blocks: [
      { type: 'p', text: 'Di kelas ibu hamil, Ibu belajar tentang kehamilan, proses melahirkan, nifas, perawatan bayi baru lahir, dan gizi. Ibu juga bertemu ibu-ibu lain yang saling mendukung.' },
      { type: 'callout', title: 'Jadwal di RS JIH Solo', text: 'Tanyakan jadwal kelas ibu hamil ke bidan saat kontrol, dan ajak suami ikut paling sedikit satu kali. [Jadwal kelas dari RS JIH Solo]' }
    ]
  },
  {
    id: 'mpasi', audience: 'anak', topic: 'MPASI & gizi', category: 'MPASI & gizi', minutes: 5, pages: '56–65',
    title: 'MPASI 12–24 bulan: makanan keluarga kaya protein hewani',
    teaser: 'Porsi, tekstur, dan frekuensi makan sesuai usia.',
    blocks: [
      { type: 'stat2', items: [
        { value: '70%', text: 'kebutuhan gizi anak kini dipenuhi dari MPASI', tone: 'blue' },
        { value: '30%', text: 'masih dari ASI, lanjutkan sampai usia 2 tahun', tone: 'teal' }
      ] },
      { type: 'mpasiAges' },
      { type: 'h', text: 'Isi piring yang lengkap' },
      { type: 'p', text: 'Setiap makan utama berisi makanan pokok, lauk hewani, lauk nabati, sayur, dan buah. Lauk hewani diutamakan karena protein dan zat besinya penting untuk pertumbuhan otak dan mencegah stunting.' },
      { type: 'plate' },
      { type: 'h', text: 'Kebiasaan baik di usia ini' },
      { type: 'checks', items: ['Ajari anak makan sendiri dan minum dari gelas.', 'Makan bersama keluarga pada jam yang teratur.', 'Anak mulai pilih-pilih makanan: sajikan beragam dan menarik, jangan dipaksa.', 'Timbang dan ukur setiap bulan untuk memantau pertumbuhan.'] },
      { type: 'danger', title: 'Sebaiknya dihindari', text: 'Minuman kemasan atau kalengan yang manis · minuman bersoda · makanan instan tinggi MSG dan pengawet · makanan terlalu asam atau pedas · susu atau yoghurt rendah lemak' },
      { type: 'menus' },
      { type: 'growthLink' }
    ]
  },
  {
    id: 'gigi', audience: 'anak', topic: 'Kesehatan gigi', category: 'Tumbuh kembang', minutes: 3, pages: '66–67',
    title: 'Merawat gigi susu: sikat 2 kali sehari',
    teaser: 'Gigi susu lengkap 20 buah di usia 2 tahun.',
    blocks: [
      { type: 'p', text: 'Sampai usia 2 tahun, gigi susu anak akan lengkap berjumlah 20. Gigi susu yang sehat membantu anak mengunyah dan berbicara dengan baik.' },
      { type: 'list', items: ['Sikat gigi setelah sarapan dan sebelum tidur.', 'Pakai sikat gigi kecil berbulu lembut dan pasta gigi berfluoride seukuran biji kacang polong.', 'Kurangi makanan dan minuman manis, terutama sebelum tidur.', 'Periksakan gigi ke dokter gigi setiap 6 bulan.'] }
    ]
  },
  {
    id: 'stimulasi', audience: 'anak', topic: 'Stimulasi', category: 'Tumbuh kembang', minutes: 4, pages: '64',
    title: 'Bermain, bernyanyi, dan membacakan cerita',
    teaser: 'Stimulasi sederhana di rumah untuk usia 1–2 tahun.',
    blocks: [
      { type: 'p', text: 'Di usia 1–2 tahun, kemampuan fisik, bahasa, dan sosial anak berkembang pesat. Stimulasi sehari-hari membantunya tumbuh optimal.' },
      { type: 'list', items: ['Ajak membereskan mainan dan membantu pekerjaan ringan di rumah.', 'Bernyanyi bersama dan sebut nama bagian tubuh.', 'Bacakan cerita setiap hari dan tunjuk gambarnya.', 'Beri kesempatan mencoret-coret dan bermain dengan teman, dengan pengawasan.'] }
    ]
  },
  {
    id: 'vitamin-a', audience: 'anak', topic: 'Pencegahan', category: 'Tumbuh kembang', minutes: 2, pages: '66',
    title: 'Vitamin A dan obat cacing setiap Februari & Agustus',
    teaser: 'Dua kali setahun untuk daya tahan tubuh anak.',
    blocks: [
      { type: 'p', text: 'Vitamin A membantu daya tahan tubuh dan kesehatan mata. Obat cacing mencegah dan mengobati cacingan yang bisa mengganggu penyerapan gizi.' },
      { type: 'list', items: ['Usia 6–11 bulan: Vitamin A kapsul biru (100.000 IU).', 'Usia 1–5 tahun: Vitamin A kapsul merah (200.000 IU) setiap Februari dan Agustus.', 'Obat cacing diberikan mulai usia 1 tahun, 2 kali setahun.'] },
      { type: 'growthLink' }
    ]
  }
];

export const topics = [
  { name: 'Kehamilan', part: 'Perjalanan ibu' },
  { name: 'Melahirkan', part: 'Perjalanan ibu' },
  { name: 'Nifas', part: 'Perjalanan ibu' },
  { name: 'Menyusui & ASI perah', part: 'Perjalanan ibu' },
  { name: 'Bayi baru lahir', part: 'Anak 0–6 bulan' },
  { name: 'MPASI & gizi', part: 'Anak 6–24 bulan' },
  { name: 'Tumbuh kembang', part: 'Anak 0–6 tahun' },
  { name: 'Imunisasi', part: 'Anak 0–6 tahun' },
  { name: 'Anak sakit', part: 'Informasi umum' },
  { name: 'Pengasuhan & perlindungan', part: 'Informasi umum' },
  { name: 'Lingkungan sehat', part: 'Informasi umum' },
  { name: 'Siaga bencana', part: 'Informasi umum' }
];

export const mpasiAges = [
  { label: '6–8 bln', texture: 'Disaring atau dihaluskan, lumat dan kental. Naikkan kekentalan bertahap.', amount: 'Mulai 2–3 sendok makan, bertahap sampai ½ mangkok', freq: '2–3 kali makan utama + 1–2 kali selingan, ASI tetap sesering mungkin' },
  { label: '9–11 bln', texture: 'Dicincang atau dicacah halus, mulai makanan yang bisa digenggam.', amount: '½ sampai ¾ mangkok setiap makan', freq: '3–4 kali makan utama + 1–2 kali selingan, ASI dilanjutkan' },
  { label: '12–23 bln', texture: 'Makanan keluarga yang diiris-iris atau dipotong kecil.', amount: '¾ sampai 1 mangkok setiap makan', freq: '3–4 kali makan utama + 1–2 kali selingan di antara waktu makan' }
];

export const menus = [
  { name: 'Nasi ikan kuah kuning', desc: 'Ikan kembung kaya protein dan omega-3, dimasak dengan bumbu kuning yang ringan.', bahan: 'Nasi ¾ mangkok · ikan kembung ⅓ ekor (±30 g) · labu siam 2 sdm · bawang merah, bawang putih, kunyit · minyak kelapa 2 sdt', cara: 'Tumis bumbu halus, tambahkan air dan labu siam. Masukkan ikan, masak sampai matang. Buang durinya dengan teliti, potong kecil, sajikan dengan nasi.' },
  { name: 'Nasi sup telur puyuh bola ayam', desc: 'Dua sumber protein hewani sekaligus dalam kuah sup yang disukai anak.', bahan: 'Nasi ¾ mangkok · ayam giling 30 g · telur puyuh 2 butir · wortel dan buncis 2 sdm · bawang putih · minyak 1 sdt', cara: 'Bentuk ayam giling jadi bola kecil. Rebus bersama wortel, buncis, dan telur puyuh sampai matang. Belah telur dan potong bola ayam sebelum disajikan.' },
  { name: 'Nugget tempe ayam sayuran', desc: 'Selingan yang bisa digenggam sendiri, cocok untuk latihan makan mandiri.', bahan: 'Tempe 1 potong · ayam giling 30 g · wortel parut 1 sdm · telur ½ butir · tepung roti secukupnya', cara: 'Kukus tempe lalu haluskan. Campur dengan ayam, wortel, dan telur. Bentuk, kukus 15 menit, gulingkan di tepung roti, lalu panggang atau goreng sebentar.' }
];
