/* ==========================================================================
   KODLAMALAB - HATA & ZAMAN AŞIMI KORUMALI ANA MOTOR (script.js)
   ========================================================================== */

const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxuhB_vQNILjX9r9C5GVo6OJ7GzFkZVeGxheQiVG3EIxTJhIa6mQXmpCyHRMTQWKB2p/exec",
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyAiEIDmpnANk7pe-kkzj_FRjg-S8Y5cYt4",
    authDomain: "kodlamalab-56774.firebaseapp.com",
    projectId: "kodlamalab-56774",
    storageBucket: "kodlamalab-56774.firebasestorage.app",
    messagingSenderId: "696805360515",
    appId: "1:696805360515:web:ea0bdd2bef750af9142cb6"
  }
};

const STORAGE_KEYS = {
  USERS: "kodlamalab_users_v1",
  SESSION: "kodlamalab_session_v1",
  PROJECTS: "kodlamalab_projects_v1",
  TR_CACHE: "kodlamalab_tr_cache_v1",
  RECENT_DICT: "kodlamalab_recent_dict_v1"
};

const GAME_CATALOG = {
  sandbox_python: { name: "Python Serbest Kodlama", icon: "fa-brands fa-python" },
  sandbox_csharp: { name: "C# Serbest Kodlama", icon: "fa-solid fa-code" },
  game_mcq: { name: "Çoktan Seçmeli Test", icon: "fa-solid fa-list-check" },
  game_order: { name: "Kod / Cümle Sıralama", icon: "fa-solid fa-cubes" },
  game_fill: { name: "Boşluk Doldurma", icon: "fa-solid fa-pen-to-square" },
  game_bug: { name: "Hata Avcısı (Bug Hunt)", icon: "fa-solid fa-bug" },
  game_output: { name: "Çıktı & Anlam Tahmini", icon: "fa-solid fa-terminal" }
};

const GAME_TYPE_LABELS = {
  mcq: "Çoktan Seçmeli",
  order: "Blok Sıralama",
  fill: "Boşluk Doldurma",
  bug: "Hata Avcısı",
  output: "Çıktı Tahmini"
};

const DEFAULT_AVATAR = {
  bg: "#0095ff",
  skin: "#e8b896",
  hairStyle: "short",
  hairColor: "#0f172a",
  accessory: "none",
  shirt: "#00e676"
};

const PRESET_AVATARS = [
  { name: "Siber Mavi", bg: "#0095ff", skin: "#f8d9c6", hairStyle: "spiky", hairColor: "#00f0ff", accessory: "sunglasses", shirt: "#0b111d" },
  { name: "Zümrüt Kodcu", bg: "#00b894", skin: "#e8b896", hairStyle: "short", hairColor: "#111827", accessory: "headphones", shirt: "#00e676" },
  { name: "Kızıl Hacker", bg: "#ff2a5f", skin: "#f8d9c6", hairStyle: "long", hairColor: "#1e1b2e", accessory: "glasses", shirt: "#1f2937" },
  { name: "Gece Mimarı", bg: "#1e293b", skin: "#c68642", hairStyle: "curly", hairColor: "#0f172a", accessory: "cap", shirt: "#0095ff" },
  { name: "Neon Alfa", bg: "#0891b2", skin: "#e8b896", hairStyle: "spiky", hairColor: "#ff2a5f", accessory: "headphones", shirt: "#0f172a" },
  { name: "Minimal Pro", bg: "#0f172a", skin: "#8d5524", hairStyle: "none", hairColor: "#000000", accessory: "sunglasses", shirt: "#00e676" }
];

const STARTER_CODE = {
  python: `# KodlamaLab - Python 3 Gerçek Çalışma Alanı\nisim = "Kodcu"\nprint(f"Merhaba {isim}, Python motoru aktif!")\n\nfor i in range(1, 4):\n    print(f"Adım {i}: Hazırsın!")\n`,
  csharp: `using System;\n\nclass Program\n{\n    static void Main()\n    {\n        string isim = "Kodcu";\n        Console.WriteLine($"Merhaba {isim}, C# derleyicisi hazır!");\n\n        for (int i = 1; i <= 3; i++)\n        {\n            Console.WriteLine($"Adım {i}: Devam!");\n        }\n    }\n}\n`
};

const AI_TOPICS_POOL = {
  python: [
    "Python değişkenler, string metotları ve temel algoritmalar",
    "Python listeler, sözlükler (dict) ve list comprehension",
    "Python if-elif-else koşulları, for/while döngüleri ve fonksiyonlar",
    "Python OOP sınıflar, try-except hata yakalama ve modüller"
  ],
  csharp: [
    "C# temel veri tipleri, string interpolation ve operatörler",
    "C# koşullu ifadeler, switch-case, diziler ve List koleksiyonları",
    "C# metotlar, OOP sınıflar, constructor ve encapsulation",
    "C# LINQ, lambda ifadeleri, try-catch ve async/await temelleri"
  ],
  english: [
    "Günlük konuşma İngilizcesi, zamanlar ve temel gramer kalıpları",
    "İngilizce bağlaçlar (although, despite, however) ve koşul cümleleri",
    "İngilizce Phrasal Verbs, deyimler ve doğru kelime seçimi",
    "Yazılımcılar için teknik İngilizce ve dokümantasyon okuma"
  ]
};

const STATE = {
  db: null,
  cloudReady: false,
  usersMap: {},
  currentUser: null,
  activeView: "sandbox",
  sandboxLang: "python",
  editor: null,
  pyodide: null,
  pyodideLoading: false,
  lastReviewedHash: "",
  activeCourse: "python",
  leaderboardSort: "totalXp",
  draftAvatar: { ...DEFAULT_AVATAR },
  lesson: {
    active: false,
    course: null,
    lessonObj: null,
    questions: [],
    index: 0,
    hearts: 3,
    earnedXp: 0,
    selectedAnswer: null,
    orderedTokens: [],
    answered: false
  }
};

