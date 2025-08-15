# Sosyal Alışkanlık Takipçisi

Sosyal Alışkanlık Takipçisi, kullanıcıların günlük alışkanlıklar belirleyip takip edebildiği, arkadaş ekleyerek birbirlerini motive edebildiği modern bir web uygulamasıdır. Bu proje, Clean Architecture prensipleriyle modüler bir yapıda geliştirilmiştir.

---

### ✨ Temel Özellikler

*   **Kullanıcı Yönetimi:** Güvenli kayıt olma, JWT tabanlı giriş yapma ve profil (şifre) güncelleme.
*   **Alışkanlık Yönetimi:** Yeni alışkanlıklar oluşturma, mevcut olanları listeleme, güncelleme ve silme (CRUD).
*   **Günlük Takip:** Alışkanlıkları her gün için "tamamlandı" olarak işaretleme ve işareti kaldırma.
*   **Sosyal Etkileşim:**
    *   Kullanıcıları arama ve bulma.
    *   Arkadaşlık isteği gönderme, kabul etme ve reddetme.
    *   Mevcut arkadaşları listeleme ve arkadaşlıktan çıkarma.
    *   Arkadaşların alışkanlık özetlerini (gizliliği koruyarak) görüntüleme.
*   **İstatistikler ve Görselleştirme:** Toplam alışkanlık, tamamlama sayısı gibi temel istatistikleri ve bu verileri gösteren grafikleri içeren kişisel bir panel.
*   **Duyarlı ve Modern Arayüz:** Kullanıcının işletim sistemi temasına (Koyu/Açık Mod) otomatik olarak uyum sağlayan, Material-UI ile geliştirilmiş bir arayüz.

---

### 🚀 Kullanılan Teknolojiler

#### Backend
*   **.NET 8** & **ASP.NET Core Web API**
*   **Clean Architecture** & Modüler Monolit Yapısı
*   **Entity Framework Core 8**
*   **PostgreSQL** Veritabanı
*   **JWT (JSON Web Token)** ile Kimlik Doğrulama

#### Frontend
*   **Next.js 14** (App Router)
*   **TypeScript**
*   **Material-UI (MUI)** Component Kütüphanesi
*   **React Hook Form** & **Zod** ile Form Yönetimi ve Doğrulama
*   **Chart.js** ile Veri Görselleştirme
*   **Axios** ile API İletişimi

---

### 💻 Kurulum ve Çalıştırma (Geliştirme Ortamı)

#### Ön Koşullar
*   [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
*   [Node.js](https://nodejs.org/en/) (LTS sürümü önerilir)
*   [PostgreSQL](https://www.postgresql.org/download/)

#### Backend Kurulumu
1.  Projeyi klonlayın: `git clone <repo_url>`
2.  Proje ana dizinine gidin: `cd SosyalAliskanlik`
3.  **User Secrets** yapılandırmasını yapın. Bu, veritabanı şifresi gibi gizli bilgileri güvenli bir şekilde saklamak içindir.
    ```bash
    # User secrets'ı başlat
    dotnet user-secrets init --project src/Main.API/Main.API.csproj

    # Veritabanı bağlantı dizenizi ekleyin (şifrenizi güncelleyin)
    dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=HabitTrackerDb;Username=postgres;Password=YOUR_POSTGRES_PASSWORD" --project src/Main.API/Main.API.csproj
    
    # JWT anahtarınızı ekleyin (kendi gizli anahtarınızı oluşturun)
    dotnet user-secrets set "JwtSettings:Secret" "YOUR_OWN_SUPER_SECRET_KEY_LONGER_THAN_32_CHARS" --project src/Main.API/Main.API.csproj
    ```
4.  Bağımlılıkları yükleyin:
    ```bash
    dotnet restore
    ```
5.  Veritabanını oluşturun ve migration'ları uygulayın:
    ```bash
    cd src/Persistence
    dotnet ef database update --startup-project ../Main.API/Main.API.csproj
    cd ../..
    ```
6.  Backend'i çalıştırın:
    ```bash
    dotnet run --project src/Main.API/Main.API.csproj
    ```
    API artık `http://localhost:5282` ve `https://localhost:7101` adreslerinde çalışıyor olmalı.

#### Frontend Kurulumu
1.  Yeni bir terminal açın ve `client` klasörüne gidin: `cd client`
2.  `.env.local` adında bir dosya oluşturun ve içine API adresini yazın:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:5282
    ```
3.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
4.  Frontend'i çalıştırın:
    ```bash
    npm run dev
    ```
    Uygulamaya tarayıcınızdan `http://localhost:3000` adresi üzerinden erişebilirsiniz.

---