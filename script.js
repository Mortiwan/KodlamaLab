/* ==========================================================================
   KODLAMALAB - TAM MÜFREDAT (38 ÜNİTE / 190 DERS) & ANA MOTOR (script.js)
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
    "Python OOP sınıflar, kalıtım, try-except hata yakalama ve modüller",
    "Python generator, decorator, regex, JSON ve async/await temelleri"
  ],
  csharp: [
    "C# temel veri tipleri, string interpolation ve operatörler",
    "C# koşullu ifadeler, switch-case, diziler ve List koleksiyonları",
    "C# metotlar, OOP sınıflar, constructor, interface ve SOLID",
    "C# LINQ, lambda ifadeleri, delegate, event ve async/await",
    "Unity C# MonoBehaviour, Rigidbody, Raycast, Coroutine ve Object Pooling"
  ],
  english: [
    "Günlük konuşma İngilizcesi, zamanlar ve temel gramer kalıpları",
    "İngilizce bağlaçlar (although, despite, however) ve koşul cümleleri",
    "İngilizce Phrasal Verbs, deyimler ve doğru kelime seçimi",
    "Passive Voice, Reported Speech, Relative Clauses ve ileri gramer",
    "Yazılımcılar için teknik İngilizce, hata mesajları ve dokümantasyon okuma"
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
    title: "Python Yolculuğu (Sıfırdan Zirveye — 12 Ünite / 60 Ders)",
    desc: "print komutundan başlayıp veri yapılarına, OOP mimarisine, API ve asenkron uzmanlığa kadar eksiksiz ilerle.",
    units: [
      {
        title: "Ünite 1: Temel Taşlar & Giriş-Çıkış",
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
          { id: "py_2", title: "Yorum Satırları & Kod Okuma", desc: "# yorumları, girinti (indentation) ve okunabilirlik", xp: 40, icon: "fa-font", topic: "Python yorum satırları #, çok satırlı yorumlar ve girinti (indentation) kuralları" },
          { id: "py_3", title: "Kullanıcıdan Veri Alma (input)", desc: "input() ile etkileşimli programlar yazma", xp: 45, icon: "fa-keyboard", topic: "Python input() fonksiyonu, kullanıcıdan metin alma ve etkileşimli konsol girişi" },
          { id: "py_4", title: "Değişken İsimlendirme & Bellek", desc: "snake_case kuralları ve dinamik atama", xp: 45, icon: "fa-microchip", topic: "Python değişken isimlendirme kuralları, snake_case, yasaklı anahtar kelimeler ve yeniden atama" },
          { id: "py_5", title: "Çoklu Atama & Çıktı Biçimleme", desc: "sep, end parametreleri ve paralel atama", xp: 45, icon: "fa-sliders", topic: "Python çoklu değişken atama (a, b = 1, 2), print sep ve end parametreleri" }
        ]
      },
      {
        title: "Ünite 2: Veri Tipleri, Stringler & Operatörler",
        level: "Başlangıç",
        lessons: [
          {
            id: "py_6", title: "int, float, bool & type()", desc: "Temel sayısal ve mantıksal veri tipleri", xp: 45, icon: "fa-calculator",
            topic: "Python int float bool str veri tipleri ve type() fonksiyonu",
            questions: [
              { type: "output", prompt: "Bu kod çalıştırıldığında ekranda ne yazar?", code: "a = 10\nb = 3\nprint(a // b)", options: ["3", "3.33", "1", "30"], answer: "3", explain: "// operatörü tam sayı bölmesi yapar, ondalık kısmı atar." },
              { type: "mcq", prompt: "Python'da bir değişkenin tipini öğrenmek için hangi fonksiyon kullanılır?", options: ["type()", "typeof()", "varType()", "check()"], answer: "type()", explain: "type(degisken) ifadesi verinin int, str, list gibi tipini döndürür." },
              { type: "fill", prompt: "Metin olan '25' değerini tam sayıya çevirmek için boşluğu doldur:", code: "sayi = ___('25')", answer: "int", explain: "int() fonksiyonu uygun metinleri tam sayıya dönüştürür." },
              { type: "order", prompt: "5'in karesini (üssünü) hesaplayan ifadeyi diz:", tokens: ["sonuc", "=", "5", "**", "2"], answer: ["sonuc", "=", "5", "**", "2"], explain: "Python'da üs alma işlemi ** operatörüyle yapılır." }
            ]
          },
          { id: "py_7", title: "Tip Dönüşümleri (Casting)", desc: "int(), float(), str(), bool() dönüşümleri", xp: 45, icon: "fa-repeat", topic: "Python tip dönüşümleri int() float() str() bool() ve input değerini sayıya çevirme" },
          { id: "py_8", title: "Matematik & Atama Operatörleri", desc: "+, -, *, /, //, %, ** ve += kısaltmaları", xp: 50, icon: "fa-gauge-high", topic: "Python aritmetik operatörleri, mod alma %, tam bölme //, üs ** ve += -= atama operatörleri" },
          { id: "py_9", title: "String İndeksleme & Dilimleme", desc: "Metin parçalamak için [baslangic:bitis:adim]", xp: 50, icon: "fa-scissors", topic: "Python string indeksleme, negatif indeksler ve slicing [start:stop:step]" },
          { id: "py_10", title: "String Metotları & f-String", desc: "upper, strip, split, replace ve f-string", xp: 50, icon: "fa-code", topic: "Python string metotları lower upper strip replace split join ve f-string formatlama" }
        ]
      },
      {
        title: "Ünite 3: Koşullar & Karar Mekanizmaları",
        level: "Temel",
        lessons: [
          { id: "py_11", title: "Karşılaştırma & Mantıksal Operatörler", desc: "==, !=, <, >, and, or, not kullanımı", xp: 50, icon: "fa-scale-balanced", topic: "Python karşılaştırma operatörleri == != < > <= >= ve and or not mantıksal operatörleri" },
          {
            id: "py_12", title: "if / elif / else Yapısı", desc: "Koşullara göre dallanan akış kurma", xp: 55, icon: "fa-code-branch",
            topic: "Python if elif else koşullu ifadeler ve girinti blokları",
            questions: [
              { type: "bug", prompt: "Bu koşul bloğundaki sözdizimi hatası nedir?", code: "puan = 85\nif puan >= 50\n    print('Geçti')", options: ["if satırının sonunda ':' (iki nokta) eksik", "puan >= 50 parantez içinde olmalı", "print içeri alınmamalı", "if yerine when yazılmalı"], answer: "if satırının sonunda ':' (iki nokta) eksik", explain: "Python'da if, elif, else, for ve def satırları iki nokta (:) ile biter." },
              { type: "output", prompt: "Çıktı ne olur?", code: "x = 7\nif x % 2 == 0:\n    print('Çift')\nelse:\n    print('Tek')", options: ["Tek", "Çift", "7", "Hata"], answer: "Tek", explain: "7'nin 2'ye bölümünden kalan 1 olduğu için else bloğu çalışır." },
              { type: "fill", prompt: "İkinci bir koşul eklemek için kullanılan anahtar kelime nedir?", code: "if x > 10:\n    print('Büyük')\n____ x == 10:\n    print('Eşit')", answer: "elif", explain: "Python'da 'else if' kısaltılarak elif şeklinde yazılır." },
              { type: "mcq", prompt: "Eşitlik kontrolü için hangi operatör kullanılır?", options: ["==", "=", "===", ":="], answer: "==", explain: "Tek '=' atama yapar, '==' ise iki değerin eşit olup olmadığını kontrol eder." }
            ]
          },
          { id: "py_13", title: "İç İçe Koşullar & Guard Clauses", desc: "Karmaşık karar ağaçlarını temiz yönetme", xp: 55, icon: "fa-sitemap", topic: "Python iç içe if blokları, erken kontrol mantığı ve çoklu şart kombinasyonları" },
          { id: "py_14", title: "Tek Satır Koşul & Truthy/Falsy", desc: "Ternary ifade ve boş değerlerin mantığı", xp: 55, icon: "fa-bolt", topic: "Python tek satır if-else (ternary expression) ve Truthy Falsy değerler (0, '', [], None)" },
          { id: "py_15", title: "match-case (Yapısal Eşleştirme)", desc: "Python 3.10+ modern karar yapısı", xp: 60, icon: "fa-diagram-project", topic: "Python match case structural pattern matching ve varsayılan _ durumu" }
        ]
      },
      {
        title: "Ünite 4: Döngüler & İterasyon",
        level: "Temel",
        lessons: [
          {
            id: "py_16", title: "for Döngüsü & range()", desc: "Belirli sayıda tekrar eden döngüler", xp: 55, icon: "fa-rotate",
            topic: "Python for döngüsü ve range(start, stop, step) kullanımı",
            questions: [
              { type: "output", prompt: "Ekrana kaç satır yazdırılır?", code: "for i in range(3):\n    print(i)", options: ["3 satır (0, 1, 2)", "4 satır (0, 1, 2, 3)", "3 satır (1, 2, 3)", "Sonsuz döngü"], answer: "3 satır (0, 1, 2)", explain: "range(3) sıfırdan başlayıp 3 hariç sayılar üretir: 0, 1, 2." },
              { type: "mcq", prompt: "Bir döngüyü anında durdurup dışına çıkmak için hangi komut kullanılır?", options: ["break", "continue", "stop", "exit"], answer: "break", explain: "break döngüyü tamamen sonlandırır; continue ise sadece o turu atlar." },
              { type: "fill", prompt: "1'den 5'e kadar dönen döngüdeki boşluğu doldur:", code: "for i in _____(1, 6):\n    print(i)", answer: "range", explain: "range(baslangic, bitis) bitiş değeri hariç sayı dizisi oluşturur." },
              { type: "order", prompt: "While döngüsü başlığını doğru sırala:", tokens: ["while", "can", ">", "0", ":"], answer: ["while", "can", ">", "0", ":"], explain: "Koşul doğru olduğu sürece çalışan while döngüsü ':' ile biter." }
            ]
          },
          { id: "py_17", title: "while Döngüsü & Koşullu Tekrar", desc: "Şart sağlandığı sürece çalışan döngüler", xp: 55, icon: "fa-infinity", topic: "Python while döngüsü, sayaç güncelleme ve sonsuz döngüden kaçınma" },
          { id: "py_18", title: "break, continue ve pass Kontrolü", desc: "Döngü akışını hassas biçimde yönlendirme", xp: 60, icon: "fa-hand", topic: "Python döngülerde break, continue ve pass ifadelerinin farkı" },
          { id: "py_19", title: "İç İçe Döngüler & Desenler", desc: "Çarpım tablosu, matris ve ızgara gezme", xp: 60, icon: "fa-table", topic: "Python iç içe for döngüleri (nested loops), 2D tarama ve algoritma mantığı" },
          { id: "py_20", title: "enumerate(), zip() & Döngü else", desc: "Pythonic döngü araçları", xp: 60, icon: "fa-list-ol", topic: "Python enumerate(), zip(), reversed() ve for-else döngü kullanımı" }
        ]
      },
      {
        title: "Ünite 5: Veri Yapıları & Koleksiyonlar",
        level: "Temel-Orta",
        lessons: [
          { id: "py_21", title: "Listeler (list) & Temel Metotlar", desc: "append, insert, remove, pop, len", xp: 60, icon: "fa-list", topic: "Python listeler, eleman ekleme çıkarma append insert pop remove extend" },
          { id: "py_22", title: "Liste Kopyalama, Sıralama & Dilimleme", desc: "sort vs sorted, copy ve referans tuzağı", xp: 65, icon: "fa-layer-group", topic: "Python liste sort sorted reverse copy referans kopyalama ve dilimleme" },
          { id: "py_23", title: "Demetler (tuple) & Unpacking", desc: "Değiştirilemez diziler ve değer açma", xp: 65, icon: "fa-box", topic: "Python tuple (demet), immutability ve tuple unpacking" },
          { id: "py_24", title: "Kümeler (set) & Küme İşlemleri", desc: "Tekrarsız veriler, birleşim ve kesişim", xp: 65, icon: "fa-filter", topic: "Python set veri yapısı, tekrar silme, union intersection difference" },
          { id: "py_25", title: "Sözlükler (dict) & İç İçe Yapılar", desc: "Anahtar-değer eşleme, get, items, keys", xp: 70, icon: "fa-database", topic: "Python dictionary (sözlük) get() keys() values() items() ve iç içe sözlükler" }
        ]
      },
      {
        title: "Ünite 6: Fonksiyonlar & Kapsam",
        level: "Orta",
        lessons: [
          { id: "py_26", title: "Fonksiyon Tanımlama (def)", desc: "Tekrar kullanılabilir kod blokları yazma", xp: 65, icon: "fa-cubes", topic: "Python def ile fonksiyon tanımlama, parametreler ve argüman çağırma" },
          { id: "py_27", title: "return, Çoklu Dönüş & Varsayılanlar", desc: "Değer döndürme ve keyword argümanlar", xp: 70, icon: "fa-plug", topic: "Python return ifadesi, çoklu değer döndürme, varsayılan parametre ve keyword arguments" },
          { id: "py_28", title: "*args ve **kwargs Esnekliği", desc: "Sınırsız sayıda konumsal ve isimli parametre", xp: 70, icon: "fa-sliders", topic: "Python *args ve **kwargs kullanımı ve fonksiyon çağrısında unpacking" },
          { id: "py_29", title: "Kapsam (Scope), global & nonlocal", desc: "LEGB kuralı ve değişken görünürlüğü", xp: 75, icon: "fa-lock", topic: "Python local enclosing global built-in (LEGB) scope kuralı, global ve nonlocal" },
          { id: "py_30", title: "Lambda, Özyineleme & Docstring", desc: "Anonim fonksiyonlar ve recursive mantık", xp: 75, icon: "fa-bolt", topic: "Python lambda fonksiyonları, recursion (özyineleme) ve docstring yazımı" }
        ]
      },
      {
        title: "Ünite 7: Hata Yönetimi & Debugging",
        level: "Orta",
        lessons: [
          { id: "py_31", title: "Hata Türleri & Traceback Okuma", desc: "SyntaxError, TypeError, ValueError, KeyError", xp: 70, icon: "fa-bug", topic: "Python yaygın hata türleri ValueError TypeError IndexError KeyError ve traceback okuma" },
          { id: "py_32", title: "try / except ile Hata Yakalama", desc: "Program çökmeden hataları kontrol etme", xp: 70, icon: "fa-shield-halved", topic: "Python try except bloğu ve belirli hata türlerini yakalama" },
          { id: "py_33", title: "Çoklu except, else & finally", desc: "Kaynak temizliği ve tam akış güvenliği", xp: 75, icon: "fa-wrench", topic: "Python çoklu except blokları, try-except-else-finally çalışma sırası" },
          { id: "py_34", title: "raise ile Hata Fırlatma", desc: "Geçersiz verilerde bilinçli hata üretme", xp: 75, icon: "fa-fire", topic: "Python raise anahtar kelimesi ile özel doğrulama ve hata fırlatma" },
          { id: "py_35", title: "Özel Hata Sınıfları & assert", desc: "Kendi Exception sınıfını oluşturma", xp: 80, icon: "fa-flask", topic: "Python custom Exception sınıfları ve assert ile hata ayıklama" }
        ]
      },
      {
        title: "Ünite 8: Modüller, Paketler & Dosya/JSON",
        level: "Orta",
        lessons: [
          { id: "py_36", title: "import Mantığı & Kendi Modülün", desc: "import, from ... import, as ve __name__", xp: 75, icon: "fa-puzzle-piece", topic: "Python modül import etme, takma ad (as) ve if __name__ == '__main__' yapısı" },
          { id: "py_37", title: "Standart Kütüphane Gücü", desc: "math, random, os, sys ve pathlib", xp: 75, icon: "fa-gear", topic: "Python math, random, os, sys ve pathlib standart modülleri" },
          { id: "py_38", title: "Dosya Okuma & Yazma (with open)", desc: "r, w, a modları ve güvenli dosya kapatma", xp: 80, icon: "fa-folder-open", topic: "Python with open dosya okuma yazma ekleme modları read readline readlines" },
          { id: "py_39", title: "CSV & Metin Verisi İşleme", desc: "Tablo verilerini okuma ve raporlama", xp: 80, icon: "fa-table", topic: "Python csv modülü ile veri okuma yazma ve satır ayrıştırma" },
          { id: "py_40", title: "JSON Okuma, Yazma & API Verisi", desc: "json.loads, json.dumps, load ve dump", xp: 85, icon: "fa-file-code", topic: "Python json modülü loads dumps load dump ve sözlük-JSON dönüşümü" }
        ]
      },
      {
        title: "Ünite 9: Nesne Yönelimli Programlama (OOP)",
        level: "Orta-İleri",
        lessons: [
          { id: "py_41", title: "Sınıflar (class), Nesneler & __init__", desc: "Nesne şablonu ve kurucu metot kurma", xp: 80, icon: "fa-sitemap", topic: "Python OOP class tanımlama, nesne üretme ve __init__ kurucu metodu" },
          { id: "py_42", title: "Metotlar, self & Sınıf Özellikleri", desc: "Instance, @classmethod ve @staticmethod", xp: 85, icon: "fa-gears", topic: "Python self kavramı, instance vs class değişkenleri, @classmethod ve @staticmethod" },
          { id: "py_43", title: "Kapsülleme & @property", desc: "Özel alanlar (_ / __), getter ve setter", xp: 85, icon: "fa-lock", topic: "Python encapsulation, özel özellikler, @property ve setter kullanımı" },
          { id: "py_44", title: "Kalıtım, super() & Polimorfizm", desc: "Sınıf türetme, override ve çok biçimlilik", xp: 90, icon: "fa-diagram-project", topic: "Python inheritance, super(), method overriding ve polymorphism" },
          { id: "py_45", title: "Dunder Metotlar & Dataclasses", desc: "__str__, __repr__, __eq__ ve @dataclass", xp: 90, icon: "fa-star", topic: "Python magic/dunder metotlar __str__ __repr__ __len__ ve @dataclass" }
        ]
      },
      {
        title: "Ünite 10: İleri Python Teknikleri",
        level: "İleri",
        lessons: [
          { id: "py_46", title: "List, Dict & Set Comprehension", desc: "Tek satırda hızlı ve okunaklı veri üretimi", xp: 85, icon: "fa-bolt", topic: "Python list comprehension, dict comprehension, set comprehension ve koşullu filtreleme" },
          { id: "py_47", title: "Iterator & Generator (yield)", desc: "Bellek dostu tembel veri akışları", xp: 90, icon: "fa-infinity", topic: "Python iterators, next(), generator fonksiyonları ve yield anahtar kelimesi" },
          { id: "py_48", title: "Decorator (Süsleyici) Mimarisi", desc: "Fonksiyonlara dışarıdan yetenek ekleme", xp: 95, icon: "fa-wand-magic-sparkles", topic: "Python decorators, closure mantığı, @wrapper ve functools.wraps" },
          { id: "py_49", title: "map, filter & Fonksiyonel Araçlar", desc: "any(), all(), key ile özel sıralama", xp: 90, icon: "fa-filter", topic: "Python map, filter, any, all, sorted key=lambda fonksiyonel programlama" },
          { id: "py_50", title: "Özel Context Manager Yazma", desc: "__enter__, __exit__ ve contextlib", xp: 95, icon: "fa-key", topic: "Python context manager protokolü __enter__ __exit__ ve with bloğu tasarımı" }
        ]
      },
      {
        title: "Ünite 11: Veri, Regex, API & Veritabanı",
        level: "İleri",
        lessons: [
          { id: "py_51", title: "Düzenli İfadeler (Regex - re)", desc: "E-posta, telefon ve desen eşleştirme", xp: 90, icon: "fa-magnifying-glass", topic: "Python re modülü search findall sub ve temel regex desenleri" },
          { id: "py_52", title: "Tarih & Zaman Yönetimi (datetime)", desc: "timedelta, strftime ve zaman farkları", xp: 90, icon: "fa-clock", topic: "Python datetime, date, timedelta, strftime ve strptime kullanımı" },
          { id: "py_53", title: "HTTP, REST API & İstek Mantığı", desc: "GET/POST, durum kodları ve JSON işleme", xp: 95, icon: "fa-globe", topic: "Python HTTP GET POST istekleri, durum kodları (200/404/500), headers ve REST API tüketimi" },
          { id: "py_54", title: "SQLite ile Veritabanı Temelleri", desc: "sqlite3 ile tablo kurma ve CRUD sorguları", xp: 95, icon: "fa-database", topic: "Python sqlite3 modülü, CREATE TABLE, INSERT, SELECT, UPDATE, DELETE ve parametreli sorgular" },
          { id: "py_55", title: "Sanal Ortam (venv) & Paket Yönetimi", desc: "pip, requirements.txt ve temiz proje yapısı", xp: 95, icon: "fa-box", topic: "Python virtual environment venv, pip paket kurulumu ve requirements.txt yönetimi" }
        ]
      },
      {
        title: "Ünite 12: Uzmanlık, Test & Mimari",
        level: "Uzman",
        lessons: [
          { id: "py_56", title: "Type Hints & Statik Tip Güvenliği", desc: "list[int], Optional, Union ve tip ipuçları", xp: 95, icon: "fa-check-double", topic: "Python type annotations, typing modülü, fonksiyon dönüş tipleri ve kod güvenilirliği" },
          { id: "py_57", title: "Asenkron Programlama (async/await)", desc: "asyncio ile eşzamanlı I/O yönetimi", xp: 100, icon: "fa-rocket", topic: "Python asyncio, async def, await, asyncio.gather ve eşzamanlı görev mantığı" },
          { id: "py_58", title: "Birim Testleri (unittest / pytest)", desc: "Kodun doğruluğunu otomatik test etme", xp: 100, icon: "fa-flask", topic: "Python unit testing, pytest assert mantığı, test senaryoları ve kenar durumlar" },
          { id: "py_59", title: "Temiz Kod (PEP 8) & Refactoring", desc: "Okunaklı, sürdürülebilir yazılım standartları", xp: 100, icon: "fa-code", topic: "Python PEP 8 kod stili, DRY prensibi, fonksiyon bölme ve refactoring" },
          { id: "py_60", title: "Algoritmalar & Big-O Analizi", desc: "Zaman/bellek karmaşıklığı, arama ve sıralama", xp: 120, icon: "fa-crown", topic: "Python algoritma analizi Big-O O(1) O(n) O(log n) O(n^2), binary search ve hash tablosu" }
        ]
      }
    ]
  },
  csharp: {
    title: "C# & Unity Yolculuğu (Sıfırdan Zirveye — 14 Ünite / 70 Ders)",
    desc: "C# sözdizimi ve .NET mimarisinden başlayıp OOP, LINQ, Async ve Unity oyun geliştirme sistemlerine kadar eksiksiz ilerle.",
    units: [
      {
        title: "Ünite 1: C# Temelleri & Sözdizimi",
        level: "Başlangıç",
        lessons: [
          {
            id: "cs_1", title: "Main Metodu & Console Çıktısı", desc: "Console.WriteLine, Write ve temel program iskeleti", xp: 40, icon: "fa-terminal",
            topic: "C# Main metodu, using System, Console.WriteLine, Console.Write ve noktalı virgül kuralı",
            questions: [
              { type: "mcq", prompt: "C#'ta konsola yeni satırla yazı basan doğru komut hangisidir?", options: ["Console.WriteLine(\"Selam\");", "print(\"Selam\");", "System.out.print(\"Selam\");", "echo \"Selam\";"], answer: "Console.WriteLine(\"Selam\");", explain: "C#'ta System isim alanındaki Console.WriteLine() kullanılır ve satır ';' ile biter." },
              { type: "bug", prompt: "Bu C# kodundaki hata nedir?", code: "int yas = 28\nConsole.WriteLine(yas);", options: ["İlk satırın sonunda ';' (noktalı virgül) eksik", "int yerine var yazmak zorunlu", "yas çift tırnakta olmalı", "Hata yok"], answer: "İlk satırın sonunda ';' (noktalı virgül) eksik", explain: "C#'ta her ifade noktalı virgül (;) ile sonlandırılmalıdır." },
              { type: "order", prompt: "Metin değişkeni tanımlayan C# satırını sırala:", tokens: ["string", "ad", "=", "\"Harun\"", ";"], answer: ["string", "ad", "=", "\"Harun\"", ";"], explain: "C# güçlü tiplidir: önce tip (string), sonra ad, sonra değer yazılır." },
              { type: "fill", prompt: "Doğru/Yanlış değer tutan C# veri tipi nedir?", code: "____ aktifMi = true;", answer: "bool", explain: "C#'ta mantıksal değerler bool tipiyle saklanır." }
            ]
          },
          { id: "cs_2", title: "Değişken Tanımlama & Tip Güvenliği", desc: "Güçlü tip sistemi ve ilk değer atama", xp: 40, icon: "fa-code", topic: "C# değişken tanımlama, camelCase adlandırma ve güçlü tip güvenliği (static typing)" },
          { id: "cs_3", title: "Console.ReadLine ile Veri Alma", desc: "Kullanıcıdan konsol girdisi okuma", xp: 45, icon: "fa-keyboard", topic: "C# Console.ReadLine() kullanımı ve kullanıcıdan metin alma" },
          { id: "cs_4", title: "Sabitler (const & readonly)", desc: "Değiştirilemeyen değerler ve güvenlik", xp: 45, icon: "fa-lock", topic: "C# const ve readonly anahtar kelimeleri ve aralarındaki temel fark" },
          { id: "cs_5", title: "Yorum Satırları, Bloklar & Namespace", desc: "//, /* */, süslü parantez ve isim alanları", xp: 45, icon: "fa-font", topic: "C# tek/çok satırlı yorumlar, XML yorumları, süslü parantez blokları ve namespace yapısı" }
        ]
      },
      {
        title: "Ünite 2: Veri Tipleri & Stringler",
        level: "Başlangıç",
        lessons: [
          { id: "cs_6", title: "Sayısal Tipler (int, float, double, decimal)", desc: "Tam sayılar, ondalıklı f/m ekleri ve hassasiyet", xp: 45, icon: "fa-calculator", topic: "C# int long float double decimal sayısal veri tipleri ve f m sonekleri" },
          { id: "cs_7", title: "char, bool, string & var", desc: "Karakter, mantık, metin ve tip çıkarımı", xp: 50, icon: "fa-sliders", topic: "C# char tek tırnak, string çift tırnak, bool ve var ile derleme zamanı tip çıkarımı" },
          { id: "cs_8", title: "Tip Dönüşümü (Casting, Parse & Convert)", desc: "Bilinçli/bilinçsiz dönüşüm ve int.Parse", xp: 50, icon: "fa-repeat", topic: "C# implicit explicit casting, Convert.ToInt32 ve int.Parse kullanımı" },
          { id: "cs_9", title: "Güvenli Dönüşüm (TryParse)", desc: "Program çökmeden sayı doğrulama", xp: 50, icon: "fa-shield-halved", topic: "C# int.TryParse ve out parametresi ile hatalı kullanıcı girdisini güvenle yönetme" },
          { id: "cs_10", title: "String Metotları, Interpolation & StringBuilder", desc: "$\"\", Trim, Split, Replace ve performanslı metin", xp: 55, icon: "fa-scissors", topic: "C# string interpolation, Trim Split Contains Replace Substring ve StringBuilder mantığı" }
        ]
      },
      {
        title: "Ünite 3: Operatörler & Karar Yapıları",
        level: "Temel",
        lessons: [
          { id: "cs_11", title: "Aritmetik, Karşılaştırma & Mantık Operatörleri", desc: "++, --, %, ==, !=, &&, || ve ! operatörleri", xp: 50, icon: "fa-scale-balanced", topic: "C# aritmetik, artırma/azaltma ++ --, karşılaştırma ve && || ! mantıksal operatörleri" },
          {
            id: "cs_12", title: "if / else if / else Blokları", desc: "Parantez kuralları ve koşullu dallanma", xp: 55, icon: "fa-code-branch",
            topic: "C# if else if else koşullu ifadeleri ve iç içe karar yapıları",
            questions: [
              { type: "output", prompt: "Bu C# kodu ekrana ne yazar?", code: "int can = 0;\nConsole.WriteLine(can > 0 ? \"Hayatta\" : \"Oyun Bitti\");", options: ["Oyun Bitti", "Hayatta", "0", "Derleme hatası"], answer: "Oyun Bitti", explain: "Ternary (? :) operatöründe can > 0 yanlış olduğu için ikinci ifade seçilir." },
              { type: "mcq", prompt: "C#'ta 'VE' (her iki koşul da doğru) mantıksal operatörü hangisidir?", options: ["&&", "and", "||", "&="], answer: "&&", explain: "C#'ta VE için &&, VEYA için ||, DEĞİL için ! kullanılır." },
              { type: "fill", prompt: "Switch bloğunda hiçbir case tutmazsa çalışan bölümün adı nedir?", code: "_______:\n    Console.WriteLine(\"Diğer\");\n    break;", answer: "default", explain: "Switch yapısında varsayılan durum default etiketiyle tanımlanır." },
              { type: "bug", prompt: "Koşul yazımındaki hata nedir?", code: "if x > 5 {\n    Console.WriteLine(\"Büyük\");\n}", options: ["Koşul parantez içine alınmalı: if (x > 5)", "Süslü parantez kullanılmaz", "Console küçük harfle başlar", "Hata yok"], answer: "Koşul parantez içine alınmalı: if (x > 5)", explain: "C#'ta if, while ve for koşulları mutlaka () parantez içine yazılır." }
            ]
          },
          { id: "cs_13", title: "Ternary (? :) & Kısa Devre Mantığı", desc: "Tek satırda koşul ve && / || kısa devresi", xp: 55, icon: "fa-bolt", topic: "C# ternary operatörü (? :) ve mantıksal kısa devre (short-circuit evaluation)" },
          { id: "cs_14", title: "switch-case Yapısı & break Kuralı", desc: "Çoklu seçenekleri temiz yönetme", xp: 55, icon: "fa-sitemap", topic: "C# switch case default ve break zorunluluğu" },
          { id: "cs_15", title: "Modern Switch Expression & Pattern Matching", desc: "=> ile modern C# desen eşleştirme", xp: 60, icon: "fa-diagram-project", topic: "C# modern switch expressions, when koşulu ve pattern matching (is, > <)" }
        ]
      },
      {
        title: "Ünite 4: Döngüler & Akış Kontrolü",
        level: "Temel",
        lessons: [
          { id: "cs_16", title: "for Döngüsü & Sayaç Kontrolü", desc: "Başlangıç, koşul ve artış adımları", xp: 55, icon: "fa-rotate", topic: "C# for döngüsü sözdizimi, ileri/geri sayma ve sayaç adımları" },
          { id: "cs_17", title: "while Döngüsü & Koşullu Tekrar", desc: "Bilinmeyen sayıda tekrar eden akışlar", xp: 55, icon: "fa-infinity", topic: "C# while döngüsü, çıkış koşulu ve sonsuz döngü kontrolü" },
          { id: "cs_18", title: "do-while Döngüsü", desc: "En az bir kez çalışan menü ve doğrulama döngüsü", xp: 60, icon: "fa-circle-play", topic: "C# do-while döngüsü ile while döngüsü arasındaki fark ve kullanım alanları" },
          {
            id: "cs_19", title: "foreach Döngüsü", desc: "Dizi ve koleksiyonları güvenle gezme", xp: 60, icon: "fa-list-ol",
            topic: "C# foreach döngüsü, diziler ve List koleksiyonları üzerinde gezinme",
            questions: [
              { type: "mcq", prompt: "Bir dizi veya List içindeki tüm elemanları tek tek gezmek için en pratik döngü hangisidir?", options: ["foreach", "switch", "try", "using"], answer: "foreach", explain: "foreach koleksiyonun her elemanı üzerinde indeks hatası riski olmadan döner." },
              { type: "output", prompt: "Çıktı ne olur?", code: "int[] sayilar = { 10, 20, 30 };\nConsole.WriteLine(sayilar[1]);", options: ["20", "10", "30", "1"], answer: "20", explain: "C#'ta dizi indeksleri 0'dan başlar; [1] ikinci elemandır." },
              { type: "fill", prompt: "List<string> içine yeni eleman ekleyen metot nedir?", code: "oyuncular.___(\"Serhat\");", answer: "Add", explain: "C# List<T> koleksiyonuna eleman Add() metoduyla eklenir." },
              { type: "order", prompt: "5 elemanlı tam sayı dizisi tanımını sırala:", tokens: ["int[]", "puanlar", "=", "new", "int[5];"], answer: ["int[]", "puanlar", "=", "new", "int[5];"], explain: "C#'ta sabit boyutlu dizi new tip[boyut] şeklinde oluşturulur." }
            ]
          },
          { id: "cs_20", title: "break, continue & İç İçe Döngüler", desc: "Akış kesme, tur atlama ve matris tarama", xp: 60, icon: "fa-table", topic: "C# döngülerde break continue kullanımı ve iç içe döngüler (nested loops)" }
        ]
      },
      {
        title: "Ünite 5: Diziler, Koleksiyonlar & Generics",
        level: "Temel-Orta",
        lessons: [
          { id: "cs_21", title: "Tek & Çok Boyutlu Diziler (Array)", desc: "int[], int[,], Length ve Array metotları", xp: 60, icon: "fa-layer-group", topic: "C# tek boyutlu diziler, 2D matris dizileri int[,] ve Array.Sort Array.Reverse" },
          { id: "cs_22", title: "List<T> Dinamik Listeler", desc: "Add, Remove, Count, Contains ve dinamik boyut", xp: 65, icon: "fa-list", topic: "C# System.Collections.Generic List<T> Add RemoveAt Count Contains Clear" },
          { id: "cs_23", title: "Dictionary<TKey, TValue>", desc: "Anahtar-değer eşleme ve TryGetValue", xp: 65, icon: "fa-database", topic: "C# Dictionary<TKey, TValue> Add ContainsKey TryGetValue ve hızlı arama" },
          { id: "cs_24", title: "HashSet, Queue & Stack", desc: "Tekrarsız küme, kuyruk (FIFO) ve yığın (LIFO)", xp: 70, icon: "fa-box", topic: "C# HashSet<T>, Queue<T> (Enqueue/Dequeue) ve Stack<T> (Push/Pop)" },
          { id: "cs_25", title: "Generic Sınıflar & Metotlar (<T>)", desc: "Tip bağımsız yeniden kullanılabilir yapılar", xp: 75, icon: "fa-cubes", topic: "C# Generics <T>, generic metotlar, generic sınıflar ve where T : class kısıtları" }
        ]
      },
      {
        title: "Ünite 6: Metotlar & Bellek Mantığı",
        level: "Orta",
        lessons: [
          { id: "cs_26", title: "Metot Tanımlama, void & return", desc: "Parametreler, geri dönüş ve temiz iş bölümü", xp: 65, icon: "fa-plug", topic: "C# metot tanımlama, void ve return tipleri, parametre gönderimi ve varsayılan değerler" },
          { id: "cs_27", title: "Method Overloading & Expression-Bodied", desc: "Aynı isimde farklı imzalar ve => metotları", xp: 70, icon: "fa-bolt", topic: "C# method overloading (aşırı yükleme) ve => expression-bodied metotlar" },
          { id: "cs_28", title: "ref, out, in & params Parametreleri", desc: "Değerleri referansla taşıma ve değişken argüman", xp: 75, icon: "fa-sliders", topic: "C# ref, out, in ve params anahtar kelimelerinin çalışma mantığı ve farkları" },
          { id: "cs_29", title: "Stack vs Heap (Value vs Reference Type)", desc: "Bellekte kopyalama, referans ve Garbage Collector", xp: 80, icon: "fa-microchip", topic: "C# Value types (int, struct) vs Reference types (class, string, array), Stack ve Heap farkı" },
          { id: "cs_30", title: "Null Güvenliği (?, ??, ?., !)", desc: "NullReferenceException önleme teknikleri", xp: 80, icon: "fa-shield-halved", topic: "C# nullable tipler int?, null-coalescing ??, null-conditional ?. ve null güvenliği" }
        ]
      },
      {
        title: "Ünite 7: Nesne Yönelimli Programlama (OOP Temelleri)",
        level: "Orta",
        lessons: [
          { id: "cs_31", title: "Class & Nesne (Instance) Üretimi", desc: "Alanlar (fields), new anahtar kelimesi ve this", xp: 75, icon: "fa-sitemap", topic: "C# class tanımlama, new ile nesne oluşturma, alanlar (fields) ve this referansı" },
          { id: "cs_32", title: "Constructor (Kurucu Metotlar)", desc: "Parametreli kurucu, overloading ve başlangıç durumu", xp: 75, icon: "fa-wrench", topic: "C# constructor (yapıcı metot), varsayılan kurucu ve constructor overloading" },
          { id: "cs_33", title: "Erişim Belirleyiciler & Kapsülleme", desc: "public, private, protected, internal ve veri koruma", xp: 80, icon: "fa-lock", topic: "C# access modifiers public private protected internal ve encapsulation" },
          { id: "cs_34", title: "Property (get / set / init) & static", desc: "Otomatik özellikler, doğrulama ve static üyeler", xp: 80, icon: "fa-gears", topic: "C# properties get set private set init ve static sınıf/metot kavramı" },
          { id: "cs_35", title: "struct, enum & record Yapıları", desc: "Sabit durum listeleri ve hafif veri modelleri", xp: 85, icon: "fa-star", topic: "C# enum kullanımı, struct vs class farkı ve modern C# record tipleri" }
        ]
      },
      {
        title: "Ünite 8: İleri OOP & Yazılım Mimarisi",
        level: "Orta-İleri",
        lessons: [
          { id: "cs_36", title: "Kalıtım (Inheritance) & base", desc: "Üst sınıftan özellik ve davranış devralma", xp: 80, icon: "fa-diagram-project", topic: "C# kalıtım (inheritance :), base anahtar kelimesi ve sealed sınıflar" },
          { id: "cs_37", title: "Polimorfizm (virtual & override)", desc: "Aynı çağrıyla farklı alt sınıf davranışları", xp: 85, icon: "fa-wand-magic-sparkles", topic: "C# polymorphism, virtual metotlar ve override ile davranış ezme" },
          { id: "cs_38", title: "Abstract Sınıflar & Soyutlama", desc: "abstract class, abstract metot ve şablon tasarım", xp: 85, icon: "fa-cubes", topic: "C# abstract sınıflar ve abstract metotların normal sınıflardan farkı" },
          { id: "cs_39", title: "Interface (Arayüzler) & Çoklu Sözleşme", desc: "IDamageable gibi yetenek tabanlı mimari kurma", xp: 90, icon: "fa-plug", topic: "C# interface tanımlama, birden fazla interface uygulama ve gevşek bağlılık" },
          { id: "cs_40", title: "SOLID Prensipleri & Temiz Mimari", desc: "SRP, OCP, DIP ve sürdürülebilir sınıf tasarımı", xp: 95, icon: "fa-compass", topic: "C# SOLID prensipleri (Single Responsibility, Open/Closed, Dependency Inversion) örnekleri" }
        ]
      },
      {
        title: "Ünite 9: Modern C# — LINQ, Lambda & Events",
        level: "İleri",
        lessons: [
          { id: "cs_41", title: "Lambda İfadeleri (=>)", desc: "Kısa anonim fonksiyonlar ve ifadeler", xp: 85, icon: "fa-bolt", topic: "C# lambda expressions (x => x * 2) ve anonim fonksiyon mantığı" },
          { id: "cs_42", title: "LINQ Temelleri: Where, Select, OrderBy", desc: "Koleksiyonları SQL benzeri tek satırda sorgulama", xp: 90, icon: "fa-filter", topic: "C# LINQ Where, Select, OrderBy, OrderByDescending ve zincirleme sorgular" },
          { id: "cs_43", title: "LINQ İleri: FirstOrDefault, Any, GroupBy", desc: "Güvenli tekil arama, toplama ve gruplama", xp: 90, icon: "fa-magnifying-glass", topic: "C# LINQ FirstOrDefault, SingleOrDefault, Any, All, Count, Sum, GroupBy" },
          { id: "cs_44", title: "Delegate, Action, Func & Predicate", desc: "Metotları değişken gibi taşıma ve callback", xp: 95, icon: "fa-code-branch", topic: "C# delegate, yerleşik Action<T>, Func<T, TResult> ve Predicate<T>" },
          { id: "cs_45", title: "Event (Olay) Sistemi & Abonelik", desc: "event keyword, += abone olma ve -= çıkma", xp: 95, icon: "fa-bell", topic: "C# event tanımlama, EventHandler, += abonelik ve bellek sızıntısı önlemek için -= çıkarma" }
        ]
      },
      {
        title: "Ünite 10: Hata Yönetimi, Dosya, JSON & Async",
        level: "İleri",
        lessons: [
          { id: "cs_46", title: "try / catch / finally & Exception", desc: "Çalışma zamanı hatalarını güvenle yakalama", xp: 85, icon: "fa-bug", topic: "C# try catch finally, birden fazla catch bloğu ve Exception.Message" },
          { id: "cs_47", title: "throw & Özel Exception Sınıfları", desc: "İş kurallarına özel hata fırlatma", xp: 90, icon: "fa-fire", topic: "C# throw anahtar kelimesi ve kendi Custom Exception sınıfını türetme" },
          { id: "cs_48", title: "Dosya İşlemleri (System.IO) & using", desc: "File.ReadAllText, StreamWriter ve IDisposable", xp: 90, icon: "fa-folder-open", topic: "C# System.IO File, Path, Directory ve using bloğu ile kaynak serbest bırakma" },
          { id: "cs_49", title: "JSON Serileştirme (System.Text.Json)", desc: "Nesneleri JSON'a çevirme ve geri okuma", xp: 95, icon: "fa-file-code", topic: "C# JsonSerializer.Serialize ve Deserialize ile veri saklama ve API haberleşmesi" },
          { id: "cs_50", title: "Asenkron Programlama (Task, async & await)", desc: "Arayüzü dondurmadan arka plan işlemleri yönetme", xp: 100, icon: "fa-rocket", topic: "C# async await, Task, Task<T>, Task.WhenAll ve CancellationToken temelleri" }
        ]
      },
      {
        title: "Ünite 11: Unity C# — Temel Motor & Hareket",
        level: "Unity Giriş",
        lessons: [
          { id: "cs_51", title: "MonoBehaviour Yaşam Döngüsü", desc: "Awake, Start, Update, FixedUpdate, LateUpdate", xp: 90, icon: "fa-gamepad", topic: "Unity C# MonoBehaviour Awake Start Update FixedUpdate LateUpdate OnEnable OnDestroy çalışma sırası" },
          { id: "cs_52", title: "GameObject, Component & SerializeField", desc: "GetComponent<T>, Inspector bağlantısı ve referanslar", xp: 90, icon: "fa-puzzle-piece", topic: "Unity C# GameObject, GetComponent<T>, [SerializeField] private alanlar ve bileşen mimarisi" },
          { id: "cs_53", title: "Transform, Vector2 & Vector3 Matematiği", desc: "Pozisyon, rotasyon, yön vektörü ve normalized", xp: 95, icon: "fa-compass", topic: "Unity C# Transform position rotation localScale, Vector2/Vector3, Distance ve normalized" },
          { id: "cs_54", title: "Time.deltaTime & Kare Hızından Bağımsızlık", desc: "60 FPS ve 165 FPS'te aynı hızda hareket", xp: 95, icon: "fa-clock", topic: "Unity C# Time.deltaTime, Time.fixedDeltaTime, Time.timeScale ve FPS bağımsız hareket" },
          { id: "cs_55", title: "Oyuncu Girdisi (Input & New Input System)", desc: "Klavye, fare, gamepad ve hareket kontrolü", xp: 95, icon: "fa-keyboard", topic: "Unity C# Input.GetAxis, GetKeyDown, New Input System InputAction ve karakter kontrolü" }
        ]
      },
      {
        title: "Ünite 12: Unity C# — Fizik, Çarpışma & Nesne Üretimi",
        level: "Unity Orta",
        lessons: [
          { id: "cs_56", title: "Rigidbody & Fizik Hareketi", desc: "AddForce, velocity, yerçekimi ve FixedUpdate", xp: 95, icon: "fa-gauge-high", topic: "Unity C# Rigidbody / Rigidbody2D AddForce, linearVelocity/velocity ve FixedUpdate kuralı" },
          { id: "cs_57", title: "Collider, Collision & Trigger Olayları", desc: "OnCollisionEnter vs OnTriggerEnter farkı", xp: 95, icon: "fa-bolt", topic: "Unity C# Collider, IsTrigger, OnCollisionEnter, OnTriggerEnter ve Tag/CompareTag kontrolü" },
          { id: "cs_58", title: "Raycast & Katman Maskeleri (LayerMask)", desc: "Nişan alma, zemin algılama ve lazer ışınları", xp: 100, icon: "fa-crosshairs", topic: "Unity C# Physics.Raycast, RaycastHit, LayerMask ve zemin/hedef algılama" },
          { id: "cs_59", title: "Prefab, Instantiate & Destroy", desc: "Mermi, düşman ve dinamik sahne nesnesi üretimi", xp: 100, icon: "fa-cubes", topic: "Unity C# Prefab sistemi, Instantiate ile klon oluşturma ve Destroy ile nesne silme" },
          { id: "cs_60", title: "Kamera Takibi, Lerp & Slerp Yumuşatma", desc: "Akıcı kamera hareketi ve açılı dönüşler", xp: 100, icon: "fa-eye", topic: "Unity C# LateUpdate kamera takibi, Vector3.Lerp, Quaternion.Slerp ve Mathf.Clamp" }
        ]
      },
      {
        title: "Ünite 13: Unity C# — Oyun Sistemleri",
        level: "Unity Orta-İleri",
        lessons: [
          { id: "cs_61", title: "UI, Canvas & TextMeshPro Kontrolü", desc: "Can barı, skor ekranı ve buton olayları", xp: 100, icon: "fa-desktop", topic: "Unity C# UI yönetimi, TextMeshProUGUI, Slider, Image.fillAmount ve Button.onClick" },
          { id: "cs_62", title: "Coroutine (IEnumerator) & Zamanlayıcılar", desc: "WaitForSeconds, bekleme zinciri ve akış kontrolü", xp: 100, icon: "fa-hourglass-half", topic: "Unity C# Coroutine, IEnumerator, yield return new WaitForSeconds ve StartCoroutine/StopCoroutine" },
          { id: "cs_63", title: "Ses (AudioSource) & Animasyon (Animator)", desc: "PlayOneShot efektleri ve Animator parametreleri", xp: 100, icon: "fa-volume-high", topic: "Unity C# AudioSource PlayOneShot, Animator SetBool SetFloat SetTrigger ve efekt tetikleme" },
          { id: "cs_64", title: "ScriptableObject ile Veri Odaklı Tasarım", desc: "Silah, eşya ve düşman verilerini koddan ayırma", xp: 105, icon: "fa-database", topic: "Unity C# ScriptableObject, [CreateAssetMenu] ve modüler oyun verisi mimarisi" },
          { id: "cs_65", title: "Oyun Kayıt/Yükleme & Sahne Yönetimi", desc: "SceneManager, PlayerPrefs ve JSON kayıt sistemi", xp: 105, icon: "fa-floppy-disk", topic: "Unity C# SceneManager.LoadScene, PlayerPrefs, Application.persistentDataPath ve JsonUtility" }
        ]
      },
      {
        title: "Ünite 14: Unity C# — Oyun Mimarisi & Çok Oyunculu",
        level: "Unity Uzman",
        lessons: [
          { id: "cs_66", title: "State Machine (Durum Makinesi)", desc: "Idle, Run, Jump, Attack ve AI durum mimarisi", xp: 110, icon: "fa-diagram-project", topic: "Unity C# Finite State Machine (FSM), enum ve sınıf tabanlı oyuncu/düşman durum yönetimi" },
          { id: "cs_67", title: "Observer Pattern & C# Events Haberleşmesi", desc: "Spagetti kodsuz UI, ses ve sistem bağlantısı", xp: 110, icon: "fa-bell", topic: "Unity C# Observer tasarım deseni, Action/event ile sahne içi gevşek bağlı haberleşme" },
          { id: "cs_68", title: "Object Pooling (Nesne Havuzu)", desc: "Instantiate/Destroy yükünü ve GC donmalarını bitirme", xp: 115, icon: "fa-recycle", topic: "Unity C# Object Pooling, Queue<GameObject> veya UnityEngine.Pool ile performans optimizasyonu" },
          { id: "cs_69", title: "Performans & Bellek Optimizasyonu", desc: "Update içi allocation önleme, cache ve Profiler", xp: 115, icon: "fa-gauge-high", topic: "Unity C# Garbage Collection önleme, GetComponent önbellekleme, String/LINQ dikkat noktaları" },
          { id: "cs_70", title: "Multiplayer & Ağ Mantığı Temelleri", desc: "Host/Client/Server, NetworkVariable ve RPC mantığı", xp: 125, icon: "fa-crown", topic: "Unity C# Multiplayer temel mimari, Host/Server otoritesi, senkronizasyon, NetworkObject ve RPC kavramları" }
        ]
      }
    ]
  },
  english: {
    title: "İngilizce Yolculuğu (A1'den C1-C2'ye — 12 Ünite / 60 Ders)",
    desc: "Temel cümle kuruluşundan zamanlara, akıcı ileri gramerden yazılımcı ve teknik dokümantasyon İngilizcesine kadar eksiksiz ilerle.",
    units: [
      {
        title: "Ünite 1: A1 Temel Yapı & İletişim",
        level: "A1",
        lessons: [
          {
            id: "en_1", title: "To Be (am / is / are) & Tanışma", desc: "Temel kimlik, durum ve günlük selamlaşma cümleleri", xp: 40, icon: "fa-comments",
            topic: "English verb to be am is are basic introductions, nationalities and daily phrases",
            questions: [
              { type: "fill", prompt: "Boşluğu doğru yardımcı fiille doldur (Ben bir yazılımcıyım):", code: "I ___ a software developer.", answer: "am", explain: "Özne 'I' olduğunda 'to be' fiili şimdiki zamanda 'am' olur." },
              { type: "order", prompt: "'Onlar bugün çok meşgul' cümlesini doğru sıraya diz:", tokens: ["They", "are", "very", "busy", "today"], answer: ["They", "are", "very", "busy", "today"], explain: "İngilizce temel dizilim: Özne + Fiil + Sıfat/Zarf + Zaman." },
              { type: "mcq", prompt: "'Where are you from?' sorusunun doğru Türkçe karşılığı nedir?", options: ["Nerelisin?", "Nereye gidiyorsun?", "Kaç yaşındasın?", "Ne iş yapıyorsun?"], answer: "Nerelisin?", explain: "be from kalıbı bir kişinin memleketini / kökenini sorar." },
              { type: "bug", prompt: "Bu cümledeki gramer hatasını bul:", code: "She are my best friend.", options: ["'are' yerine 'is' olmalı", "'She' yerine 'Her' olmalı", "'friend' çoğul olmalı", "Hata yok"], answer: "'are' yerine 'is' olmalı", explain: "He / She / It özneleriyle 'is' kullanılır." }
            ]
          },
          { id: "en_2", title: "Zamirler & İyelik Sıfatları", desc: "I/me/my, he/him/his, this/that/these/those", xp: 40, icon: "fa-user", topic: "English subject pronouns, object pronouns, possessive adjectives my your his her and demonstratives this that" },
          { id: "en_3", title: "Artikel Kullanımı (a / an / the)", desc: "Belirli, belirsiz ve sıfır artikel kuralları", xp: 45, icon: "fa-font", topic: "English articles a, an, the and zero article rules with clear examples" },
          { id: "en_4", title: "Tekil-Çoğul, There is / There are", desc: "Düzenli/düzensiz çoğullar ve varlık bildirme", xp: 45, icon: "fa-layer-group", topic: "English singular and plural nouns (regular/irregular), there is, there are, have got" },
          { id: "en_5", title: "Temel Soru Kalıpları (Wh- Questions)", desc: "What, Where, When, Why, Who, How much/many", xp: 45, icon: "fa-circle-question", topic: "English Wh- question words What Where When Why Who Which How with to be" }
        ]
      },
      {
        title: "Ünite 2: A1–A2 Günlük Hayat & Şimdiki Zamanlar",
        level: "A1 - A2",
        lessons: [
          {
            id: "en_6", title: "Geniş Zaman (Simple Present)", desc: "Alışkanlıklar, genel doğrular ve -s takısı", xp: 45, icon: "fa-clock",
            topic: "English Simple Present tense affirmative negative habits daily routines and -s/-es suffix",
            questions: [
              { type: "bug", prompt: "Bu cümledeki hata nedir?", code: "He write code every evening.", options: ["'write' yerine 'writes' olmalı", "'every' yerine 'all' olmalı", "'He' yerine 'Him' olmalı", "Hata yok"], answer: "'write' yerine 'writes' olmalı", explain: "Geniş zamanda olumlu cümlede He/She/It özneleri fiile -s takısı alır." },
              { type: "fill", prompt: "Soru cümlesindeki boşluğu doldur:", code: "____ you speak English?", answer: "Do", explain: "I/You/We/They öznelerinde geniş zaman sorusu 'Do' ile başlar." },
              { type: "order", prompt: "'Ben her gün Python öğreniyorum' cümlesini sırala:", tokens: ["I", "study", "Python", "every", "day"], answer: ["I", "study", "Python", "every", "day"], explain: "Özne + Fiil + Nesne + Zaman zarfı sırasıyla kurulur." },
              { type: "mcq", prompt: "'She doesn't like coffee.' cümlesi ne anlama gelir?", options: ["O kahveyi sevmez.", "O kahve içiyor.", "O kahve sever.", "O kahve yapmadı."], answer: "O kahveyi sevmez.", explain: "doesn't + yalın fiil, üçüncü tekil şahısta olumsuz geniş zaman kurar." }
            ]
          },
          { id: "en_7", title: "do / does Soruları & Olumsuzluk", desc: "don't / doesn't ve kısa cevap kalıpları", xp: 50, icon: "fa-sliders", topic: "English Simple Present questions with do/does, negatives don't/doesn't and short answers" },
          { id: "en_8", title: "Sıklık Zarfları & Günlük Rutinler", desc: "always, usually, often, sometimes, rarely, never", xp: 50, icon: "fa-rotate", topic: "English adverbs of frequency always usually often sometimes rarely never and sentence position" },
          { id: "en_9", title: "Şimdiki Zaman (Present Continuous)", desc: "am/is/are + V-ing ve durum fiilleri (stative verbs)", xp: 50, icon: "fa-bolt", topic: "English Present Continuous tense, spelling rules for -ing, and Present Simple vs Present Continuous" },
          { id: "en_10", title: "Yer & Zaman Edatları (in / on / at)", desc: "Tarih, saat, mekan ve yön edatları", xp: 55, icon: "fa-location-dot", topic: "English prepositions of time and place: in, on, at, under, between, next to" }
        ]
      },
      {
        title: "Ünite 3: A2 Geçmiş & Gelecek Zamanlar",
        level: "A2",
        lessons: [
          {
            id: "en_11", title: "Geçmiş Zaman (Past Simple & Fiil 2. Hâli)", desc: "-ed kuralı, was/were ve düzensiz fiiller", xp: 55, icon: "fa-calendar-days",
            topic: "English Past Simple tense was/were, regular -ed verbs and common irregular verbs",
            questions: [
              { type: "mcq", prompt: "'go' fiilinin 2. hâli (Past Simple) hangisidir?", options: ["went", "goed", "gone", "going"], answer: "went", explain: "go düzensiz bir fiildir: go - went - gone." },
              { type: "fill", prompt: "Dün projeyi bitirdim (finish fiilinin geçmiş hâli):", code: "I ________ the project yesterday.", answer: "finished", explain: "finish düzenli bir fiildir, geçmiş zamanda -ed takısı alır." },
              { type: "order", prompt: "'Yarın yeni bir oyun yapacağız' cümlesini sırala:", tokens: ["We", "will", "build", "a", "new", "game", "tomorrow"], answer: ["We", "will", "build", "a", "new", "game", "tomorrow"], explain: "Gelecek zaman için özne + will + yalın fiil kullanılır." },
              { type: "bug", prompt: "Hata nerede?", code: "Did you went to the library?", options: ["'went' yerine 'go' olmalı", "'Did' yerine 'Do' olmalı", "'to' silinmeli", "Hata yok"], answer: "'went' yerine 'go' olmalı", explain: "Did yardımcı fiili kullanıldığında ana fiil daima 1. (yalın) hâlinde kalır." }
            ]
          },
          { id: "en_12", title: "did ile Soru, Olumsuz & Düzensiz Fiiller", desc: "didn't + V1 kuralı ve sık kullanılan irregular verbs", xp: 55, icon: "fa-code-branch", topic: "English Past Simple negative didn't, questions with did, and high-frequency irregular verbs" },
          { id: "en_13", title: "Geçmişte Süreklilik (Past Continuous)", desc: "was/were + V-ing, when ve while bağlantısı", xp: 60, icon: "fa-hourglass-half", topic: "English Past Continuous tense with when and while interrupted actions" },
          { id: "en_14", title: "Gelecek Zaman (will vs be going to)", desc: "Anlık kararlar, tahminler ve önceden planlı işler", xp: 60, icon: "fa-rocket", topic: "English future forms: will vs be going to vs Present Continuous for future arrangements" },
          { id: "en_15", title: "Eski Alışkanlıklar (used to / would)", desc: "Eskiden yapılan ama artık bırakılan durumlar", xp: 60, icon: "fa-backward", topic: "English used to, didn't use to, be used to and get used to differences" }
        ]
      },
      {
        title: "Ünite 4: B1 Köprü Zamanlar (Perfect Tenses)",
        level: "B1",
        lessons: [
          { id: "en_16", title: "Present Perfect (have / has + V3)", desc: "Geçmişten bugüne etkisi süren deneyimler", xp: 65, icon: "fa-check-double", topic: "English Present Perfect tense structure have/has + past participle (V3) and life experiences" },
          { id: "en_17", title: "since, for, already, yet, just & ever", desc: "Present Perfect zaman belirteçleri", xp: 65, icon: "fa-link", topic: "English Present Perfect time expressions: since, for, already, yet, just, ever, never" },
          { id: "en_18", title: "Present Perfect vs Past Simple", desc: "Belirsiz geçmiş ile belirli geçmiş arasındaki net fark", xp: 70, icon: "fa-scale-balanced", topic: "English contrast between Present Perfect and Past Simple with specific vs unfinished time" },
          { id: "en_19", title: "Present Perfect Continuous", desc: "have/has been + V-ing ile süregelen eylemler", xp: 70, icon: "fa-repeat", topic: "English Present Perfect Continuous tense: duration focus vs result focus" },
          { id: "en_20", title: "Past Perfect (had + V3)", desc: "Geçmişin geçmişi: iki geçmiş olayın sırası", xp: 75, icon: "fa-timeline", topic: "English Past Perfect tense had + V3 with before, after, by the time" }
        ]
      },
      {
        title: "Ünite 5: B1 Kipler, Karşılaştırmalar & Fiilimsiler",
        level: "B1",
        lessons: [
          { id: "en_21", title: "Yetenek, İzin & Olasılık (can/could/may/might)", desc: "Kibar rica, yetenek ve ihtimal ifade etme", xp: 65, icon: "fa-key", topic: "English modal verbs of ability, permission and possibility: can, could, be able to, may, might" },
          { id: "en_22", title: "Zorunluluk & Tavsiye (must/have to/should)", desc: "mustn't vs don't have to farkı ve öneriler", xp: 70, icon: "fa-shield-halved", topic: "English modals of obligation and advice: must, have to, mustn't, don't have to, should, ought to" },
          { id: "en_23", title: "Sıfat & Zarf Karşılaştırmaları", desc: "-er / more, the -est / most ve as...as kalıbı", xp: 70, icon: "fa-chart-simple", topic: "English comparatives, superlatives, irregular adjectives (good/better/best) and as...as" },
          { id: "en_24", title: "Gerund (V-ing) vs Infinitive (to + V1)", desc: "enjoy doing vs decide to do, anlam değişen fiiller", xp: 75, icon: "fa-cubes", topic: "English Gerunds vs Infinitives after verbs (stop, remember, try, enjoy, decide, want)" },
          { id: "en_25", title: "Miktar Belirleyiciler (Quantifiers)", desc: "much, many, a lot of, few, a few, little, enough, too", xp: 75, icon: "fa-filter", topic: "English countable and uncountable quantifiers: some, any, much, many, few, a few, little, a little, too, enough" }
        ]
      },
      {
        title: "Ünite 6: B1–B2 Koşullar & Edilgen Çatı",
        level: "B1 - B2",
        lessons: [
          { id: "en_26", title: "Koşul Cümleleri: Type 0 & Type 1", desc: "Gerçek durumlar, genel kurallar ve gelecek ihtimali", xp: 75, icon: "fa-code-fork", topic: "English Conditionals Zero Conditional and First Conditional with if and unless" },
          { id: "en_27", title: "Hayali Koşullar: Type 2", desc: "If I were you... ile şimdiki gerçek dışı varsayımlar", xp: 75, icon: "fa-sitemap", topic: "English Second Conditional (If + Past Simple, would + V1) and hypothetical situations" },
          { id: "en_28", title: "Geçmiş Pişmanlıklar: Type 3 & Mixed", desc: "If + had V3, would have V3 ve karma koşullar", xp: 80, icon: "fa-diagram-project", topic: "English Third Conditional and Mixed Conditionals for past regrets and present results" },
          { id: "en_29", title: "Edilgen Çatı (Passive Voice)", desc: "Tüm zamanlarda ve modallarda be + V3 kurulumu", xp: 80, icon: "fa-shuffle", topic: "English Passive Voice across Present, Past, Future, Perfect tenses and modal verbs" },
          { id: "en_30", title: "Ettirgen Çatı (Causatives)", desc: "have/get something done, make ve let yapıları", xp: 85, icon: "fa-wrench", topic: "English Causative structures: have/get something done, make someone do, let someone do" }
        ]
      },
      {
        title: "Ünite 7: B2 Bağlaçlar & Yan Cümleler",
        level: "B2",
        lessons: [
          { id: "en_31", title: "Relative Clauses (who / which / that / whose)", desc: "Tanımlayıcı (defining) ve ek bilgi veren yan cümleler", xp: 80, icon: "fa-puzzle-piece", topic: "English Defining and Non-defining Relative Clauses: who, which, that, whose, where, when" },
          { id: "en_32", title: "İsim Cümlecikleri (Noun Clauses)", desc: "that, what, whether/if ile cümle içinde cümle kurma", xp: 80, icon: "fa-book-open", topic: "English Noun Clauses starting with that, what, whether, if and embedded questions" },
          { id: "en_33", title: "Zıtlık Bağlaçları (although / despite / however)", desc: "Cümle alan ve isim alan bağlaçların kritik farkı", xp: 85, icon: "fa-arrows-left-right", topic: "English contrast linkers: although, even though, though, despite, in spite of, however, whereas" },
          { id: "en_34", title: "Sebep, Sonuç & Amaç Bağlaçları", desc: "because vs because of, so/such...that, in order to", xp: 85, icon: "fa-compass", topic: "English linkers of cause, result and purpose: because, due to, therefore, so that, in order to" },
          { id: "en_35", title: "Zaman & Koşul Bağlaçları", desc: "as soon as, until, provided that, in case, unless", xp: 85, icon: "fa-stopwatch", topic: "English advanced time and condition linkers: as soon as, by the time, until, unless, in case, provided that" }
        ]
      },
      {
        title: "Ünite 8: B2 Aktarım & İleri Zaman Yapıları",
        level: "B2",
        lessons: [
          { id: "en_36", title: "Dolaylı Anlatım (Reported Speech)", desc: "Zaman kayması (backshift), say vs tell, soru aktarımı", xp: 85, icon: "fa-quote-left", topic: "English Reported Speech statements, questions, commands, tense backshift and reporting verbs" },
          { id: "en_37", title: "Future Continuous & Future Perfect", desc: "will be V-ing ve will have V3 ile gelecek projeksiyonu", xp: 85, icon: "fa-forward", topic: "English Future Continuous and Future Perfect tenses with by next year / this time tomorrow" },
          { id: "en_38", title: "Dilek & Pişmanlık (wish / if only)", desc: "Şimdiki, geçmiş ve şikayet dilek yapıları", xp: 90, icon: "fa-star", topic: "English wish and if only clauses with Past Simple, Past Perfect and would" },
          { id: "en_39", title: "Tercih & Uyarı (would rather / had better)", desc: "It's high time, would rather ve had better kalıpları", xp: 90, icon: "fa-hand", topic: "English would rather, prefer, had better and it's time structures" },
          { id: "en_40", title: "Soru Kuyrukları & Geçmiş Modallar", desc: "Question tags, must have V3, can't have V3, should have V3", xp: 90, icon: "fa-question", topic: "English Question Tags and Past Modals of deduction and regret (must have, might have, should have)" }
        ]
      },
      {
        title: "Ünite 9: B2–C1 Phrasal Verbs & Doğal Kalıplar",
        level: "B2 - C1",
        lessons: [
          { id: "en_41", title: "Günlük Hayat Phrasal Verbs", desc: "figure out, give up, turn out, get along, run out of", xp: 90, icon: "fa-fire", topic: "English essential daily phrasal verbs: figure out, give up, look forward to, run out of, put off, turn out" },
          { id: "en_42", title: "İş & Teknoloji Phrasal Verbs", desc: "set up, break down, carry out, roll out, back up", xp: 90, icon: "fa-microchip", topic: "English work and technology phrasal verbs: set up, back up, break down, carry out, log in, scale up" },
          { id: "en_43", title: "Doğal Eşdizimler (Collocations)", desc: "make vs do, heavy rain, take responsibility, strong coffee", xp: 95, icon: "fa-handshake", topic: "English common collocations: make vs do, take vs have, strong/heavy/deep adjective-noun pairings" },
          { id: "en_44", title: "En Çok Karıştırılan Kelimeler", desc: "affect/effect, borrow/lend, sensible/sensitive, raise/rise", xp: 95, icon: "fa-triangle-exclamation", topic: "English commonly confused words: affect/effect, borrow/lend, say/tell, rise/raise, sensible/sensitive" },
          { id: "en_45", title: "Edat Kalıpları (Prepositional Phrases)", desc: "interested in, responsible for, on purpose, in charge of", xp: 95, icon: "fa-tags", topic: "English verb/adjective + preposition combinations and fixed prepositional phrases" }
        ]
      },
      {
        title: "Ünite 10: C1 İleri Gramer & Akıcılık",
        level: "C1",
        lessons: [
          { id: "en_46", title: "Devrik Vurgu (Inversion)", desc: "Never have I..., Not only did..., Seldom do...", xp: 95, icon: "fa-wand-magic-sparkles", topic: "English C1 Negative Inversion: Never have I, Not only... but also, Hardly had... when, Little did" },
          { id: "en_47", title: "Vurgu Cümleleri (Cleft Sentences)", desc: "It is ... that ve What I need is ... kalıpları", xp: 95, icon: "fa-highlighter", topic: "English C1 Cleft sentences (It-clefts and What-clefts) for emphasis and clarity" },
          { id: "en_48", title: "Ortaç Yan Cümleleri (Participle Clauses)", desc: "V-ing, V3 ve Having + V3 ile kısa akıcı cümleler", xp: 100, icon: "fa-scissors", topic: "English C1 Participle Clauses (present, past and perfect participles) for concise writing" },
          { id: "en_49", title: "Subjunctive & Resmi Yapılar", desc: "suggest that he be..., Were I to..., Had they known...", xp: 100, icon: "fa-landmark", topic: "English C1 Subjunctive mood and inverted conditionals (Should you need, Were I to, Had we known)" },
          { id: "en_50", title: "Bağlamdan Anlam & Kelime Türetme", desc: "Ön ekler (un-/dis-/mis-), son ekler (-tion/-able) ve tahmin", xp: 100, icon: "fa-magnifying-glass", topic: "English C1 word formation (prefixes, suffixes) and deducing vocabulary meaning from context" }
        ]
      },
      {
        title: "Ünite 11: C1 Deyimler, Nüanslar & Akademik İfade",
        level: "C1",
        lessons: [
          { id: "en_51", title: "Sık Kullanılan İngilizce Deyimler (Idioms)", desc: "cut corners, on the same page, bite the bullet", xp: 100, icon: "fa-lightbulb", topic: "English C1 common idioms in conversation and workplace: cut corners, under the weather, piece of cake, on the same page" },
          { id: "en_52", title: "Resmi (Formal) vs Günlük (Informal) Dil", desc: "E-posta, iş yazışması ve samimi konuşma tonu farkı", xp: 100, icon: "fa-feather", topic: "English register differences: formal vs informal vocabulary, contractions and polite requests" },
          { id: "en_53", title: "Akademik Paragraf & Geçiş İfadeleri", desc: "Furthermore, Nevertheless, Consequently, In contrast", xp: 105, icon: "fa-align-left", topic: "English C1 discourse markers and academic transitions: furthermore, nevertheless, consequently, albeit" },
          { id: "en_54", title: "İkna, Tartışma & Fikir Savunma", desc: "Katılma, nazikçe itiraz etme ve argüman güçlendirme", xp: 105, icon: "fa-bullhorn", topic: "English C1 debating, agreeing, disagreeing politely, hedging and expressing nuanced opinions" },
          { id: "en_55", title: "İleri Okuma Anlama & Çıkarım (Inference)", desc: "Satır arası anlam, yazarın tonu ve ana fikir bulma", xp: 105, icon: "fa-glasses", topic: "English C1 reading comprehension strategies: inference, tone detection, paraphrasing and main idea" }
        ]
      },
      {
        title: "Ünite 12: C1–C2 Yazılımcı & Teknik İngilizce",
        level: "C1 - C2 Tech",
        lessons: [
          { id: "en_56", title: "Resmi Dokümantasyon Okuma", desc: "Deprecated, mutable, synchronous, overhead, syntax terimleri", xp: 110, icon: "fa-file-code", topic: "Technical English for reading official software docs: deprecated, mutable, immutable, parameters, return value, edge case" },
          { id: "en_57", title: "Derleyici & Hata Mesajlarını Anlama", desc: "NullReference, Uncaught, Timeout, Mismatch, Stack trace", xp: 110, icon: "fa-bug", topic: "Technical English for debugging compiler and runtime error messages in Python, C# and web APIs" },
          { id: "en_58", title: "Temiz Kod Yorumu & İsimlendirme", desc: "İngilizce değişken, fonksiyon, boolean ve docstring adlandırma", xp: 115, icon: "fa-code", topic: "Technical English best practices for naming variables, boolean flags (is/has/can), functions and clear code comments" },
          { id: "en_59", title: "Açık Kaynak, Issue & PR İletişimi", desc: "Reproduce steps, expected behavior, commit mesajı ve review", xp: 115, icon: "fa-code-pull-request", topic: "Technical English for software collaboration: writing clear bug reports, commit messages, pull requests and code reviews" },
          { id: "en_60", title: "Yazılım Mülakatı & Teknik Sunum (C2)", desc: "Mimari anlatma, trade-off savunma ve proje sunumu", xp: 125, icon: "fa-crown", topic: "C1-C2 Technical interview English: explaining architecture decisions, performance trade-offs and problem-solving steps" }
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
    { key: "csharp", label: "C# & Unity Akademisi", icon: "fa-solid fa-code", fill: "cs-fill" },
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