const CURRICULUM = {
  python: {
    title: "Python Yolculuğu (Sıfırdan Zirveye)",
    desc: "Değişkenlerden döngülere, fonksiyonlardan OOP ve gerçek algoritmalara adım adım ilerle.",
    units: [
      {
        title: "Ünite 1: Temel Taşlar",
        level: "Başlangıç",
        lessons: [
          {
            id: "py_1", title: "Print & Değişkenler", desc: "Ekrana yazdırma ve veri saklama", xp: 40, icon: "fa-terminal",
            topic: "Python print fonksiyonu, değişken tanımlama ve temel string yazımı",
            questions: [
              { type: "mcq", prompt: "Python'da ekrana 'Merhaba' yazdırmak için hangi kod doğrudur?", options: ["print('Merhaba')", "echo('Merhaba')", "Console.Write('Merhaba')", "printf('Merhaba')"], answer: "print('Merhaba')", explain: "Python'da konsola çıktı vermek için print() fonksiyonu kullanılır." },
              { type: "order", prompt: "Yaş değişkenini 28 yapıp ekrana yazdıran kodu sırala:", tokens: ["yas", "=", "28", ";", "print(yas)"], answer: ["yas", "=", "28", ";", "print(yas)"], explain: "Değişken ataması '=' ile yapılır, ardından print() ile yazdırılır." },
              { type: "fill", prompt: "Aşağıdaki boşluğu doldurarak 'Python' metnini ekrana yazdır:", code: "____('Python')", answer: "print", explain: "Ekrana veri basan temel yerleşik fonksiyon print'tir." },
              { type: "bug", prompt: "Bu Python kodundaki hata nerede?", code: "isim = Harun\nprint(isim)", options: ["Harun tırnak içine alınmalı ('Harun')", "print büyük harfle yazılmalı", "Satır sonuna noktalı virgül eksik", "Kodda hata yok"], answer: "Harun tırnak içine alınmalı ('Harun')", explain: "Metin (string) değerleri tek veya çift tırnak içinde yazılmalıdır." }
            ]
          },
          {
            id: "py_2", title: "Veri Tipleri & Matematik", desc: "int, float, str ve temel operatörler", xp: 45, icon: "fa-calculator",
            topic: "Python int float str veri tipleri, type() ve matematiksel operatörler",
            questions: [
              { type: "output", prompt: "Bu kod çalıştırıldığında ekranda ne yazar?", code: "a = 10\nb = 3\nprint(a // b)", options: ["3", "3.33", "1", "30"], answer: "3", explain: "// operatörü tam sayı bölmesi yapar, ondalık kısmı atar." },
              { type: "mcq", prompt: "Python'da bir değişkenin tipini öğrenmek için hangi fonksiyon kullanılır?", options: ["type()", "typeof()", "varType()", "check()"], answer: "type()", explain: "type(degisken) ifadesi verinin int, str, list gibi tipini döndürür." },
              { type: "fill", prompt: "Metin olan '25' değerini tam sayıya çevirmek için boşluğu doldur:", code: "sayi = ___('25')", answer: "int", explain: "int() fonksiyonu uygun metinleri tam sayıya dönüştürür." },
              { type: "order", prompt: "İki sayının karesini (üssünü) hesaplayan ifadeyi diz:", tokens: ["sonuc", "=", "5", "**", "2"], answer: ["sonuc", "=", "5", "**", "2"], explain: "Python'da üs alma işlemi ** operatörüyle yapılır." }
            ]
          },
          {
            id: "py_3", title: "Koşullar (if / elif / else)", desc: "Karar mekanizmaları kurma", xp: 50, icon: "fa-code-branch",
            topic: "Python if elif else koşullu ifadeler ve karşılaştırma operatörleri",
            questions: [
              { type: "bug", prompt: "Bu koşul bloğundaki sözdizimi hatası nedir?", code: "puan = 85\nif puan >= 50\n    print('Geçti')", options: ["if satırının sonunda ':' (iki nokta) eksik", "puan >= 50 parantez içinde olmalı", "print içeri alınmamalı", "if yerine when yazılmalı"], answer: "if satırının sonunda ':' (iki nokta) eksik", explain: "Python'da if, elif, else, for ve def satırları iki nokta (:) ile biter." },
              { type: "output", prompt: "Çıktı ne olur?", code: "x = 7\nif x % 2 == 0:\n    print('Çift')\nelse:\n    print('Tek')", options: ["Tek", "Çift", "7", "Hata"], answer: "Tek", explain: "7'nin 2'ye bölümünden kalan 1 olduğu için else bloğu çalışır." },
              { type: "fill", prompt: "İkinci bir koşul eklemek için kullanılan anahtar kelime nedir?", code: "if x > 10:\n    print('Büyük')\n____ x == 10:\n    print('Eşit')", answer: "elif", explain: "Python'da 'else if' kısaltılarak elif şeklinde yazılır." },
              { type: "mcq", prompt: "Eşitlik kontrolü için hangi operatör kullanılır?", options: ["==", "=", "===", ":="], answer: "==", explain: "Tek '=' atama yapar, '==' ise iki değerin eşit olup olmadığını kontrol eder." }
            ]
          }
        ]
      },
      {
        title: "Ünite 2: Döngüler & Koleksiyonlar",
        level: "Temel",
        lessons: [
          {
            id: "py_4", title: "For & While Döngüleri", desc: "Tekrarlı işlemleri otomatikleştirme", xp: 55, icon: "fa-rotate",
            topic: "Python for while döngüleri range break continue",
            questions: [
              { type: "output", prompt: "Ekrana kaç satır yazdırılır?", code: "for i in range(3):\n    print(i)", options: ["3 satır (0, 1, 2)", "4 satır (0, 1, 2, 3)", "3 satır (1, 2, 3)", "Sonsuz döngü"], answer: "3 satır (0, 1, 2)", explain: "range(3) sıfırdan başlayıp 3 hariç sayılar üretir: 0, 1, 2." },
              { type: "mcq", prompt: "Bir döngüyü anında durdurup dışına çıkmak için hangi komut kullanılır?", options: ["break", "continue", "stop", "exit"], answer: "break", explain: "break döngüyü tamamen sonlandırır; continue ise sadece o turu atlar." },
              { type: "fill", prompt: "1'den 5'e kadar dönen döngüdeki boşluğu doldur:", code: "for i in _____(1, 6):\n    print(i)", answer: "range", explain: "range(baslangic, bitis) bitiş değeri hariç sayı dizisi oluşturur." },
              { type: "order", prompt: "While döngüsü başlığını doğru sırala:", tokens: ["while", "can", ">", "0", ":"], answer: ["while", "can", ">", "0", ":"], explain: "Koşul doğru olduğu sürece çalışan while döngüsü ':' ile biter." }
            ]
          },
          { id: "py_5", title: "Listeler & Sözlükler", desc: "list, dict, tuple ve veri yönetimi", xp: 60, icon: "fa-layer-group", topic: "Python listeler, dict sözlükler, append, slicing" },
          { id: "py_6", title: "Fonksiyonlar (def)", desc: "Parametre, return ve temiz kod", xp: 65, icon: "fa-cubes", topic: "Python def fonksiyonlar, parametreler, return, lambda" }
        ]
      },
      {
        title: "Ünite 3: Orta & İleri Seviye",
        level: "Orta-İleri",
        lessons: [
          { id: "py_7", title: "Hata Yönetimi (try/except)", desc: "Program çökmeden hata yakalama", xp: 70, icon: "fa-shield-halved", topic: "Python try except finally raise hata yönetimi" },
          { id: "py_8", title: "Sınıflar ve OOP", desc: "class, __init__, kalıtım ve nesneler", xp: 80, icon: "fa-sitemap", topic: "Python OOP class __init__ self inheritance" },
          { id: "py_9", title: "Dosya İşlemleri & JSON", desc: "Veri okuma, yazma ve API mantığı", xp: 85, icon: "fa-file-code", topic: "Python with open dosya okuma yazma json modülü" },
          { id: "py_10", title: "Uzman: Algoritma & Async", desc: "List comprehension, dekoratör ve async", xp: 100, icon: "fa-crown", topic: "Python ileri seviye list comprehension generators decorators async await" }
        ]
      }
    ]
  },

  csharp: {
    title: "C# Yolculuğu (Sıfırdan Zirveye)",
    desc: "Güçlü tip sisteminden OOP mimarisine, LINQ ve oyun geliştirme temellerine kadar C# öğren.",
    units: [
      {
        title: "Ünite 1: C# Temelleri",
        level: "Başlangıç",
        lessons: [
          {
            id: "cs_1", title: "Console & Değişken Tipleri", desc: "int, string, bool ve Console.WriteLine", xp: 40, icon: "fa-terminal",
            topic: "C# Console.WriteLine, int, string, bool değişken tanımlama",
            questions: [
              { type: "mcq", prompt: "C#'ta konsola yeni satırla yazı basan doğru komut hangisidir?", options: ["Console.WriteLine(\"Selam\");", "print(\"Selam\");", "System.out.print(\"Selam\");", "echo \"Selam\";"], answer: "Console.WriteLine(\"Selam\");", explain: "C#'ta System isim alanındaki Console.WriteLine() kullanılır ve satır ';' ile biter." },
              { type: "bug", prompt: "Bu C# kodundaki hata nedir?", code: "int yas = 28\nConsole.WriteLine(yas);", options: ["İlk satırın sonunda ';' (noktalı virgül) eksik", "int yerine var yazmak zorunlu", "yas çift tırnakta olmalı", "Hata yok"], answer: "İlk satırın sonunda ';' (noktalı virgül) eksik", explain: "C#'ta her ifade noktalı virgül (;) ile sonlandırılmalıdır." },
              { type: "order", prompt: "Metin değişkeni tanımlayan C# satırını sırala:", tokens: ["string", "ad", "=", "\"Harun\"", ";"], answer: ["string", "ad", "=", "\"Harun\"", ";"], explain: "C# güçlü tiplidir: önce tip (string), sonra ad, sonra değer yazılır." },
              { type: "fill", prompt: "Doğru/Yanlış değer tutan C# veri tipi nedir?", code: "____ aktifMi = true;", answer: "bool", explain: "C#'ta mantıksal değerler bool tipiyle saklanır." }
            ]
          },
          {
            id: "cs_2", title: "Koşullar & Switch", desc: "if-else ve switch-case karar yapıları", xp: 45, icon: "fa-code-branch",
            topic: "C# if else switch case ternary mantıksal operatörler",
            questions: [
              { type: "output", prompt: "Bu C# kodu ekrana ne yazar?", code: "int can = 0;\nConsole.WriteLine(can > 0 ? \"Hayatta\" : \"Oyun Bitti\");", options: ["Oyun Bitti", "Hayatta", "0", "Derleme hatası"], answer: "Oyun Bitti", explain: "Ternary (? :) operatöründe can > 0 yanlış olduğu için ikinci ifade seçilir." },
              { type: "mcq", prompt: "C#'ta 'VE' (her iki koşul da doğru) mantıksal operatörü hangisidir?", options: ["&&", "and", "||", "&="], answer: "&&", explain: "C#'ta VE için &&, VEYA için ||, DEĞİL için ! kullanılır." },
              { type: "fill", prompt: "Switch bloğunda hiçbir case tutmazsa çalışan bölümün adı nedir?", code: "_______:\n    Console.WriteLine(\"Diğer\");\n    break;", answer: "default", explain: "Switch yapısında varsayılan durum default etiketiyle tanımlanır." },
              { type: "bug", prompt: "Koşul yazımındaki hata nedir?", code: "if x > 5 {\n    Console.WriteLine(\"Büyük\");\n}", options: ["Koşul parantez içine alınmalı: if (x > 5)", "Süslü parantez kullanılmaz", "Console küçük harfle başlar", "Hata yok"], answer: "Koşul parantez içine alınmalı: if (x > 5)", explain: "C#'ta if, while ve for koşulları mutlaka () parantez içine yazılır." }
            ]
          },
          {
            id: "cs_3", title: "Döngüler & Diziler", desc: "for, foreach, array ve List<T>", xp: 55, icon: "fa-rotate",
            topic: "C# for foreach döngüleri diziler ve List koleksiyonu",
            questions: [
              { type: "mcq", prompt: "Bir dizi veya List içindeki tüm elemanları tek tek gezmek için en pratik döngü hangisidir?", options: ["foreach", "switch", "try", "using"], answer: "foreach", explain: "foreach koleksiyonun her elemanı üzerinde indeks hatası riski olmadan döner." },
              { type: "output", prompt: "Çıktı ne olur?", code: "int[] sayilar = { 10, 20, 30 };\nConsole.WriteLine(sayilar[1]);", options: ["20", "10", "30", "1"], answer: "20", explain: "C#'ta dizi indeksleri 0'dan başlar; [1] ikinci elemandır." },
              { type: "fill", prompt: "List<string> içine yeni eleman ekleyen metot nedir?", code: "oyuncular.___(\"Serhat\");", answer: "Add", explain: "C# List<T> koleksiyonuna eleman Add() metoduyla eklenir." },
              { type: "order", prompt: "5 elemanlı tam sayı dizisi tanımını sırala:", tokens: ["int[]", "puanlar", "=", "new", "int[5];"], answer: ["int[]", "puanlar", "=", "new", "int[5];"], explain: "C#'ta sabit boyutlu dizi new tip[boyut] şeklinde oluşturulur." }
            ]
          }
        ]
      },
      {
        title: "Ünite 2: Metotlar & Nesne Yönelimli (OOP)",
        level: "Orta",
        lessons: [
          { id: "cs_4", title: "Metotlar & Parametreler", desc: "void, return, overloading ve ref/out", xp: 60, icon: "fa-cubes", topic: "C# metotlar void return parametre overloading" },
          { id: "cs_5", title: "Class, Constructor & Property", desc: "get/set, kapsülleme ve nesne üretimi", xp: 70, icon: "fa-sitemap", topic: "C# class constructor property get set encapsulation" },
          { id: "cs_6", title: "Kalıtım & Interface", desc: "override, virtual, abstract ve interface", xp: 75, icon: "fa-diagram-project", topic: "C# inheritance virtual override abstract interface polymorphism" }
        ]
      },
      {
        title: "Ünite 3: Modern C# & İleri Mimari",
        level: "İleri-Uzman",
        lessons: [
          { id: "cs_7", title: "Koleksiyonlar & Dictionary", desc: "List, Dictionary, HashSet ve Generics", xp: 80, icon: "fa-layer-group", topic: "C# Dictionary HashSet Queue Stack Generics" },
          { id: "cs_8", title: "LINQ & Lambda İfadeleri", desc: "Where, Select, OrderBy ile veri sorgulama", xp: 85, icon: "fa-filter", topic: "C# LINQ Where Select FirstOrDefault OrderBy Lambda expressions" },
          { id: "cs_9", title: "Hata Yönetimi & Dosyalar", desc: "try-catch-finally ve System.IO", xp: 90, icon: "fa-shield-halved", topic: "C# try catch finally Exception System.IO File" },
          { id: "cs_10", title: "Uzman: Async/Await & Events", desc: "Task, async/await, delegate ve event", xp: 100, icon: "fa-crown", topic: "C# async await Task delegate event Unity C# patterns" }
        ]
      }
    ]
  },

  english: {
    title: "İngilizce Yolculuğu (A1'den C1'e)",
    desc: "Günlük konuşmadan gramer yapısına, yazılımcı İngilizcesinden akıcı ileri düzeye adım adım ilerle.",
    units: [
      {
        title: "Ünite 1: Temel Yapı (A1 - A2)",
        level: "A1 - A2",
        lessons: [
          {
            id: "en_1", title: "To Be & Günlük Kalıplar", desc: "am / is / are ve temel cümle kurulumu", xp: 40, icon: "fa-comments",
            topic: "English verb to be am is are basic introductions and daily phrases",
            questions: [
              { type: "fill", prompt: "Boşluğu doğru yardımcı fiille doldur (Ben bir yazılımcıyım):", code: "I ___ a software developer.", answer: "am", explain: "Özne 'I' olduğunda 'to be' fiili şimdiki zamanda 'am' olur." },
              { type: "order", prompt: "'Onlar bugün çok meşgul' cümlesini doğru sıraya diz:", tokens: ["They", "are", "very", "busy", "today"], answer: ["They", "are", "very", "busy", "today"], explain: "İngilizce temel dizilim: Özne + Fiil + Sıfat/Zarf + Zaman." },
              { type: "mcq", prompt: "'Where are you from?' sorusunun doğru Türkçe karşılığı nedir?", options: ["Nerelisin?", "Nereye gidiyorsun?", "Kaç yaşındasın?", "Ne iş yapıyorsun?"], answer: "Nerelisin?", explain: "be from kalıbı bir kişinin memleketini / kökenini sorar." },
              { type: "bug", prompt: "Bu cümledeki gramer hatasını bul:", code: "She are my best friend.", options: ["'are' yerine 'is' olmalı", "'She' yerine 'Her' olmalı", "'friend' çoğul olmalı", "Hata yok"], answer: "'are' yerine 'is' olmalı", explain: "He / She / It özneleriyle 'is' kullanılır." }
            ]
          },
          {
            id: "en_2", title: "Geniş Zaman (Simple Present)", desc: "Alışkanlıklar, do/does ve -s takısı", xp: 45, icon: "fa-clock",
            topic: "English Simple Present tense do does habits daily routines",
            questions: [
              { type: "bug", prompt: "Bu cümledeki hata nedir?", code: "He write code every evening.", options: ["'write' yerine 'writes' olmalı", "'every' yerine 'all' olmalı", "'He' yerine 'Him' olmalı", "Hata yok"], answer: "'write' yerine 'writes' olmalı", explain: "Geniş zamanda olumlu cümlede He/She/It özneleri fiile -s takısı alır." },
              { type: "fill", prompt: "Soru cümlesindeki boşluğu doldur:", code: "____ you speak English?", answer: "Do", explain: "I/You/We/They öznelerinde geniş zaman sorusu 'Do' ile başlar." },
              { type: "order", prompt: "'Ben her gün Python öğreniyorum' cümlesini sırala:", tokens: ["I", "study", "Python", "every", "day"], answer: ["I", "study", "Python", "every", "day"], explain: "Özne + Fiil + Nesne + Zaman zarfı sırasıyla kurulur." },
              { type: "mcq", prompt: "'She doesn't like coffee.' cümlesi ne anlama gelir?", options: ["O kahveyi sevmez.", "O kahve içiyor.", "O kahve sever.", "O kahve yapmadı."], answer: "O kahveyi sevmez.", explain: "doesn't + yalın fiil, üçüncü tekil şahısta olumsuz geniş zaman kurar." }
            ]
          },
          {
            id: "en_3", title: "Geçmiş & Gelecek Zaman", desc: "Past Simple, will ve going to", xp: 50, icon: "fa-calendar-days",
            topic: "English Past Simple irregular verbs did will future tense",
            questions: [
              { type: "mcq", prompt: "'go' fiilinin 2. hâli (Past Simple) hangisidir?", options: ["went", "goed", "gone", "going"], answer: "went", explain: "go düzensiz bir fiildir: go - went - gone." },
              { type: "fill", prompt: "Dün projeyi bitirdim (finish fiilinin geçmiş hâli):", code: "I ________ the project yesterday.", answer: "finished", explain: "finish düzenli bir fiildir, geçmiş zamanda -ed takısı alır." },
              { type: "order", prompt: "'Yarın yeni bir oyun yapacağız' cümlesini sırala:", tokens: ["We", "will", "build", "a", "new", "game", "tomorrow"], answer: ["We", "will", "build", "a", "new", "game", "tomorrow"], explain: "Gelecek zaman için özne + will + yalın fiil kullanılır." },
              { type: "bug", prompt: "Hata nerede?", code: "Did you went to the library?", options: ["'went' yerine 'go' olmalı", "'Did' yerine 'Do' olmalı", "'to' silinmeli", "Hata yok"], answer: "'went' yerine 'go' olmalı", explain: "Did yardımcı fiili kullanıldığında ana fiil daima 1. (yalın) hâlinde kalır." }
            ]
          }
        ]
      },
      {
        title: "Ünite 2: Orta Düzey & Bağlaçlar (B1 - B2)",
        level: "B1 - B2",
        lessons: [
          { id: "en_4", title: "Present Perfect (have/has V3)", desc: "Geçmişten bugüne uzanan deneyimler", xp: 60, icon: "fa-hourglass-half", topic: "English Present Perfect tense have has past participle since for" },
          { id: "en_5", title: "Modals (can, must, should)", desc: "Zorunluluk, tavsiye ve olasılık", xp: 65, icon: "fa-scale-balanced", topic: "English modal verbs can could must have to should might" },
          { id: "en_6", title: "Bağlaçlar (although, despite)", desc: "Akıcı ve uzun cümleler kurma", xp: 70, icon: "fa-link", topic: "English conjunctions although however despite because unless while" },
          { id: "en_7", title: "Koşul Cümleleri (Conditionals)", desc: "If Clauses Type 0, 1, 2 ve 3", xp: 75, icon: "fa-code-fork", topic: "English Conditionals If clauses type 1 2 3" }
        ]
      },
      {
        title: "Ünite 3: İleri & Teknik İngilizce (B2 - C1)",
        level: "B2 - C1",
        lessons: [
          { id: "en_8", title: "Passive Voice & Relative Clauses", desc: "Edilgen çatı ve which/who/that", xp: 80, icon: "fa-book-open", topic: "English Passive Voice and Relative Clauses who which that whose" },
          { id: "en_9", title: "Phrasal Verbs & Deyimler", desc: "figure out, break down, give up", xp: 90, icon: "fa-fire-flame-curved", topic: "English common phrasal verbs and idioms for daily life and tech" },
          { id: "en_10", title: "Yazılımcı & Akademik C1", desc: "Dokümantasyon okuma ve teknik ifade", xp: 100, icon: "fa-crown", topic: "Advanced C1 technical English for software developers and documentation" }
        ]
      }
    ]
  }
};

