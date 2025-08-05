using SosyalAliskanlikApp.Configurations;
using SosyalAliskanlikApp.Modules.Auth.Web.Controllers;

var builder = WebApplication.CreateBuilder(args);

// ------------------- SERVİS KAYITLARI -------------------

// Merkezi servislerimizi kaydediyoruz.
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddAuthModule(builder.Configuration);

// Sadece Controller'ları ve Auth modülünün assembly'sini tanıtıyoruz.
builder.Services.AddControllers()
    .AddApplicationPart(typeof(AuthController).Assembly);


builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Swagger'ın JWT'yi tanıması için bir güvenlik tanımı ekliyoruz.
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\""
    });

    // Bu güvenlik tanımını tüm endpoint'lere uygulayabilmek için bir gereksinim ekliyoruz.
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// ------------------- UYGULAMA PİPELINE'I -------------------

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();

app.Run();