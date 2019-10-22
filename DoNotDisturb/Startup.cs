using DoNotDisturb.Configurations;
using DoNotDisturb.Notifications;
using DoNotDisturb.Preloaders;
using DoNotDisturb.Services;
using DoNotDisturb.SignalR.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DoNotDisturb
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            //Configurations
            services.AddTransient<HeartbeatConfiguration, HeartbeatConfiguration>();
            services.AddTransient<GoogleConfiguration, GoogleConfiguration>();
            services.AddTransient<DemoConfiguration, DemoConfiguration>();
            services.AddTransient<INotify, NotificationService>();
            
            services.AddSingleton<HeartbeatService>();
            services.AddSingleton<GoogleService, GoogleService>();
            services.AddSingleton<RoomSubscriptionService, RoomSubscriptionService>();
            services.AddSingleton<IPreloader, PreloadService>();

            services.AddCors();
            services.AddSignalR();
            
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration => { configuration.RootPath = "ClientApp/dist"; });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseCors(o => o.WithOrigins("http://localhost:4200", "http://lvh.me:5001", "http://lvh.me:5000", "http://*.ngrok.io", "http://lvh.me:4200", "http://*.masseymansion.com").SetIsOriginAllowedToAllowWildcardSubdomains().AllowCredentials().AllowAnyHeader());

            app.UseSignalR(r => { r.MapHub<RoomHub>("/room"); });
            
            app.UseMvc();

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
        }
    }
}