# Sosyal Alışkanlık Takipçisi

Sosyal Alışkanlık Takipçisi, kullanıcıların günlük alışkanlıklar belirleyip takip edebildiği, arkadaş ekleyerek birbirlerini motive edebildiği modern bir web uygulamasıdır. Proje, ASP.NET 8 ve Next.js 14 kullanılarak, Clean Architecture prensipleriyle modüler bir yapıda geliştirilmiş ve Docker ile tamamen konteynerize edilmiştir.

---

### ✨ Temel Özellikler

*   **Kullanıcı Yönetimi:** Güvenli kayıt olma, JWT tabanlı giriş yapma ve profil (şifre) güncelleme.
*   **Alışkanlık Yönetimi:** Tam CRUD işlevselliği (Oluşturma, Okuma, Güncelleme, Silme).
*   **Günlük Takip:** Alışkanlıkları her gün için "tamamlandı" olarak işaretleme ve kalıcı takvim (heatmap) görünümü.
*   **Sosyal Etkileşim:** Kullanıcı arama (minimum 3 harf girilmeli), arkadaşlık isteği gönderme/kabul/reddetme, arkadaş listeleme/çıkarma ve arkadaşların ilerleme özetlerini görüntüleme.
*   **İstatistikler:** Kişisel başarıyı özetleyen kartlar ve görsel grafikler içeren bir panel.
*   **Duyarlı ve Modern Arayüz:** Kullanıcının işletim sistemi temasına (Koyu/Açık Mod) otomatik uyum sağlayan, Material-UI ile geliştirilmiş arayüz.

---

### 🚀 Kullanılan Teknolojiler

*   **Backend:** .NET 8, ASP.NET Core Web API, Entity Framework Core, PostgreSQL
*   **Frontend:** Next.js 14 (App Router), TypeScript, Material-UI (MUI)
*   **Containerization:** Docker, Docker Compose
*   **Kimlik Doğrulama:** JWT (JSON Web Token)
*   **Form Yönetimi:** React Hook Form & Zod
*   **Veri Görselleştirme:** Chart.js

---

### 💻 Kurulum ve Çalıştırma (Docker ile)

Bu projem, tüm servisleri (veritabanı, backend, frontend) ile birlikte tek bir komutla çalıştırılmak üzere tasarlanmıştır.

#### Ön Koşul
*   Docker Desktop'Un bilgisayarınızda kurulu olması gerekmektedir. Başka hiçbir şeye (.NET, Node.js, PostgreSQL vb.) ihtiyacınız yoktur.

#### Kurulum Adımları

1.  **Projeyi Klonlayın:**
    ```bash
    git clone <repo_url>
    cd SosyalAliskanlik
    ```

2.  **`.env` Dosyasını Oluşturun:**
    Projenin ana dizininde `.env` adında yeni bir dosya oluşturun. Bu dosya, Docker servisleri için gerekli olan gizli bilgileri içerecektir. Aşağıdaki şablonu kopyalayın ve `...` ile belirtilen yerleri kendi güvenli değerlerinizle doldurun.

    ```env
    # .env dosyası içeriği
    
    # Docker'da oluşturulacak PostgreSQL veritabanı için bir şifre belirleyin
    POSTGRES_PASSWORD=gucluBirSifre123
    
    # JWT token'ları için en az 32 karakterlik rastgele bir anahtar belirleyin
    JWT_SECRET=GuvenliVeUzunOlmali
    ```

3.  **Uygulamayı Başlatın:**
    Projenin ana dizininde bir terminal açın ve aşağıdaki komutu çalıştırın:
    ```bash
    docker-compose up --build
    ```
    *Bu komut, bilgisayarınıza göre değişkenlik göstererekten biraz uzun sürebilir.*

4.  **Veritabanını Hazırlayın:**
    Uygulama logları stabil hale geldikten sonra, **yeni bir terminal** açın ve veritabanı tablolarını oluşturmak için aşağıdaki komutu çalıştırın:
    ```bash
    docker-compose run --rm backend-ef database update
    ```

#### Uygulamaya Erişim

Kurulum tamamlandıktan sonra:
*   **Frontend Arayüzü:** Tarayıcınızda **`http://localhost:3000`** adresine gidin.
*   **Backend API Dokümantasyonu (Swagger):** Tarayıcınızda **`http://localhost:5282/swagger`** adresine gidin.

#### Uygulamayı Durdurma

Uygulamayı durdurmak için, `docker-compose up` komutunu çalıştırdığınız terminale dönüp `Ctrl + C` tuşlarına basın.

