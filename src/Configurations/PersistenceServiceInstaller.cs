using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SosyalAliskanlikApp.Persistence; // DbContext'in olduğu namespace

namespace SosyalAliskanlikApp.Configurations;
public static class PersistenceServiceInstaller
{
    public static IServiceCollection AddPersistence(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString,
                // Bu satır EF Core'a diyor ki: "Migration dosyalarını ApplicationDbContext'in olduğu projede ara."
                o => o.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.GetName().Name)));

        return services;
    }
}