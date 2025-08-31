
# Sosyal Alışkanlık Takipçisi

Sosyal Alışkanlık Takipçisi, kullanıcıların günlük alışkanlıklar belirleyip takip edebildiği, arkadaş ekleyerek birbirlerini motive edebildiği, oyunlaştırma (gamification) ve yapay zeka destekli önerilerle zenginleştirilmiş modern bir web uygulamasıdır. Proje, ASP.NET 8 ve Next.js 14 kullanılarak, Clean Architecture prensipleriyle modüler bir yapıda geliştirilmiş ve Docker ile tamamen konteynerize edilmiştir.

---

### ✨ Temel Özellikler

*   **Kullanıcı Yönetimi:** Güvenli kayıt olma, JWT tabanlı giriş yapma ve e-posta onayı.
*   **Alışkanlık Yönetimi:**
    *   Tam CRUD işlevselliği (Oluşturma, Okuma, Güncelleme, Silme).
    *   Alışkanlıkları geçici olarak gizlemek için **Arşivleme** özelliği.
    *   Günlük olarak "tamamlandı" işaretleme ve ilerleme takibi.
*   **Sosyal Etkileşim:**
    *   Kullanıcı arama, arkadaşlık isteği gönderme/kabul/reddetme ve arkadaş listesi.
    *   **Canlı Aktivite Akışı:** Ana sayfada, arkadaşlarınızın ve sizin tamamladığınız alışkanlıkları ve kazandığınız rozetleri anlık olarak gösteren bir akış.
*   **Oyunlaştırma (Gamification):**
    *   **Rozet Sistemi:** "İlk Adım", "İstikrar Abidesi (7 Gün)", "Acemi Takipçi (Toplam 10 Tamamlama)" gibi başarıların kilidini açma.
    *   **Geriye Dönük Kontrol:** Sisteme yeni eklenen veya hak edilen ama alınmamış rozetlerin, kullanıcı giriş yaptığında otomatik olarak verilmesi.
*   **Yapay Zeka Entegrasyonu:**
    *   **AI Destekli Öneri Sistemi:** Kullanıcılar bir hedef belirlediğinde (**Google Gemini API** entegrasyonu ile), bu hedefe uygun, kişiselleştirilmiş alışkanlık önerileri alma.
    *   **Toplu Ekleme:** Yapay zekanın sunduğu önerilerden birden fazlasını seçip tek seferde listeye ekleyebilme.
*   **İstatistikler ve Raporlama:** Kişisel ilerlemeyi gösteren detaylı istatistikler ve görsel grafikler.
*   **Modern ve Duyarlı Arayüz:** Material-UI (MUI) ile geliştirilmiş, tüm ekran boyutlarına (mobil, tablet, masaüstü) uyumlu, temiz ve sezgisel bir kullanıcı arayüzü.

---

### 🚀 Kullanılan Teknolojiler

*   **Backend:** .NET 8, ASP.NET Core Web API, Entity Framework Core, PostgreSQL
*   **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Material-UI (MUI)
*   **Yapay Zeka:** Google Gemini API
*   **Veritabanı:** PostgreSQL
*   **Containerization:** Docker, Docker Compose
*   **Kimlik Doğrulama:** JWT (JSON Web Token)
*   **Form Yönetimi:** React Hook Form & Zod

---

### 💻 Kurulum ve Çalıştırma (Docker ile)

Bu proje, tüm altyapı servisleri (`PostgreSQL`, `Redis`*) ve uygulama katmanları (`backend`, `frontend`) ile birlikte tek bir komutla çalıştırılmak üzere tasarlanmıştır.

#### Ön Koşul
*   **Docker Desktop**'ın bilgisayarınızda kurulu olması gerekmektedir. Başka hiçbir şeye (.NET, Node.js, PostgreSQL vb.) ihtiyacınız yoktur.

#### Kurulum Adımları

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/SemihDemir13/SosyalAliskanlik.git
    cd SosyalAliskanlik
    ```

2.  **`.env` Dosyasını Oluşturun:**
    Projenin ana dizininde `.env` adında yeni bir dosya oluşturun. Bu dosya, Docker servisleri için gerekli olan gizli bilgileri içerecektir. Aşağıdaki şablonu kopyalayın ve `...` ile belirtilen yerleri kendi güvenli değerlerinizle doldurun.

    ```env
    # .env dosyası içeriği
    
    # Docker'da oluşturulacak PostgreSQL veritabanı için bir şifre belirleyin
    POSTGRES_PASSWORD=gucluBirSifre123
    
    # JWT token'ları için en az 32 karakterlik rastgele bir anahtar belirleyin
    JWT_SECRET=CokGuvenliVeTahminEdilemezUzunBirAnahtar_32KarakterdenFazlaOlmali
    ```

3.  **Uygulamayı Başlatın:**
    Projenin ana dizininde bir terminal açın ve aşağıdaki komutu çalıştırın:
    ```bash
    docker-compose up --build
    ```
    Bu komut, tüm servislerin imajlarını oluşturacak ve container'ları başlatacaktır. İlk çalıştırmada bu işlem birkaç dakika sürebilir.

4.  **Veritabanını Hazırlayın (Migration):**
    Uygulama logları stabil hale geldikten sonra, **yeni bir terminal** açın ve veritabanı tablolarını oluşturmak ve başlangıç verilerini (rozetler vb.) eklemek için aşağıdaki komutu çalıştırın:
    ```bash
    docker-compose run --rm backend-ef
    ```
    *(Not: `docker-compose.override.yml` dosyası, `backend-ef` servisini `database update` komutuyla çalışacak şekilde yapılandırılmıştır.)*

#### Uygulamaya Erişim

Kurulum tamamlandıktan sonra:
*   **Frontend Arayüzü:** Tarayıcınızda **`http://localhost:3000`** adresine gidin.
*   **Backend API Dokümantasyonu (Swagger):** Tarayıcınızda **`http://localhost:5282/swagger`** adresine gidin.

#### Uygulamayı Durdurma

Uygulamayı durdurmak için, `docker-compose up` komutunu çalıştırdığınız terminale dönüp `Ctrl + C` tuşlarına basın. Tüm container'ları ve ağları temizlemek için `docker-compose down` komutunu kullanabilirsiniz.

---
*\*Not: Projenin altyapısı, gelecekte SignalR ile gerçek zamanlı bildirimler eklemek için Redis'i destekleyecek şekilde tasarlanmıştır.*