/* ---------- GÜVENLİ DOM & YARDIMCI ARAÇLAR ---------- */
function byId(id) {
  return document.getElementById(id);
}

function onId(id, eventName, handler) {
  const el = byId(id);
  if (el) el.addEventListener(eventName, handler);
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hashPassword(password) {
  let h1 = 0xdeadbeef ^ password.length;
  let h2 = 0x41c6ce57 ^ password.length;
  for (let i = 0; i < password.length; i++) {
    const ch = password.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return "kl_" + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function showToast(message, type = "info") {
  const container = byId("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  const icon = type === "success" ? "fa-circle-check" : type === "error" ? "fa-triangle-exclamation" : "fa-bolt";
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 220);
  }, 3400);
}

function createEmptyGameStats() {
  const stats = {};
  Object.keys(GAME_CATALOG).forEach(key => {
    stats[key] = { played: 0, wins: 0, losses: 0, xp: 0 };
  });
  return stats;
}

function createNewUserObject(firstName, lastName, username, passwordHash) {
  return {
    username,
    firstName,
    lastName,
    passwordHash,
    avatar: { ...DEFAULT_AVATAR },
    totalXp: 0,
    sandboxXp: 0,
    academyXp: 0,
    streak: 1,
    lastActiveDate: getTodayKey(),
    completedLessons: { python: [], csharp: [], english: [] },
    gameStats: createEmptyGameStats(),
    projectsCount: 0,
    createdAt: Date.now()
  };
}

function normalizeUser(user) {
  if (!user) return null;
  user.avatar = { ...DEFAULT_AVATAR, ...(user.avatar || {}) };
  user.completedLessons = {
    python: user.completedLessons?.python || [],
    csharp: user.completedLessons?.csharp || [],
    english: user.completedLessons?.english || []
  };
  const baseStats = createEmptyGameStats();
  Object.keys(baseStats).forEach(k => {
    if (user.gameStats && user.gameStats[k]) baseStats[k] = { ...baseStats[k], ...user.gameStats[k] };
  });
  user.gameStats = baseStats;
  user.totalXp = Number(user.totalXp || 0);
  user.sandboxXp = Number(user.sandboxXp || 0);
  user.academyXp = Number(user.academyXp || 0);
  user.streak = Number(user.streak || 0);
  user.projectsCount = Number(user.projectsCount || 0);
  return user;
}

/* ---------- VERİTABANI (ÖNBELLEK + ARKA PLAN FIREBASE) ---------- */
function loadLocalUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    const parsed = raw ? JSON.parse(raw) : {};
    Object.keys(parsed).forEach(u => { parsed[u] = normalizeUser(parsed[u]); });
    return parsed;
  } catch {
    return {};
  }
}

function saveLocalUsers() {
  try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(STATE.usersMap)); }
  catch (err) { console.warn("Önbellek yazma hatası:", err); }
}

function updateSyncBadge(text, isOffline = false) {
  const badge = byId("sync-badge");
  const label = byId("sync-badge-text");
  if (!badge || !label) return;
  label.textContent = text;
  badge.classList.toggle("offline", isOffline);
}

function initFirebase() {
  const cfg = CONFIG.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || !cfg.projectId || typeof firebase === "undefined") {
    updateSyncBadge("Telefon Önbelleği Aktif");
    return;
  }

  try {
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    STATE.db = firebase.firestore();
    STATE.cloudReady = true;
    updateSyncBadge("Google Bulut Canlı");

    STATE.db.collection("users").onSnapshot(snapshot => {
      snapshot.forEach(doc => {
        const data = normalizeUser(doc.data());
        if (data && data.username) {
          STATE.usersMap[data.username] = data;
          if (STATE.currentUser && STATE.currentUser.username === data.username) {
            STATE.currentUser = data;
          }
        }
      });
      saveLocalUsers();
      refreshAllUserUI();
    }, err => {
      console.warn("Firestore dinleme hatası:", err);
      updateSyncBadge("Önbellek Modu (Bağlantı Yok)", true);
    });
  } catch (err) {
    console.error("Firebase başlatılamadı:", err);
    updateSyncBadge("Önbellek Aktif");
  }
}

async function persistUser(user) {
  if (!user) return;
  normalizeUser(user);
  STATE.usersMap[user.username] = user;
  saveLocalUsers();

  if (STATE.cloudReady && STATE.db) {
    STATE.db.collection("users").doc(user.username).set(user, { merge: true })
      .catch(err => console.warn("Buluta senkronize edilemedi:", err));
  }
}

async function fetchUserByUsername(username) {
  const clean = username.trim().toLowerCase();
  if (STATE.cloudReady && STATE.db) {
    try {
      const doc = await STATE.db.collection("users").doc(clean).get();
      if (doc.exists) {
        const u = normalizeUser(doc.data());
        STATE.usersMap[clean] = u;
        saveLocalUsers();
        return u;
      }
    } catch (err) { console.warn("Bulut kullanıcı sorgusu atlandı:", err); }
  }
  return STATE.usersMap[clean] || null;
}

function updateUserStreak(user) {
  const today = getTodayKey();
  if (user.lastActiveDate === today) return;
  user.streak = user.lastActiveDate === getYesterdayKey() ? (user.streak || 0) + 1 : 1;
  user.lastActiveDate = today;
}

async function awardUserActivity({ gameKey, xp = 0, win = false, loss = false, source = "academy" }) {
  if (!STATE.currentUser) {
    showToast("Puanlarının skor tablosuna işlenmesi için sağ üstten giriş yap!", "info");
    return;
  }
  const u = STATE.currentUser;
  updateUserStreak(u);

  if (gameKey && u.gameStats[gameKey]) {
    u.gameStats[gameKey].played += 1;
    if (win) u.gameStats[gameKey].wins += 1;
    if (loss) u.gameStats[gameKey].losses += 1;
    u.gameStats[gameKey].xp += xp;
  }
  if (xp > 0) {
    u.totalXp += xp;
    if (source === "sandbox") u.sandboxXp += xp;
    if (source === "academy") u.academyXp += xp;
  }

  await persistUser(u);
  refreshAllUserUI();
}

