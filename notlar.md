 
# projeyi modules klasörün içinde ekleme :
 
-  dotnet new classlib -o src/Modules/Activity/Activity.Web
* web'i oluşturduktan sonra controller olacağından  **microsoftaspnetcore** gibi yapılar eklenmeli

# projeri ana solution'a tanıtmalıyız: 

- dotnet sln add src/Modules/Activity/Activity.Web/Activity.Web.csproj



+---------------------------------------------------------------------------------+
|                                                                                 |
|                      [ Main.API.csproj (Uygulamanın Giriş Noktası) ]              |
|                                      |                                          |
+--------------------------------------|------------------------------------------+
                                       |
                                       v (Proje Referansı)
+---------------------------------------------------------------------------------+
|                                                                                 |
|               [ Configurations.csproj (Tüm Servisleri Kaydeder) ]               |
|                                      |                                          |
+--------------------------------------|------------------------------------------+
                                       |
                                       |--> [ ...Application.csproj ] (Modüllerin içine)
                                       |
+---------------------------------------------------------------------------------+
|                                                                                 |
|                   [ Persistence.csproj (ApplicationDbContext) ]                 |
|                                      |                                          |
+--------------------------------------|------------------------------------------+
                                       |
                                       '--> [ ...Domain.csproj ] (Modüllerin içine)
                                       
+---------------------------------------------------------------------------------+
|   MODÜLLER (Her Biri Kendi İçinde Bağımsız Bir İş Alanı)                         |
|                                                                                 |
|   +---------------------------+   +---------------------------+   +-----------+ |
|   |        AUTH MODÜLÜ        |   |        HABIT MODÜLÜ        |   |  ACTIVITY | |
|   |---------------------------|   |---------------------------|   |   MODÜLÜ  | |
|   |                           |   |                           |   |           | |
|   | [ Auth.Web.csproj ]       |<--| [ Habit.Web.csproj ]      |<--|   ...     | | Main.API
|   |      (Controllers)        |   |      (Controllers)        |   |           | |
|   |            |              |   |            |              |   |           | |
|   |            v              |   |            v              |   |           | |
|   | [ Auth.Application.csproj ] |<--| [ Habit.Application.csproj ]|   |           | | Configurations
|   |      (İş Mantığı)         |   |      (İş Mantığı)         |   |           | |
|   |            |              |   |            |              |   |           | |
|   |            v              |   |            v              |   |           | |
|   | [ Auth.Domain.csproj ]    |<--| [ Habit.Domain.csproj ]   |<--------------| | Persistence
|   |        (Entities)         |   |        (Entities)         |   |           | |
|   |                           |   |                           |   |           | |
|   +---------------------------+   +---------------------------+   +-----------+ |
|                                                                                 |
+---------------------------------------------------------------------------------+
                                       ^
                                       | (Tüm projeler ona bağımlı olabilir)
+--------------------------------------|------------------------------------------+
|                                                                                 |
|                 [ Shared.csproj (BaseEntity, Result Sınıfı) ]                   |
|                                                                                 |
+---------------------------------------------------------------------------------+

