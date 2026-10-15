import { Language } from '@/types';

export interface Translations {
  // Navigation & Headers
  appTitle: string;
  tagline: string;
  kioskMode: string;
  librarianMode: string;
  studentPortal: string;
  newArrivals: string;
  newArrivalsSub: string;
  catalog: string;
  circulation: string;
  members: string;
  labels: string;
  analytics: string;
  excel: string;
  cashFines: string;
  telegram: string;
  settings: string;
  scannerReady: string;
  camera: string;
  searchBooksPlaceholder: string;
  allCategories: string;
  allAges: string;
  statusAvailable: string;
  statusBorrowed: string;
  statusInRepair: string;
  bookDetail: string;
  borrowNow: string;
  addToWishlist: string;
  wishlistAdded: string;
  synopsis: string;
  copiesCount: string;
  shelfLocation: string;
  publisher: string;
  author: string;
  year: string;
  
  // Member & Grade Levels
  gradeToddler: string;
  gradeNursery: string;
  gradeTkA: string;
  gradeTkB: string;
  gradeTeacher: string;
  gradeAlumni: string;
  academicYear: string;
  academicYearTransition: string;
  academicYearPromotionDesc: string;
  studentActive: string;
  studentGraduated: string;
  studentName: string;
  parentPhone: string;
  classGroup: string;
  teacherQuotaNote: string;
  
  // Hero & Kid Sections
  heroTitle: string;
  heroSubtitle: string;
  chipAnimals: string;
  chipDinos: string;
  chipBedtime: string;
  chipLearn: string;
  mostBorrowed: string;
  agePicks: string;
  exploreAll: string;
  comingSoon: string;
  
  // General Buttons
  close: string;
  save: string;
  cancel: string;
  delete: string;
  filter: string;
  reset: string;
  exportXlsx: string;
  print: string;
  quickAdd: string;
  developerCredit: string;
  developerHelp: string;
  
  // Book & Collection Management
  booksTab: string;
  smartBarcodeRouter: string;
  smartBarcodeRouterDesc: string;
  testMode: string;
  booksHeaderTitle: string;
  booksHeaderSubtitle: string;
  addBookScanIsbn: string;
  printLabelsBtn: string;
  searchBiblioPlaceholder: string;
  sortNewest: string;
  sortTitle: string;
  sortCopies: string;
  shelfGuide: string;
  editBook: string;
  filterLabelStatus: string;
  allLabels: string;
  labelNotPrinted: string;
  labelPrinted: string;
}