/* ---------- AVATAR SVG MOTORU & AVATAR DUVARI ---------- */
function renderAvatarSVG(cfg = DEFAULT_AVATAR) {
  const a = { ...DEFAULT_AVATAR, ...cfg };
  let hairSvg = "";
  if (a.hairStyle === "short") {
    hairSvg = `<path d="M26 44 C26 20, 74 20, 74 44 C68 33, 32 33, 26 44 Z" fill="${a.hairColor}"/>`;
  } else if (a.hairStyle === "spiky") {
    hairSvg = `<polygon points="24,44 30,18 42,28 50,12 58,28 70,18 76,44 65,33 35,33" fill="${a.hairColor}"/>`;
  } else if (a.hairStyle === "long") {
    hairSvg = `<path d="M22 44 C22 18, 78 18, 78 44 L80 76 L68 72 L68 42 C60 32, 40 32, 32 42 L32 72 L20 76 Z" fill="${a.hairColor}"/>`;
  } else if (a.hairStyle === "curly") {
    hairSvg = `<circle cx="32" cy="29" r="10" fill="${a.hairColor}"/><circle cx="44" cy="23" r="11" fill="${a.hairColor}"/><circle cx="57" cy="23" r="11" fill="${a.hairColor}"/><circle cx="69" cy="29" r="10" fill="${a.hairColor}"/><circle cx="27" cy="40" r="8" fill="${a.hairColor}"/><circle cx="73" cy="40" r="8" fill="${a.hairColor}"/>`;
  }

  let accSvg = "";
  if (a.accessory === "glasses") {
    accSvg = `<rect x="31" y="45" width="16" height="11" rx="3" fill="rgba(0,240,255,0.18)" stroke="#00f0ff" stroke-width="2.2"/><rect x="53" y="45" width="16" height="11" rx="3" fill="rgba(0,240,255,0.18)" stroke="#00f0ff" stroke-width="2.2"/><line x1="47" y1="50" x2="53" y2="50" stroke="#00f0ff" stroke-width="2.2"/>`;
  } else if (a.accessory === "sunglasses") {
    accSvg = `<path d="M28 46 H72 L69 57 H54 L50 53 L46 57 H31 Z" fill="#070b14" stroke="#00f0ff" stroke-width="2"/><line x1="33" y1="50" x2="43" y2="50" stroke="#00e676" stroke-width="2"/><line x1="57" y1="50" x2="67" y2="50" stroke="#ff2a5f" stroke-width="2"/>`;
  } else if (a.accessory === "headphones") {
    accSvg = `<path d="M23 50 C23 16, 77 16, 77 50" fill="none" stroke="#00f0ff" stroke-width="4.5"/><rect x="17" y="44" width="9" height="18" rx="4" fill="#111827" stroke="#00e676" stroke-width="2"/><rect x="74" y="44" width="9" height="18" rx="4" fill="#111827" stroke="#00e676" stroke-width="2"/>`;
  } else if (a.accessory === "cap") {
    accSvg = `<path d="M24 38 C26 18, 74 18, 76 38 Z" fill="#ff2a5f"/><rect x="22" y="34" width="58" height="7" rx="3.5" fill="#0b111d" stroke="#00f0ff" stroke-width="1.5"/>`;
  }

  const gradId = `bgGrad_${a.bg.replace("#", "")}`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${a.bg}" stop-opacity="0.95"/><stop offset="100%" stop-color="#050811" stop-opacity="1"/></linearGradient></defs><rect width="100" height="100" fill="url(#${gradId})"/><circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,240,255,0.22)" stroke-width="1.5"/><path d="M18 100 C20 78, 34 73, 50 73 C66 73, 80 78, 82 100 Z" fill="${a.shirt}"/><path d="M43 73 L50 83 L57 73" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/><rect x="43" y="65" width="14" height="11" rx="4" fill="${a.skin}"/><circle cx="50" cy="48" r="22" fill="${a.skin}"/><circle cx="42" cy="49" r="2.6" fill="#0f172a"/><circle cx="58" cy="49" r="2.6" fill="#0f172a"/><path d="M43 59 Q50 64 57 59" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/>${hairSvg}${accSvg}</svg>`;
}

function openAvatarWallModal() {
  if (!STATE.currentUser) {
    openAuthModal("login");
    showToast("Avatarını kaydetmek için önce giriş yapmalısın.", "info");
    return;
  }
  STATE.draftAvatar = { ...STATE.currentUser.avatar };
  syncAvatarControlsFromDraft();
  renderAvatarWallGallery();
  byId("avatar-wall-modal")?.classList.remove("hidden");
}

function syncAvatarControlsFromDraft() {
  const a = STATE.draftAvatar;
  byId("av-bg").value = a.bg;
  byId("av-skin").value = a.skin;
  byId("av-hair-style").value = a.hairStyle;
  byId("av-hair-color").value = a.hairColor;
  byId("av-accessory").value = a.accessory;
  byId("av-shirt").value = a.shirt;
  byId("avatar-wall-preview").innerHTML = renderAvatarSVG(a);
}

function renderAvatarWallGallery() {
  const presetGrid = byId("preset-avatars-grid");
  if (!presetGrid) return;
  presetGrid.innerHTML = PRESET_AVATARS.map((p, idx) => `
    <button type="button" class="preset-avatar-btn" data-preset-idx="${idx}">
      <div class="avatar-circle avatar-md">${renderAvatarSVG(p)}</div>
      <span>${escapeHtml(p.name)}</span>
    </button>
  `).join("");

  presetGrid.querySelectorAll(".preset-avatar-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = PRESET_AVATARS[Number(btn.dataset.presetIdx)];
      STATE.draftAvatar = { bg: p.bg, skin: p.skin, hairStyle: p.hairStyle, hairColor: p.hairColor, accessory: p.accessory, shirt: p.shirt };
      syncAvatarControlsFromDraft();
    });
  });

  const wall = byId("community-avatar-wall");
  const members = Object.values(STATE.usersMap);
  if (!members.length) {
    wall.innerHTML = `<p class="muted-text">Henüz başka kayıtlı üye yok.</p>`;
    return;
  }
  wall.innerHTML = members.map(u => `
    <button type="button" class="wall-member-card" data-inspect-user="${escapeHtml(u.username)}">
      <div class="avatar-circle avatar-md">${renderAvatarSVG(u.avatar)}</div>
      <span>${escapeHtml(u.firstName)}</span>
    </button>
  `).join("");

  wall.querySelectorAll(".wall-member-card").forEach(card => {
    card.addEventListener("click", () => {
      byId("avatar-wall-modal")?.classList.add("hidden");
      openUserInspectModal(card.dataset.inspectUser);
    });
  });
}

/* ---------- ÜYELİK & ŞİFRE DEĞİŞTİRME ---------- */
function openAuthModal(tab = "login") {
  const msg = byId("auth-status-msg");
  if (msg) { msg.textContent = ""; msg.className = "auth-status-msg"; }
  switchAuthTab(tab);
  byId("auth-modal")?.classList.remove("hidden");
}

function switchAuthTab(tab) {
  document.querySelectorAll(".auth-tab").forEach(t => t.classList.toggle("active", t.dataset.authTab === tab));
  byId("login-form")?.classList.toggle("active", tab === "login");
  byId("register-form")?.classList.toggle("active", tab === "register");
}

async function handleRegister(e) {
  e.preventDefault();
  const firstName = byId("reg-firstname").value.trim();
  const lastName = byId("reg-lastname").value.trim();
  const username = byId("reg-username").value.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  const password = byId("reg-password").value;
  const statusEl = byId("auth-status-msg");

  if (!firstName || !lastName || username.length < 3 || password.length < 4) {
    statusEl.textContent = "Kullanıcı adı en az 3, şifre en az 4 karakter olmalıdır.";
    return;
  }
  const existing = await fetchUserByUsername(username);
  if (existing) {
    statusEl.textContent = "Bu kullanıcı adı zaten alınmış, başka bir tane seç.";
    return;
  }

  const newUser = createNewUserObject(firstName, lastName, username, hashPassword(password));
  await persistUser(newUser);
  loginSession(newUser);
  byId("auth-modal")?.classList.add("hidden");
  byId("register-form")?.reset();
  showToast(`Hoş geldin ${firstName}! Hesabın oluşturuldu.`, "success");
}

async function handleLogin(e) {
  e.preventDefault();
  const username = byId("login-username").value.trim().toLowerCase();
  const password = byId("login-password").value;
  const statusEl = byId("auth-status-msg");

  const user = await fetchUserByUsername(username);
  if (!user || user.passwordHash !== hashPassword(password)) {
    statusEl.textContent = "Kullanıcı adı veya şifre hatalı.";
    return;
  }

  updateUserStreak(user);
  await persistUser(user);
  loginSession(user);
  byId("auth-modal")?.classList.add("hidden");
  byId("login-form")?.reset();
  showToast(`Tekrar hoş geldin ${user.firstName}!`, "success");
}

function loginSession(user) {
  STATE.currentUser = normalizeUser(user);
  localStorage.setItem(STORAGE_KEYS.SESSION, user.username);
  refreshAllUserUI();
}

function logoutSession() {
  STATE.currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  byId("avatar-dropdown")?.classList.add("hidden");
  refreshAllUserUI();
  showToast("Oturumdan çıkış yapıldı.", "info");
}

async function handleChangePassword(e) {
  e.preventDefault();
  if (!STATE.currentUser) return;
  const oldPass = byId("old-password").value;
  const newPass = byId("new-password").value;
  const confirmPass = byId("confirm-new-password").value;
  const msgEl = byId("password-status-msg");
  msgEl.className = "auth-status-msg";

  if (hashPassword(oldPass) !== STATE.currentUser.passwordHash) {
    msgEl.textContent = "Mevcut şifren hatalı.";
    return;
  }
  if (newPass.length < 4) {
    msgEl.textContent = "Yeni şifre en az 4 karakter olmalı.";
    return;
  }
  if (newPass !== confirmPass) {
    msgEl.textContent = "Yeni şifreler birbiriyle eşleşmiyor.";
    return;
  }

  STATE.currentUser.passwordHash = hashPassword(newPass);
  await persistUser(STATE.currentUser);
  byId("change-password-form")?.reset();
  byId("password-modal")?.classList.add("hidden");
  showToast("Şifren başarıyla güncellendi!", "success");
}

