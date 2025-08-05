using SosyalAliskanlikApp.Configurations;
using SosyalAliskanlikApp.Modules.Auth.Web.Controllers;

var builder = WebApplication.CreateBuilder(args);

// ------------------- SERVİS KAYITLARI -------------------

// Merkezi servislerimizi kaydediyoruz.
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddAuthModule();

// Sadece Controller'ları ve Auth modülünün assembly'sini tanıtıyoruz.
builder.Services.AddControllers()
    .AddApplicationPart(typeof(AuthController).Assembly);

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ------------------- UYGULAMA PİPELINE'I -------------------

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();