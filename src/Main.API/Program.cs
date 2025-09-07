using SosyalAliskanlikApp.Configurations;
using SosyalAliskanlikApp.Modules.Auth.Web.Controllers;
using SosyalAliskanlikApp.Modules.Habit.Web.Controllers;
using SosyalAliskanlikApp.Modules.Statistics.Web.Controllers;
using SosyalAliskanlikApp.Modules.Friends.Web.Controllers;
using SosyalAliskanlikApp.Modules.Activity.Web.Controllers;
using SosyalAliskanlikApp.Modules.Badge.Web.Controllers;
using SosyalAliskanlikApp.Modules.AI.Web.Controllers;
using SosyalAliskanlikApp.Modules.Messaging.Web.Controllers;
using SosyalAliskanlikApp.Modules.Notification.Web.Hubs;
using StackExchange.Redis;


var builder = WebApplication.CreateBuilder(args);

//cors
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:3000") 
                                .AllowAnyHeader()
                                .AllowAnyMethod()
                                .AllowCredentials(); 
                      });
});

// ------------------- SERVİS KAYITLARI -------------------

builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddAuthModule(builder.Configuration);
builder.Services.AddHabitModule();
builder.Services.AddStatisticsModule();
builder.Services.AddFriendsModule();
builder.Services.AddActivityModule();
builder.Services.AddBadgeModule();
builder.Services.AddAIModule();
builder.Services.AddNotificationModule();
builder.Services.AddMessagingModule();

builder.Services.AddSignalR()
    .AddStackExchangeRedis(builder.Configuration.GetConnectionString("Redis")!, options =>
    {
        options.Configuration.ChannelPrefix = RedisChannel.Literal("SosyalAliskanlikApp");
    });


builder.Services.AddControllers()
    .AddApplicationPart(typeof(AuthController).Assembly)
    .AddApplicationPart(typeof(HabitController).Assembly)
    .AddApplicationPart(typeof(StatisticsController).Assembly)
    .AddApplicationPart(typeof(FriendsController).Assembly)
    .AddApplicationPart(typeof(ActivityController).Assembly)
    .AddApplicationPart(typeof(BadgesController).Assembly)
    .AddApplicationPart(typeof(AIController).Assembly)
    .AddApplicationPart(typeof(MessagingController).Assembly);

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\""
    });
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
app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();


app.MapHub<ActivityHub>("/hubs/activity");

app.Run();