/* ---------- GOOGLE APPS SCRIPT KÖPRÜSÜ (ZAMAN AŞIMI KORUMALI) ---------- */
async function callBridge(payload) {
  if (!CONFIG.APPS_SCRIPT_URL) throw new Error("Google Apps Script köprüsü bağlı değil.");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch { throw new Error("Apps Script geçersiz yanıt döndürdü (Dağıtım erişimi 'Herkes' olmayabilir)."); }
    if (!data.ok) throw new Error(data.error || "Köprü tarafında bir hata oluştu.");
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Bağlantı 25 saniyede yanıt vermedi (Apps Script veya Gemini API takıldı).");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ---------- SERBEST KODLAMA ALANI (CODEMIRROR + YEDEK TEXTAREA) ---------- */
function getEditorCode() {
  if (STATE.editor) return STATE.editor.getValue();
  return byId("code-editor")?.value || "";
}

function setEditorCode(val) {
  if (STATE.editor) STATE.editor.setValue(val);
  else if (byId("code-editor")) byId("code-editor").value = val;
}

function initCodeEditor() {
  const textarea = byId("code-editor");
  if (!textarea) return;
  if (typeof CodeMirror !== "undefined") {
    STATE.editor = CodeMirror.fromTextArea(textarea, {
      mode: "python",
      theme: "dracula",
      lineNumbers: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      indentUnit: 4,
      tabSize: 4
    });
  } else {
    textarea.style.width = "100%";
    textarea.style.height = "400px";
    textarea.style.fontFamily = "var(--font-code)";
  }
  setEditorCode(STARTER_CODE.python);
  loadSavedProjectsDropdown();
}

function setSandboxLanguage(lang) {
  STATE.sandboxLang = lang;
  const badge = byId("sandbox-lang-badge");
  const nameInput = byId("project-name-input");
  const current = getEditorCode();

  if (lang === "python") {
    if (badge) {
      badge.className = "lang-badge python";
      badge.innerHTML = `<i class="fa-brands fa-python"></i> Python 3 (Gerçek Tarayıcı Motoru)`;
    }
    if (STATE.editor) STATE.editor.setOption("mode", "python");
    if (nameInput && !nameInput.value.endsWith(".py")) nameInput.value = "projem.py";
    if (!current.trim() || current === STARTER_CODE.csharp) setEditorCode(STARTER_CODE.python);
  } else {
    if (badge) {
      badge.className = "lang-badge csharp";
      badge.innerHTML = `<i class="fa-solid fa-code"></i> C# .NET (Gerçek Bulut Derleyici)`;
    }
    if (STATE.editor) STATE.editor.setOption("mode", "text/x-csharp");
    if (nameInput && !nameInput.value.endsWith(".cs")) nameInput.value = "Program.cs";
    if (!current.trim() || current === STARTER_CODE.python) setEditorCode(STARTER_CODE.csharp);
  }
  if (STATE.editor) setTimeout(() => STATE.editor.refresh(), 50);
}

function setEngineStatus(text, type = "ready") {
  const el = byId("engine-status");
  if (!el) return;
  el.textContent = text;
  el.className = `engine-status ${type === "ready" ? "" : type}`;
}

async function ensurePyodideLoaded() {
  if (STATE.pyodide) return STATE.pyodide;
  if (STATE.pyodideLoading) throw new Error("Python motoru yükleniyor, birkaç saniye bekle...");

  STATE.pyodideLoading = true;
  setEngineStatus("Python Yükleniyor...", "loading");

  try {
    if (typeof loadPyodide === "undefined") {
      await new Promise((resolve, reject) => {
        const sc = document.createElement("script");
        sc.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
        sc.onload = resolve;
        sc.onerror = () => reject(new Error("Pyodide kütüphanesi indirilemedi (İnternetini kontrol et)."));
        document.head.appendChild(sc);
      });
    }
    STATE.pyodide = await loadPyodide();
    setEngineStatus("Python 3 Hazır", "ready");
    return STATE.pyodide;
  } finally {
    STATE.pyodideLoading = false;
  }
}

async function runSandboxCode() {
  const code = getEditorCode();
  const stdinText = byId("code-stdin")?.value || "";
  const consoleEl = byId("console-output");
  const runBtn = byId("btn-run-code");

  if (!code.trim()) {
    showToast("Çalıştırmak için önce biraz kod yaz kanka!", "error");
    return;
  }

  runBtn.disabled = true;
  consoleEl.classList.remove("has-error");
  consoleEl.textContent = "Çalıştırılıyor...";

  try {
    if (STATE.sandboxLang === "python") {
      const py = await ensurePyodideLoaded();
      const inputLines = stdinText.split("\n");
      let outBuffer = "";
      let errBuffer = "";

      py.setStdout({ batched: s => { outBuffer += s + "\n"; } });
      py.setStderr({ batched: s => { errBuffer += s + "\n"; } });
      py.globals.set("__kl_inputs", py.toPy(inputLines));
      py.runPython(`
import builtins
__kl_idx = 0
def __kl_input(prompt=""):
    global __kl_idx
    if prompt:
        print(prompt, end="")
    if __kl_idx < len(__kl_inputs) and (__kl_inputs[__kl_idx] != "" or len(__kl_inputs) > 1):
        val = __kl_inputs[__kl_idx]
        __kl_idx += 1
        print(val)
        return val
    return ""
builtins.input = __kl_input
`);

      await py.runPythonAsync(code);
      if (errBuffer.trim()) {
        consoleEl.classList.add("has-error");
        consoleEl.textContent = errBuffer.trim();
      } else {
        consoleEl.textContent = outBuffer.trim() || "(Kod hatasız çalıştı, ancak ekrana bir çıktı yazdırılmadı.)";
      }
      setEngineStatus("Çalıştırıldı", "ready");
    } else {
      setEngineStatus("C# Derleniyor...", "loading");
      const res = await callBridge({ action: "compile", language: "csharp", code, stdin: stdinText });
      if (res.errorOutput) {
        consoleEl.classList.add("has-error");
        consoleEl.textContent = res.errorOutput;
        setEngineStatus("Derleme Hatası", "error");
      } else {
        consoleEl.textContent = res.output || "(C# kodu hatasız çalıştı, çıktı boş.)";
        setEngineStatus("C# Hazır", "ready");
      }
    }
  } catch (err) {
    consoleEl.classList.add("has-error");
    consoleEl.textContent = String(err.message || err);
    setEngineStatus("Hata", "error");
  } finally {
    runBtn.disabled = false;
  }
}

async function reviewSandboxCodeWithAI() {
  const code = getEditorCode();
  const consoleOut = byId("console-output")?.textContent || "";
  const feedbackEl = byId("ai-feedback-output");
  const xpBadge = byId("ai-xp-earned-badge");
  const btn = byId("btn-ai-review");

  if (!code.trim()) { showToast("Analiz edilecek kod boş.", "error"); return; }

  btn.disabled = true;
  xpBadge.classList.add("hidden");
  feedbackEl.innerHTML = `<p class="muted-text"><i class="fa-solid fa-spinner fa-spin"></i> AI Kod Hocası kodunu inceliyor, hataları ve öğrendiğin kavramları puanlıyor...</p>`;

  try {
    const res = await callBridge({ action: "review", language: STATE.sandboxLang, code, output: consoleOut });
    const data = res.data || {};
    const codeSig = hashPassword(`${STATE.sandboxLang}:${code.trim()}`);
    let awardedXp = Number(data.awardedXp || 0);
    let duplicateNote = "";

    if (codeSig === STATE.lastReviewedHash && awardedXp > 0) {
      awardedXp = 0;
      duplicateNote = `<p class="muted-text"><em>(Bu koddan puanını zaten aldın; yeni bir özellik eklediğinde tekrar XP kazanırsın!)</em></p>`;
    } else if (awardedXp > 0) {
      STATE.lastReviewedHash = codeSig;
      await awardUserActivity({
        gameKey: STATE.sandboxLang === "python" ? "sandbox_python" : "sandbox_csharp",
        xp: awardedXp,
        win: Boolean(data.isCorrect),
        loss: !data.isCorrect,
        source: "sandbox"
      });
      xpBadge.textContent = `+${awardedXp} XP`;
      xpBadge.classList.remove("hidden");
    } else {
      await awardUserActivity({
        gameKey: STATE.sandboxLang === "python" ? "sandbox_python" : "sandbox_csharp",
        xp: 0,
        win: false,
        loss: true,
        source: "sandbox"
      });
    }

    const errorsHtml = (data.errors && data.errors.length)
      ? `<h4><i class="fa-solid fa-bug"></i> Tespit Edilen Hatalar</h4><ul>${data.errors.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`
      : `<h4><i class="fa-solid fa-circle-check"></i> Durum</h4><p>Kodunda kritik bir sözdizimi hatası görünmüyor.</p>`;
    const fixesHtml = (data.fixes && data.fixes.length)
      ? `<h4><i class="fa-solid fa-wrench"></i> Nasıl Düzeltilir / Geliştirilir?</h4><ul>${data.fixes.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`
      : "";
    const conceptsHtml = (data.learnedConcepts && data.learnedConcepts.length)
      ? `<h4><i class="fa-solid fa-brain"></i> Pekiştirdiğin Kavramlar</h4><p>${data.learnedConcepts.map(c => `<code>${escapeHtml(c)}</code>`).join(" ")}</p>`
      : "";

    feedbackEl.innerHTML = `<p><strong>Özet:</strong> ${escapeHtml(data.summary || "Analiz tamamlandı.")}</p>${errorsHtml}${fixesHtml}${conceptsHtml}${duplicateNote}`;
  } catch (err) {
    feedbackEl.innerHTML = `<p style="color:#ff6b8b"><i class="fa-solid fa-triangle-exclamation"></i> ${escapeHtml(err.message)}</p>`;
  } finally {
    btn.disabled = false;
  }
}

function getSavedProjects() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || "[]"); }
  catch { return []; }
}

function loadSavedProjectsDropdown() {
  const select = byId("saved-projects-select");
  if (!select) return;
  const projects = getSavedProjects();
  select.innerHTML = `<option value="">Kayıtlı Projelerim (${projects.length})</option>` +
    projects.map((p, idx) => `<option value="${idx}">[${p.lang.toUpperCase()}] ${escapeHtml(p.name)}</option>`).join("");
}

async function saveCurrentProject() {
  const name = byId("project-name-input").value.trim() || `proje.${STATE.sandboxLang === "python" ? "py" : "cs"}`;
  const code = getEditorCode();
  const projects = getSavedProjects();
  const existingIdx = projects.findIndex(p => p.name === name && p.lang === STATE.sandboxLang);
  const item = { name, lang: STATE.sandboxLang, code, updatedAt: Date.now() };
  if (existingIdx >= 0) projects[existingIdx] = item;
  else projects.unshift(item);

  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects.slice(0, 40)));
  loadSavedProjectsDropdown();

  if (STATE.currentUser) {
    STATE.currentUser.projectsCount = projects.length;
    await persistUser(STATE.currentUser);
    refreshAllUserUI();
  }
  showToast(`"${name}" önbelleğe kaydedildi!`, "success");
}

/* ---------- DUOLINGO AKADEMİ & GEMINI OTOMATİK MİNİ OYUN ---------- */
function getCourseTotalLessons(courseKey) {
  return CURRICULUM[courseKey].units.reduce((sum, u) => sum + u.lessons.length, 0);
}