export const DICTIONARY: Record<Language, Translations> = {
  id: {
    appTitle: 'KB-TK Bhakti Tunas Harapan (SBTH)',
    tagline: 'Be Smart, Be Kind • 好好学习，天天向上',
    kioskMode: 'Mode Kiosk Anak',
    librarianMode: 'Meja Pustakawan',
    studentPortal: 'Portal Siswa & Buku Impian',
    newArrivals: 'Koleksi Buku Baru',
    newArrivalsSub: 'Buku-buku cerita terbaru yang baru saja tiba di perpustakaan SBTH',
    catalog: 'Katalog Visual Anak',
    circulation: 'Sirkulasi & Pinjam-Kembali',
    members: 'Data Anggota & Kelas',
    labels: 'Cetak Label Barcode',
    analytics: 'Analitik & Nilai Aset',
    excel: 'Excel Impor/Ekspor',
    cashFines: 'Kas Denda & QRIS',
    telegram: 'Telegram Bot & Backup',
    settings: 'Pengaturan',
    scannerReady: 'Scanner USB Siap',
    camera: 'Scan Kamera',
    searchBooksPlaceholder: 'Cari judul cerita, nama hewan, dinosaurus, atau pengarang...',
    allCategories: 'Semua Kategori Rak',
    allAges: 'Semua Tingkat Usia',
    statusAvailable: 'Tersedia di Rak',
    statusBorrowed: 'Sedang Dipinjam',
    statusInRepair: 'Dalam Perbaikan',
    bookDetail: 'Detail & Sinopsis Buku',
    borrowNow: 'Pinjam Buku Ini',
    addToWishlist: 'Simpan ke Buku Impianku',
    wishlistAdded: 'Tersimpan di Impianku',
    synopsis: 'Sinopsis / Ringkasan Cerita',
    copiesCount: 'Jumlah Eksemplar Fisik',
    shelfLocation: 'Posisi Rak',
    publisher: 'Penerbit',
    author: 'Pengarang / Ilustrator',
    year: 'Tahun Terbit',
    gradeToddler: 'Toddler (Kelompok Bermain Kecil)',
    gradeNursery: 'Nursery (Kelompok Bermain)',
    gradeTkA: 'TK-A',
    gradeTkB: 'TK-B',
    gradeTeacher: 'Guru & Tenaga Pendidik',
    gradeAlumni: 'Alumni / Sudah Lulus',
    academicYear: 'Angkatan / Tahun Ajaran',
    academicYearTransition: 'Transisi Tahun Ajaran Baru & Naik Kelas Massal',
    academicYearPromotionDesc: 'Roll-over otomatis: Toddler ke Nursery, Nursery ke TK-A, TK-A ke TK-B, dan TK-B Lulus menjadi Alumni tanpa menghapus riwayat.',
    studentActive: 'Siswa Aktif',
    studentGraduated: 'Alumni (Lulus)',
    studentName: 'Nama Lengkap Siswa / Guru',
    parentPhone: 'No. WhatsApp Ortu / Guru',
    classGroup: 'Kelas / Rombel',
    teacherQuotaNote: 'Guru & Tenaga Pendidik dapat meminjam hingga 10 buku untuk keperluan mengajar di kelas (durasi 14 hari).',
    heroTitle: 'Ayo Cari & Pilih Buku Cerita Kesukaanmu Dari Rumah! 🌈📚',
    heroSubtitle: 'Ayah, Bunda & Ananda bisa mengecek ketersediaan buku di rak perpustakaan sebelum dipinjam teman lain.',
    chipAnimals: '🦒 Hewan',
    chipDinos: '🦖 Dinosaurus',
    chipBedtime: '🌙 Dongeng Tidur',
    chipLearn: '🔤 Belajar Huruf',
    mostBorrowed: 'Paling Sering Dipinjam',
    agePicks: 'Pilihan Sesuai Usia',
    exploreAll: 'Jelajahi Semua Koleksi Buku',
    comingSoon: 'Segera Hadir',
    close: 'Tutup',
    save: 'Simpan Data',
    cancel: 'Batal',
    delete: 'Hapus',
    filter: 'Saring',
    reset: 'Reset Filter',
    exportXlsx: 'Ekspor (.xlsx)',
    print: 'Cetak Sekarang',
    quickAdd: 'Tambah Eksemplar Cepat',
    developerCredit: 'Dikembangkan untuk KB-TK Bhakti Tunas Harapan Magelang oleh Prasetyo Handy Kurniawan',
    developerHelp: 'Bantuan Pengembang & Kontak Teknis',
    booksTab: 'Koleksi & Eksemplar',
    smartBarcodeRouter: 'Smart Barcode Router Aktif',
    smartBarcodeRouterDesc: '• Scanner USB otomatis siap deteksi ISBN, buku fisik & kartu siswa',
    testMode: 'Mode Uji',
    booksHeaderTitle: 'Koleksi & Eksemplar Fisik',
    booksHeaderSubtitle: 'Manajemen katalog judul buku (Biblio) dan inventaris eksemplar fisik (Barcode unik SBTH)',
    addBookScanIsbn: 'Input Buku (Scan ISBN)',
    printLabelsBtn: 'Cetak Label',
    searchBiblioPlaceholder: 'Cari judul buku, nama pengarang, atau nomor ISBN...',
    sortNewest: 'Terbaru',
    sortTitle: 'Judul A-Z',
    sortCopies: 'Paling Banyak Eksemplar',
    shelfGuide: 'Panduan & Template Rak',
    editBook: 'Edit Buku & Eksemplar',
    filterLabelStatus: 'Status Label Stiker',
    allLabels: 'Semua Label',
    labelNotPrinted: 'Belum Dicetak Label / Belum Ditempel',
    labelPrinted: 'Sudah Ditempel Label',
  },
  en: {
    appTitle: 'KB-TK Bhakti Tunas Harapan (SBTH)',
    tagline: 'Be Smart, Be Kind • 好好学习，天天向上',
    kioskMode: 'Kids Kiosk Mode',
    librarianMode: 'Librarian Desk',
    studentPortal: 'Student Portal & Dream Books',
    newArrivals: 'New Arrivals',
    newArrivalsSub: 'Fresh new picture and story books just added to SBTH Library',
    catalog: 'Visual Book Catalog',
    circulation: 'Circulation & Desk',
    members: 'Members & Classrooms',
    labels: 'Print Spine Labels',
    analytics: 'Analytics & Asset Value',
    excel: 'Excel Import / Export',
    cashFines: 'Fines & QRIS System',
    telegram: 'Telegram Bot & Backup',
    settings: 'Settings',
    scannerReady: 'USB Scanner Ready',
    camera: 'Camera Scanner',
    searchBooksPlaceholder: 'Search stories, animals, dinosaurs, or authors...',
    allCategories: 'All Categories',
    allAges: 'All Age Groups',
    statusAvailable: 'Available on Shelf',
    statusBorrowed: 'Currently Borrowed',
    statusInRepair: 'Under Repair',
    bookDetail: 'Book Details & Synopsis',
    borrowNow: 'Borrow This Book',
    addToWishlist: 'Add to My Dream Books',
    wishlistAdded: 'Saved in Wishlist',
    synopsis: 'Synopsis / Story Summary',
    copiesCount: 'Physical Copies Count',
    shelfLocation: 'Shelf Location',
    publisher: 'Publisher',
    author: 'Author / Illustrator',
    year: 'Publication Year',
    gradeToddler: 'Toddler (Playgroup A)',
    gradeNursery: 'Nursery (Playgroup B)',
    gradeTkA: 'Kindergarten A (TK-A)',
    gradeTkB: 'Kindergarten B (TK-B)',
    gradeTeacher: 'Teachers & School Staff',
    gradeAlumni: 'Alumni / Graduated',
    academicYear: 'Academic Cohort / Year',
    academicYearTransition: 'Academic Year Transition & Batch Promotion',
    academicYearPromotionDesc: '1-Click Roll-over: Toddler to Nursery, Nursery to TK-A, TK-A to TK-B, and TK-B graduated to Alumni without deleting history.',
    studentActive: 'Active Student',
    studentGraduated: 'Alumni (Graduated)',
    studentName: 'Full Name (Student / Teacher)',
    parentPhone: 'Parent / Teacher WhatsApp',
    classGroup: 'Classroom Group',
    teacherQuotaNote: 'Teachers and educators may borrow up to 10 books for classroom teaching (14 days loan period).',
    heroTitle: "Let's Find & Pick Your Favorite Storybooks From Home! 🌈📚",
    heroSubtitle: 'Parents & kids can check library book availability before others borrow them.',
    chipAnimals: '🦒 Animals',
    chipDinos: '🦖 Dinosaurs',
    chipBedtime: '🌙 Bedtime Stories',
    chipLearn: '🔤 Alphabet & Phonics',
    mostBorrowed: 'Most Borrowed Books',
    agePicks: 'Picks by Age Group',
    exploreAll: 'Explore All Books',
    comingSoon: 'Coming Soon',
    close: 'Close',
    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    filter: 'Filter',
    reset: 'Reset Filter',
    exportXlsx: 'Export (.xlsx)',
    print: 'Print Now',
    quickAdd: 'Quick Add Copies',
    developerCredit: 'Developed for KB-TK Bhakti Tunas Harapan Magelang by Prasetyo Handy Kurniawan',
    developerHelp: 'Developer Support & Technical Contact',
    booksTab: 'Book Collections & Copies',
    smartBarcodeRouter: 'Smart Barcode Router Active',
    smartBarcodeRouterDesc: '• USB Scanner automatically ready for ISBN, book barcodes & student cards',
    testMode: 'Test Mode',
    booksHeaderTitle: 'Book Collections & Physical Copies',
    booksHeaderSubtitle: 'Manage bibliographic records (Biblio) and physical inventory copies (SBTH unique barcodes)',
    addBookScanIsbn: 'Add Book (Scan ISBN)',
    printLabelsBtn: 'Print Labels',
    searchBiblioPlaceholder: 'Search by title, author, or ISBN number...',
    sortNewest: 'Newest',
    sortTitle: 'Title A-Z',
    sortCopies: 'Most Copies',
    shelfGuide: 'Shelf Naming Guide',
    editBook: 'Edit Book & Copies',
    filterLabelStatus: 'Label Sticker Status',
    allLabels: 'All Labels',
    labelNotPrinted: 'Unprinted / Not Yet Affixed',
    labelPrinted: 'Label Affixed to Book',
  },
  zh: {
    appTitle: 'KB-TK Bhakti Tunas Harapan (SBTH)',
    tagline: 'Be Smart, Be Kind • 好好学习，天天向上',
    kioskMode: '儿童自主阅读角 (Kiosk)',
    librarianMode: '图书管理员操作台',
    studentPortal: '学生乐园与心愿书单',
    newArrivals: '新书上架',
    newArrivalsSub: '刚刚入库的新绘本与双语故事书，快来看看吧！',
    catalog: '少儿视觉图书目录',
    circulation: '借书还书前台',
    members: '学生与教师会员',
    labels: '条形码标签打印',
    analytics: '藏书分析与资产评估',
    excel: 'Excel 批量导入导出',
    cashFines: '逾期金与QRIS扫码',
    telegram: 'Telegram 自动备份',
    settings: '系统设置',
    scannerReady: 'USB 扫描枪就绪',
    camera: '手机摄像头扫码',
    searchBooksPlaceholder: '搜索故事标题、小动物、恐龙或作者...',
    allCategories: '全部书架类别',
    allAges: '全部年龄段',
    statusAvailable: '在架可借',
    statusBorrowed: '借阅中',
    statusInRepair: '维护修补中',
    bookDetail: '图书详情与内容简介',
    borrowNow: '借阅此书',
    addToWishlist: '加入心愿书单',
    wishlistAdded: '已在心愿书单',
    synopsis: '内容简介 / 故事梗概',
    copiesCount: '实体藏书数量',
    shelfLocation: '书架具体位置',
    publisher: '出版社',
    author: '作者 / 绘者',
    year: '出版年份',
    gradeToddler: '托儿班 (Toddler)',
    gradeNursery: '幼儿班 (Nursery)',
    gradeTkA: '幼儿低班 (TK-A)',
    gradeTkB: '幼儿高班 (TK-B)',
    gradeTeacher: '教师与教职工',
    gradeAlumni: '校友 / 往届毕业生',
    academicYear: '届别 / 入学学年',
    academicYearTransition: '新学年一键升班与毕业归档',
    academicYearPromotionDesc: '智能升班：Toddler升入Nursery，Nursery升入TK-A，TK-A升入TK-B，TK-B毕业转入校友归档，完整保留历史借阅数据。',
    studentActive: '在校学生',
    studentGraduated: '毕业校友 (Alumni)',
    studentName: '学生 / 教师姓名',
    parentPhone: '家长 / 教师微信或WhatsApp',
    classGroup: '所属班级',
    teacherQuotaNote: '教师借阅配额高达10册，借阅周期为14天，方便课堂辅助教学。',
    heroTitle: '在家探索并挑选你最喜爱的故事绘本！🌈📚',
    heroSubtitle: '家长与小朋友可在借阅前在线查看图书在架状态。',
    chipAnimals: '🦒 小动物',
    chipDinos: '🦖 恐龙故事',
    chipBedtime: '🌙 晚安绘本',
    chipLearn: '🔤 快乐识字',
    mostBorrowed: '最受欢迎借阅榜',
    agePicks: '分龄阅读推荐',
    exploreAll: '浏览全部藏书',
    comingSoon: '敬请期待',
    close: '关闭',
    save: '保存数据',
    cancel: '取消',
    delete: '删除',
    filter: '筛选',
    reset: '重置筛选',
    exportXlsx: '导出 Excel (.xlsx)',
    print: '立即打印',
    quickAdd: '快速追加复本',
    developerCredit: '由 Prasetyo Handy Kurniawan 为 KB-TK Bhakti Tunas Harapan (SBTH) 精心开发',
    developerHelp: '系统开发者与技术支持联系方式',
    booksTab: '少儿藏书与实体册',
    smartBarcodeRouter: '智能条码路由器已启动',
    smartBarcodeRouterDesc: '• USB扫描枪已准备就绪，支持自动识别ISBN、图书条码及学生会员卡',
    testMode: '测试模式',
    booksHeaderTitle: '少儿藏书与实体册管理',
    booksHeaderSubtitle: '图书书目(Biblio)与实体藏书条码(SBTH)统一高效管理',
    addBookScanIsbn: '录入新书 (扫描ISBN)',
    printLabelsBtn: '打印书标',
    searchBiblioPlaceholder: '搜索书名、作者或ISBN条形码...',
    sortNewest: '最新入库',
    sortTitle: '按标题 (A-Z)',
    sortCopies: '藏书册数最多',
    shelfGuide: '书架命名与摆放指南',
    editBook: '编辑图书与实体册',
    filterLabelStatus: '书标状态',
    allLabels: '全部标签',
    labelNotPrinted: '未打印书标 / 未贴标',
    labelPrinted: '已贴标上架',
  },
};