function renderAcademyHub() {
  const pathEl = byId("academy-path");
  if (!pathEl) return;
  const course = CURRICULUM[STATE.activeCourse];
  const completed = STATE.currentUser?.completedLessons?.[STATE.activeCourse] || [];
  const total = getCourseTotalLessons(STATE.activeCourse);

  document.querySelectorAll(".course-pill").forEach(p => p.classList.toggle("active", p.dataset.course === STATE.activeCourse));
  byId("academy-course-title").textContent = course.title;
  byId("academy-course-desc").textContent = course.desc;
  byId("academy-completed-count").textContent = `${completed.length}/${total}`;
  byId("academy-course-xp").textContent = `${STATE.currentUser?.academyXp || 0}`;

  let lessonCounter = 0;
  pathEl.innerHTML = course.units.map(unit => {
    const cards = unit.lessons.map(lesson => {
      const isDone = completed.includes(lesson.id);
      const isUnlocked = lessonCounter === 0 || isDone || completed.length >= lessonCounter;
      lessonCounter++;
      return `
        <button type="button" class="lesson-node ${isDone ? "completed" : ""} ${!isUnlocked ? "locked" : ""}"
                data-lesson-id="${lesson.id}" ${!isUnlocked ? "disabled" : ""}>
          <div class="lesson-node-top">
            <div class="lesson-icon-circle">
              <i class="fa-solid ${isDone ? "fa-check" : (!isUnlocked ? "fa-lock" : lesson.icon)}"></i>
            </div>
            <span class="lesson-xp-tag">+${lesson.xp} XP</span>
          </div>
          <h4>${escapeHtml(lesson.title)}</h4>
          <p>${escapeHtml(lesson.desc)}</p>
        </button>`;
    }).join("");
    return `<div class="unit-block"><div class="unit-header"><span class="unit-title">${escapeHtml(unit.title)}</span><span class="unit-level-tag">${escapeHtml(unit.level)}</span></div><div class="lessons-grid">${cards}</div></div>`;
  }).join("");

  pathEl.querySelectorAll(".lesson-node:not(.locked)").forEach(btn => {
    btn.addEventListener("click", () => startLesson(STATE.activeCourse, btn.dataset.lessonId, false));
  });
}

function findLessonById(courseKey, lessonId) {
  for (const unit of CURRICULUM[courseKey].units) {
    const found = unit.lessons.find(l => l.id === lessonId);
    if (found) return found;
  }
  return null;
}

async function launchLessonWithQuestions(courseKey, lessonObj, forceAI = false) {
  byId("academy-hub").classList.add("hidden");
  byId("lesson-arena").classList.remove("hidden");
  byId("lesson-feedback-banner").classList.add("hidden");

  let questions = (!forceAI && lessonObj.questions) ? [...lessonObj.questions] : null;

  if (!questions) {
    byId("lesson-question-container").innerHTML = `
      <div style="text-align:center; padding: 48px 16px;">
        <i class="fa-solid fa-wand-magic-sparkles fa-spin" style="font-size:2rem; color:var(--cyan); margin-bottom:14px;"></i>
        <h3>"${escapeHtml(lessonObj.title)}" için Gemini API yeni mini oyunlar oluşturuyor...</h3>
        <p class="muted-text">Çoktan seçmeli, blok sıralama, boşluk doldurma ve hata avcısı taze hazırlanıyor.</p>
      </div>`;
    byId("lesson-action-bar").classList.add("hidden");

    try {
      const res = await callBridge({
        action: "lesson_gen",
        course: courseKey,
        title: lessonObj.title,
        topic: `${lessonObj.topic || lessonObj.desc} (Benzersiz yeni soru seti #${Math.floor(Math.random() * 10000)})`
      });
      if (!res.questions || !res.questions.length) throw new Error("Gemini API geçerli soru üretemedi, tekrar dene.");
      questions = res.questions;
    } catch (err) {
      showToast(err.message, "error");
      exitLesson();
      return;
    }
  }

  STATE.lesson = {
    active: true,
    course: courseKey,
    lessonObj,
    questions,
    index: 0,
    hearts: 3,
    earnedXp: 0,
    selectedAnswer: null,
    orderedTokens: [],
    answered: false
  };
  byId("lesson-action-bar").classList.remove("hidden");
  renderCurrentLessonQuestion();
}

function startLesson(courseKey, lessonId, forceAI = false) {
  const lessonObj = findLessonById(courseKey, lessonId);
  if (lessonObj) launchLessonWithQuestions(courseKey, lessonObj, forceAI);
}

function startAIRandomGame() {
  const courseKey = STATE.activeCourse;
  const pool = AI_TOPICS_POOL[courseKey] || AI_TOPICS_POOL.python;
  const randomTopic = pool[Math.floor(Math.random() * pool.length)];
  const labels = { python: "Python", csharp: "C#", english: "İngilizce" };

  launchLessonWithQuestions(courseKey, {
    id: `ai_custom_${Date.now()}`,
    title: `${labels[courseKey]} AI Özel Mini Oyun`,
    desc: randomTopic,
    topic: randomTopic,
    xp: 60,
    isCustomAI: true
  }, true);
}

function exitLesson() {
  STATE.lesson.active = false;
  byId("lesson-arena")?.classList.add("hidden");
  byId("academy-hub")?.classList.remove("hidden");
  renderAcademyHub();
}

function renderCurrentLessonQuestion() {
  const L = STATE.lesson;
  const q = L.questions[L.index];
  L.selectedAnswer = null;
  L.orderedTokens = [];
  L.answered = false;

  byId("lesson-progress-fill").style.width = `${Math.round((L.index / L.questions.length) * 100)}%`;
  byId("lesson-hearts").textContent = L.hearts;
  byId("lesson-game-type").textContent = GAME_TYPE_LABELS[q.type] || "Mini Oyun";
  byId("lesson-feedback-banner").classList.add("hidden");
  byId("lesson-action-bar").classList.remove("hidden");

  const container = byId("lesson-question-container");
  const codeBlock = q.code ? `<pre class="question-code-box">${escapeHtml(q.code)}</pre>` : "";

  if (q.type === "mcq" || q.type === "bug" || q.type === "output") {
    const shuffled = [...(q.options || [])].sort(() => Math.random() - 0.5);
    container.innerHTML = `<div class="question-prompt">${escapeHtml(q.prompt)}</div>${codeBlock}<div class="options-grid">${shuffled.map(opt => `<button type="button" class="option-btn" data-opt="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`).join("")}</div>`;
    container.querySelectorAll(".option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (L.answered) return;
        container.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        L.selectedAnswer = btn.dataset.opt;
      });
    });
  } else if (q.type === "fill") {
    container.innerHTML = `<div class="question-prompt">${escapeHtml(q.prompt)}</div>${codeBlock}<input type="text" id="lesson-fill-input" class="fill-input" placeholder="Boşluğa gelecek doğru ifadeyi yaz..." autocomplete="off" />`;
    const inp = byId("lesson-fill-input");
    inp.focus();
    inp.addEventListener("input", () => { L.selectedAnswer = inp.value.trim(); });
  } else if (q.type === "order") {
    const shuffled = [...(q.tokens || [])].sort(() => Math.random() - 0.5);
    container.innerHTML = `<div class="question-prompt">${escapeHtml(q.prompt)}</div><div id="order-answer-zone" class="order-answer-zone"><span class="muted-text">Aşağıdaki bloklara sırayla tıkla...</span></div><div id="order-bank-zone" class="order-bank-zone">${shuffled.map((tok, i) => `<button type="button" class="word-chip" data-bank-idx="${i}" data-tok="${escapeHtml(tok)}">${escapeHtml(tok)}</button>`).join("")}</div>`;

    const bankZone = byId("order-bank-zone");
    const ansZone = byId("order-answer-zone");

    function redrawAnswerZone() {
      if (!L.orderedTokens.length) {
        ansZone.innerHTML = `<span class="muted-text">Aşağıdaki bloklara sırayla tıkla...</span>`;
        return;
      }
      ansZone.innerHTML = L.orderedTokens.map((item, pos) => `<button type="button" class="word-chip" data-ans-pos="${pos}">${escapeHtml(item.tok)}</button>`).join("");
      ansZone.querySelectorAll(".word-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          if (L.answered) return;
          const removed = L.orderedTokens.splice(Number(chip.dataset.ansPos), 1)[0];
          const bankBtn = bankZone.querySelector(`[data-bank-idx="${removed.bankIdx}"]`);
          if (bankBtn) bankBtn.classList.remove("used");
          redrawAnswerZone();
        });
      });
    }

    bankZone.querySelectorAll(".word-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        if (L.answered) return;
        chip.classList.add("used");
        L.orderedTokens.push({ tok: chip.dataset.tok, bankIdx: chip.dataset.bankIdx });
        redrawAnswerZone();
      });
    });
  }
}

async function checkCurrentLessonAnswer() {
  const L = STATE.lesson;
  if (!L.active || L.answered) return;
  const q = L.questions[L.index];
  let isCorrect = false;

  if (q.type === "order") {
    if (!L.orderedTokens.length) { showToast("Önce blokları sıraya diz!", "info"); return; }
    isCorrect = L.orderedTokens.map(t => t.tok).join(" ") === (Array.isArray(q.answer) ? q.answer : q.tokens).join(" ");
  } else if (q.type === "fill") {
    if (!L.selectedAnswer) { showToast("Önce boşluğu doldur!", "info"); return; }
    isCorrect = L.selectedAnswer.toLowerCase() === String(q.answer).trim().toLowerCase();
  } else {
    if (!L.selectedAnswer) { showToast("Bir seçenek işaretle!", "info"); return; }
    isCorrect = L.selectedAnswer === q.answer;
  }

  L.answered = true;
  byId("lesson-action-bar").classList.add("hidden");

  const banner = byId("lesson-feedback-banner");
  const titleEl = byId("feedback-title");
  const detailEl = byId("feedback-detail");
  const gameKey = `game_${q.type}`;

  if (isCorrect) {
    const qXp = Math.max(10, Math.round(L.lessonObj.xp / L.questions.length));
    L.earnedXp += qXp;
    banner.className = "lesson-feedback-banner correct";
    titleEl.textContent = `Doğru! +${qXp} XP`;
    detailEl.textContent = q.explain || "Harika gidiyorsun!";
    await awardUserActivity({ gameKey, xp: qXp, win: true, source: "academy" });
  } else {
    L.hearts -= 1;
    byId("lesson-hearts").textContent = Math.max(0, L.hearts);
    banner.className = "lesson-feedback-banner wrong";
    titleEl.textContent = "Yanlış Cevap";
    const rightStr = Array.isArray(q.answer) ? q.answer.join(" ") : q.answer;
    detailEl.textContent = `Doğru cevap: "${rightStr}". ${q.explain || ""}`;
    await awardUserActivity({ gameKey, xp: 0, loss: true, source: "academy" });
  }
  banner.classList.remove("hidden");
}

async function advanceLesson() {
  const L = STATE.lesson;
  if (L.hearts <= 0) {
    showToast("Canların bitti! Dersi veya AI oyununu tekrar deneyebilirsin.", "error");
    exitLesson();
    return;
  }

  L.index += 1;
  if (L.index >= L.questions.length) {
    byId("lesson-progress-fill").style.width = "100%";
    if (STATE.currentUser && !L.lessonObj.isCustomAI) {
      const list = STATE.currentUser.completedLessons[L.course];
      if (!list.includes(L.lessonObj.id)) list.push(L.lessonObj.id);
      await persistUser(STATE.currentUser);
      refreshAllUserUI();
    }
    showToast(`Tebrikler! "${L.lessonObj.title}" tamamlandı (+${L.earnedXp} XP)!`, "success");
    exitLesson();
    return;
  }
  renderCurrentLessonQuestion();
}

/* ---------- SINIRSIZ ÇEVİRİ & DEV KOD SÖZLÜĞÜ ---------- */
function getTranslationCache() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.TR_CACHE) || "{}"); }
  catch { return {}; }
}

function saveTranslationCache(cacheObj) {
  try {
    const keys = Object.keys(cacheObj);
    if (keys.length > 80) delete cacheObj[keys[0]];
    localStorage.setItem(STORAGE_KEYS.TR_CACHE, JSON.stringify(cacheObj));
  } catch {}
}

async function handleTranslate() {
  const source = byId("tr-source-lang").value;
  const target = byId("tr-target-lang").value;
  const text = byId("tr-input").value.trim();
  const outputEl = byId("tr-output");
  const loadingEl = byId("tr-loading-indicator");
  const analysisEl = byId("tr-deep-analysis");

  if (!text) { showToast("Çevirmek veya analiz etmek için metin/kod yaz.", "info"); return; }

  const cacheKey = `tr:${source}:${target}:${text.toLowerCase()}`;
  const cache = getTranslationCache();
  if (cache[cacheKey]) { renderTranslateResponse(cache[cacheKey]); return; }

  loadingEl.classList.remove("hidden");
  outputEl.textContent = "Analiz ediliyor...";
  analysisEl.classList.add("hidden");

  try {
    const res = await callBridge({ action: "translate", source, target, text });
    cache[cacheKey] = res.data;
    saveTranslationCache(cache);
    renderTranslateResponse(res.data);
  } catch (err) {
    outputEl.textContent = `Hata: ${err.message}`;
  } finally {
    loadingEl.classList.add("hidden");
  }
}

function renderTranslateResponse(data) {
  byId("tr-output").textContent = data.mainResult || "Sonuç üretilemedi.";
  const analysisEl = byId("tr-deep-analysis");
  const cards = (data.sections || []).map(sec => {
    const body = Array.isArray(sec.items)
      ? `<ul>${sec.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`
      : `<p>${escapeHtml(sec.content || "")}</p>`;
    return `<div class="analysis-card ${sec.tone || "electric"}"><h4><i class="fa-solid ${sec.icon || "fa-circle-info"}"></i> ${escapeHtml(sec.title)}</h4>${body}</div>`;
  }).join("");

  if (cards) {
    analysisEl.innerHTML = cards;
    analysisEl.classList.remove("hidden");
  }
}

async function handleDictionarySearch(forcedQuery = null) {
  const inputEl = byId("dict-search-input");
  const query = (forcedQuery !== null ? forcedQuery : inputEl.value).trim();
  const mode = byId("dict-type-select").value;
  const resultsEl = byId("dict-results");

  if (!query) { showToast("Aramak istediğin kelimeyi veya kodu yaz.", "info"); return; }
  inputEl.value = query;
  saveRecentDictSearch(query);

  const cacheKey = `dict:${mode}:${query.toLowerCase()}`;
  const cache = getTranslationCache();
  if (cache[cacheKey]) { renderDictionaryResults(cache[cacheKey]); return; }

  resultsEl.innerHTML = `<p class="muted-text"><i class="fa-solid fa-spinner fa-spin"></i> "${escapeHtml(query)}" için dev dil ve kod kütüphanesi taranıyor...</p>`;

  try {
    const res = await callBridge({ action: "dictionary", mode, query });
    cache[cacheKey] = res.data;
    saveTranslationCache(cache);
    renderDictionaryResults(res.data);
  } catch (err) {
    resultsEl.innerHTML = `<p style="color:#ff6b8b"><i class="fa-solid fa-triangle-exclamation"></i> ${escapeHtml(err.message)}</p>`;
  }
}

function renderDictionaryResults(data) {
  const blocks = (data.blocks || []).map(b => {
    const toneClass = b.tone === "good" ? "good" : b.tone === "warn" ? "warn" : "";
    const contentHtml = Array.isArray(b.items)
      ? `<ul>${b.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`
      : `<p>${escapeHtml(b.content || "")}</p>`;
    return `<div class="dict-entry-block ${toneClass}"><h4>${escapeHtml(b.title)}</h4>${contentHtml}</div>`;
  }).join("");

  byId("dict-results").innerHTML = `<div class="dict-entry-block good"><h4><i class="fa-solid fa-book"></i> ${escapeHtml(data.headline || "Sonuç")}</h4><p>${escapeHtml(data.summary || "")}</p></div>${blocks}`;
}

function saveRecentDictSearch(term) {
  let list = [];
  try { list = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_DICT) || "[]"); } catch {}
  list = [term, ...list.filter(x => x.toLowerCase() !== term.toLowerCase())].slice(0, 8);
  localStorage.setItem(STORAGE_KEYS.RECENT_DICT, JSON.stringify(list));
  renderRecentDictChips();
}

function renderRecentDictChips() {
  const wrap = byId("dict-recent-searches");
  if (!wrap) return;
  let list = [];
  try { list = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_DICT) || "[]"); } catch {}
  wrap.innerHTML = list.map(term => `<button type="button" class="recent-chip" data-term="${escapeHtml(term)}">${escapeHtml(term)}</button>`).join("");
  wrap.querySelectorAll(".recent-chip").forEach(btn => {
    btn.addEventListener("click", () => handleDictionarySearch(btn.dataset.term));
  });
}

/* ---------- SKOR TABLOSU, PROFİL & ARKADAŞ MODALI ---------- */
function getCoursePercent(user, courseKey) {
  const done = user?.completedLessons?.[courseKey]?.length || 0;
  const total = getCourseTotalLessons(courseKey);
  return total ? Math.round((done / total) * 100) : 0;
}

function renderLeaderboard() {
  const listEl = byId("leaderboard-list");
  if (!listEl) return;
  const sortKey = STATE.leaderboardSort;
  const users = Object.values(STATE.usersMap).sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));

  if (!users.length) {
    listEl.innerHTML = `<p class="muted-text" style="padding:18px;">Henüz kayıtlı kullanıcı yok. İlk hesabı oluşturup liderlik koltuğuna otur!</p>`;
    return;
  }

  listEl.innerHTML = users.map((u, idx) => {
    const rank = idx + 1;
    const isMe = STATE.currentUser && STATE.currentUser.username === u.username;
    return `
      <div class="lb-row ${isMe ? "is-me" : ""}" data-inspect-user="${escapeHtml(u.username)}">
        <div class="lb-left">
          <div class="lb-rank ${rank <= 3 ? `top-${rank}` : ""}">#${rank}</div>
          <div class="avatar-circle avatar-md">${renderAvatarSVG(u.avatar)}</div>
          <div class="lb-user-info">
            <strong>${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)} ${isMe ? "(Sen)" : ""}</strong>
            <span>@${escapeHtml(u.username)} • PY ${getCoursePercent(u, "python")}% | C# ${getCoursePercent(u, "csharp")}% | EN ${getCoursePercent(u, "english")}%</span>
          </div>
        </div>
        <div class="lb-stats">
          <div class="lb-stat-box"><strong><i class="fa-solid fa-fire fire-icon"></i> ${u.streak} Gün</strong><small>Seri</small></div>
          <div class="lb-stat-box"><strong>${u.sandboxXp} XP</strong><small>Kodlama</small></div>
          <div class="lb-stat-box"><strong>${u.academyXp} XP</strong><small>Kurs</small></div>
          <div class="lb-stat-box"><strong style="color:var(--emerald)">${u.totalXp} XP</strong><small>Toplam</small></div>
        </div>
      </div>`;
  }).join("");

  listEl.querySelectorAll(".lb-row").forEach(row => {
    row.addEventListener("click", () => openUserInspectModal(row.dataset.inspectUser));
  });
}

function buildCourseDetailHTML(user) {
  const items = [
    { key: "python", label: "Python Akademisi", icon: "fa-brands fa-python", fill: "py-fill" },
    { key: "csharp", label: "C# Akademisi", icon: "fa-solid fa-code", fill: "cs-fill" },
    { key: "english", label: "İngilizce Akademisi", icon: "fa-solid fa-earth-americas", fill: "en-fill" }
  ];
  return items.map(it => {
    const done = user?.completedLessons?.[it.key]?.length || 0;
    const total = getCourseTotalLessons(it.key);
    const pct = total ? Math.round((done / total) * 100) : 0;
    return `<div class="course-detail-row"><div class="course-detail-head"><span><i class="${it.icon}"></i> ${it.label}</span><span>${done} / ${total} Ders (${pct}%)</span></div><div class="mini-bar"><div class="mini-bar-fill ${it.fill}" style="width:${pct}%"></div></div></div>`;
  }).join("");
}

function buildGamesTableRowsHTML(user) {
  return Object.entries(GAME_CATALOG).map(([key, meta]) => {
    const s = user?.gameStats?.[key] || { played: 0, wins: 0, losses: 0, xp: 0 };
    const badge = s.played > 0
      ? `<span class="badge-status played">Oynandı (${s.played})</span>`
      : `<span class="badge-status unplayed">Henüz Girilmedi</span>`;
    return `<tr><td><i class="${meta.icon}" style="color:var(--cyan); margin-right:6px;"></i> ${meta.name}</td><td>${badge}</td><td style="color:var(--emerald); font-weight:700;">${s.wins}</td><td style="color:var(--crimson); font-weight:700;">${s.losses}</td><td style="font-family:var(--font-code); color:var(--cyan); font-weight:700;">${s.xp} XP</td></tr>`;
  }).join("");
}

function renderOwnProfile() {
  if (!byId("profile-fullname")) return;
  const u = STATE.currentUser;
  byId("profile-avatar-large").innerHTML = renderAvatarSVG(u ? u.avatar : DEFAULT_AVATAR);
  byId("profile-fullname").textContent = u ? `${u.firstName} ${u.lastName}` : "Misafir Kullanıcı";
  byId("profile-username-tag").textContent = u ? `@${u.username}` : "@giris_yapilmadi";
  byId("stat-total-xp").textContent = u ? u.totalXp : 0;
  byId("stat-streak").textContent = u ? u.streak : 0;
  byId("stat-projects").textContent = u ? u.projectsCount : getSavedProjects().length;
  byId("profile-course-details").innerHTML = buildCourseDetailHTML(u);
  byId("profile-games-tbody").innerHTML = buildGamesTableRowsHTML(u);
}

function openUserInspectModal(username) {
  const u = STATE.usersMap[username];
  if (!u) return;
  byId("user-modal-body").innerHTML = `
    <div style="display:flex; align-items:center; gap:18px; flex-wrap:wrap; margin-bottom:20px; padding-bottom:18px; border-bottom:1px solid var(--border-subtle);">
      <div class="avatar-circle avatar-xl">${renderAvatarSVG(u.avatar)}</div>
      <div style="flex:1; min-width:200px;">
        <h2 style="font-family:var(--font-display); margin-bottom:4px;">${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</h2>
        <span class="username-tag">@${escapeHtml(u.username)}</span>
        <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:12px;">
          <span class="stat-chip"><i class="fa-solid fa-bolt"></i> ${u.totalXp} Toplam XP</span>
          <span class="stat-chip"><i class="fa-solid fa-fire fire-icon"></i> ${u.streak} Gün Seri</span>
          <span class="stat-chip"><i class="fa-solid fa-code"></i> ${u.sandboxXp} Kod XP</span>
          <span class="stat-chip"><i class="fa-solid fa-graduation-cap"></i> ${u.academyXp} Kurs XP</span>
        </div>
      </div>
    </div>
    <h4 style="font-family:var(--font-display); color:var(--cyan); margin-bottom:10px;">Kurs İlerleyişi</h4>
    <div class="course-detail-list" style="margin-bottom:20px;">${buildCourseDetailHTML(u)}</div>
    <h4 style="font-family:var(--font-display); color:var(--cyan); margin-bottom:10px;">Oyun & Etkinlik Performansı</h4>
    <div class="table-responsive"><table class="stats-table"><thead><tr><th>Oyun / Alan</th><th>Durum</th><th>Kazanılan</th><th>Kaybedilen</th><th>Puan</th></tr></thead><tbody>${buildGamesTableRowsHTML(u)}</tbody></table></div>
  `;
  byId("user-modal")?.classList.remove("hidden");
}

function refreshAllUserUI() {
  const u = STATE.currentUser;
  const authBtns = byId("topbar-auth-buttons");
  const userWrap = byId("topbar-user-menu-wrap");

  if (authBtns && userWrap) {
    if (u) {
      authBtns.classList.add("hidden");
      userWrap.classList.remove("hidden");
      byId("topbar-avatar").innerHTML = renderAvatarSVG(u.avatar);
      byId("topbar-name").textContent = u.firstName;
      byId("topbar-handle").textContent = `@${u.username}`;
      byId("dropdown-fullname").textContent = `${u.firstName} ${u.lastName}`;
      byId("dropdown-username").textContent = `@${u.username}`;
    } else {
      authBtns.classList.remove("hidden");
      userWrap.classList.add("hidden");
    }
  }

  const pyP = getCoursePercent(u, "python");
  const csP = getCoursePercent(u, "csharp");
  const enP = getCoursePercent(u, "english");
  if (byId("top-prog-py")) byId("top-prog-py").textContent = `${pyP}%`;
  if (byId("top-bar-py")) byId("top-bar-py").style.width = `${pyP}%`;
  if (byId("top-prog-cs")) byId("top-prog-cs").textContent = `${csP}%`;
  if (byId("top-bar-cs")) byId("top-bar-cs").style.width = `${csP}%`;
  if (byId("top-prog-en")) byId("top-prog-en").textContent = `${enP}%`;
  if (byId("top-bar-en")) byId("top-bar-en").style.width = `${enP}%`;
  if (byId("topbar-total-xp")) byId("topbar-total-xp").textContent = u ? u.totalXp : 0;
  if (byId("topbar-streak-count")) byId("topbar-streak-count").textContent = u ? u.streak : 0;

  renderAcademyHub();
  renderLeaderboard();
  renderOwnProfile();
}

/* ---------- NAVİGASYON & OLAY DİNLEYİCİLERİ ---------- */
function switchView(viewName, sandboxLang = null) {
  STATE.activeView = viewName;
  document.querySelectorAll(".view-section").forEach(sec => sec.classList.toggle("active", sec.id === `view-${viewName}`));
  document.querySelectorAll(".nav-item").forEach(btn => {
    const matchView = btn.dataset.view === viewName;
    const matchLang = !btn.dataset.lang || btn.dataset.lang === (sandboxLang || STATE.sandboxLang);
    btn.classList.toggle("active", matchView && matchLang);
  });

  if (viewName === "sandbox" && sandboxLang) setSandboxLanguage(sandboxLang);
  if (viewName === "leaderboard") renderLeaderboard();
  if (viewName === "profile") renderOwnProfile();
  if (viewName === "academy" && !STATE.lesson.active) renderAcademyHub();
  closeMobileSidebar();
}

function closeMobileSidebar() {
  byId("sidebar")?.classList.remove("open");
  byId("sidebar-backdrop")?.classList.add("hidden");
}

function bindEvents() {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view, btn.dataset.lang || null));
  });

  onId("open-sidebar-btn", "click", () => {
    byId("sidebar")?.classList.add("open");
    byId("sidebar-backdrop")?.classList.remove("hidden");
  });
  onId("close-sidebar-btn", "click", closeMobileSidebar);
  onId("sidebar-backdrop", "click", closeMobileSidebar);

  onId("topbar-score-trigger", "click", () => switchView("leaderboard"));
  onId("btn-open-login", "click", () => openAuthModal("login"));
  onId("btn-open-register", "click", () => openAuthModal("register"));

  const avTrigger = byId("topbar-avatar-trigger");
  const avDropdown = byId("avatar-dropdown");
  if (avTrigger && avDropdown) {
    avTrigger.addEventListener("click", e => {
      e.stopPropagation();
      const isHidden = avDropdown.classList.toggle("hidden");
      avTrigger.setAttribute("aria-expanded", String(!isHidden));
    });
    document.addEventListener("click", e => {
      if (!e.target.closest("#topbar-user-menu-wrap")) avDropdown.classList.add("hidden");
    });
    avDropdown.querySelectorAll(".dropdown-item").forEach(item => {
      item.addEventListener("click", () => {
        const action = item.dataset.dropdownAction;
        avDropdown.classList.add("hidden");
        if (action === "profile") switchView("profile");
        else if (action === "avatar-wall") openAvatarWallModal();
        else if (action === "change-password") byId("password-modal")?.classList.remove("hidden");
        else if (action === "logout") logoutSession();
      });
    });
  }

  onId("btn-close-auth-modal", "click", () => byId("auth-modal")?.classList.add("hidden"));
  onId("btn-close-avatar-modal", "click", () => byId("avatar-wall-modal")?.classList.add("hidden"));
  onId("btn-close-password-modal", "click", () => byId("password-modal")?.classList.add("hidden"));
  onId("btn-close-user-modal", "click", () => byId("user-modal")?.classList.add("hidden"));

  document.querySelectorAll(".auth-tab").forEach(t => t.addEventListener("click", () => switchAuthTab(t.dataset.authTab)));
  onId("login-form", "submit", handleLogin);
  onId("register-form", "submit", handleRegister);
  onId("change-password-form", "submit", handleChangePassword);

  onId("btn-open-avatar-wall-from-profile", "click", openAvatarWallModal);
  onId("btn-open-password-from-profile", "click", () => {
    if (!STATE.currentUser) { openAuthModal("login"); return; }
    byId("password-modal")?.classList.remove("hidden");
  });

  ["av-bg", "av-skin", "av-hair-style", "av-hair-color", "av-accessory", "av-shirt"].forEach(id => {
    onId(id, "input", () => {
      STATE.draftAvatar = {
        bg: byId("av-bg").value,
        skin: byId("av-skin").value,
        hairStyle: byId("av-hair-style").value,
        hairColor: byId("av-hair-color").value,
        accessory: byId("av-accessory").value,
        shirt: byId("av-shirt").value
      };
      byId("avatar-wall-preview").innerHTML = renderAvatarSVG(STATE.draftAvatar);
    });
  });

  onId("btn-save-avatar", "click", async () => {
    if (!STATE.currentUser) return;
    STATE.currentUser.avatar = { ...STATE.draftAvatar };
    await persistUser(STATE.currentUser);
    refreshAllUserUI();
    byId("avatar-wall-modal")?.classList.add("hidden");
    showToast("Avatarın kaydedildi ve tüm sitede güncellendi!", "success");
  });

  onId("btn-run-code", "click", runSandboxCode);
  onId("btn-ai-review", "click", reviewSandboxCodeWithAI);
  onId("btn-save-project", "click", saveCurrentProject);
  onId("btn-clear-console", "click", () => {
    const el = byId("console-output");
    if (el) { el.textContent = ""; el.classList.remove("has-error"); }
  });
  onId("btn-new-project", "click", () => {
    setEditorCode(STARTER_CODE[STATE.sandboxLang]);
    byId("project-name-input").value = STATE.sandboxLang === "python" ? "yeni_proje.py" : "YeniProgram.cs";
    showToast("Yeni temiz çalışma dosyası açıldı.", "info");
  });
  onId("saved-projects-select", "change", e => {
    if (e.target.value === "") return;
    const p = getSavedProjects()[Number(e.target.value)];
    if (!p) return;
    setSandboxLanguage(p.lang);
    byId("project-name-input").value = p.name;
    setEditorCode(p.code);
    showToast(`"${p.name}" yüklendi.`, "info");
  });

  document.querySelectorAll(".course-pill").forEach(p => {
    p.addEventListener("click", () => {
      STATE.activeCourse = p.dataset.course;
      renderAcademyHub();
    });
  });

  onId("btn-ai-random-game", "click", startAIRandomGame);
  onId("btn-ai-regen-lesson", "click", () => {
    if (!STATE.lesson.lessonObj) return;
    if (STATE.lesson.lessonObj.isCustomAI) startAIRandomGame();
    else launchLessonWithQuestions(STATE.lesson.course, STATE.lesson.lessonObj, true);
  });

  onId("btn-exit-lesson", "click", exitLesson);
  onId("btn-check-answer", "click", checkCurrentLessonAnswer);
  onId("btn-next-question", "click", advanceLesson);

  onId("btn-translate-go", "click", handleTranslate);
  onId("btn-tr-clear", "click", () => {
    byId("tr-input").value = "";
    byId("tr-output").textContent = "Çeviri veya kod karşılığı burada görünecek...";
    byId("tr-deep-analysis").classList.add("hidden");
  });
  onId("btn-tr-copy", "click", () => {
    navigator.clipboard?.writeText(byId("tr-output").textContent || "");
    showToast("Çıktı panoya kopyalandı!", "success");
  });
  onId("btn-swap-lang", "click", () => {
    const s = byId("tr-source-lang");
    const t = byId("tr-target-lang");
    if ((s.value === "en" && t.value === "tr") || (s.value === "tr" && t.value === "en")) {
      const tmp = s.value;
      s.value = t.value;
      t.value = tmp;
    } else {
      t.value = "code_analysis";
    }
  });
  onId("tr-source-lang", "change", e => {
    if (e.target.value === "python" || e.target.value === "csharp") byId("tr-target-lang").value = "code_analysis";
  });
  onId("btn-dict-search", "click", () => handleDictionarySearch());
  onId("dict-search-input", "keydown", e => { if (e.key === "Enter") handleDictionarySearch(); });

  document.querySelectorAll(".filter-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      STATE.leaderboardSort = btn.dataset.lbSort;
      renderLeaderboard();
    });
  });
}

function bootstrapApp() {
  try {
    STATE.usersMap = loadLocalUsers();
    const savedUser = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (savedUser && STATE.usersMap[savedUser]) {
      STATE.currentUser = normalizeUser(STATE.usersMap[savedUser]);
      updateUserStreak(STATE.currentUser);
    }
  } catch (e) { console.error("Oturum yükleme hatası:", e); }

  try { initCodeEditor(); } catch (e) { console.error("Editör hatası:", e); }
  try { bindEvents(); } catch (e) { console.error("Buton bağlama hatası:", e); }
  try { renderRecentDictChips(); } catch (e) { console.error("Sözlük geçmişi hatası:", e); }
  try { initFirebase(); } catch (e) { console.error("Firebase hatası:", e); }
  try { refreshAllUserUI(); } catch (e) { console.error("Arayüz yenileme hatası:", e); }
}

document.addEventListener("DOMContentLoaded", bootstrapApp);