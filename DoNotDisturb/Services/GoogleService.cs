using System.ComponentModel;
using System.IO;
using System.Threading;
using DoNotDisturb.Configurations;
using Google.Apis.Admin.Directory.directory_v1;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Calendar.v3;
using Google.Apis.Services;
using Microsoft.Extensions.Configuration;

namespace DoNotDisturb.Services
{
    public class GoogleService
    {
        private readonly GoogleConfiguration _configuration;
        private UserCredential _userCredential;
        public bool IsAuthorized { get; private set; }
        
        public GoogleService(GoogleConfiguration configuration)
        {
            _configuration = configuration;
        }
        
        public void Authorize(string accessCode)
        {
            if (IsAuthorized)
                return;

            GoogleClientSecrets secrets;
            using(var stream = new FileStream(_configuration.ServiceAccountCredentials, FileMode.Open, FileAccess.Read))
                secrets = GoogleClientSecrets.Load(stream);

            // Use the code exchange flow to get an access and refresh token.
            IAuthorizationCodeFlow flow =
                new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = secrets.Secrets,
                    Scopes = new [] { DirectoryService.Scope.AdminDirectoryResourceCalendarReadonly, CalendarService.Scope.CalendarReadonly }
                });

            var tokenResponse = flow.ExchangeCodeForTokenAsync("", accessCode, "postmessage", CancellationToken.None).Result;

            _userCredential = new UserCredential(flow, "me", tokenResponse);

            IsAuthorized = true;
            
            InitializeServices();
        }
        public CalendarService CalendarService { get; private set; }
        public DirectoryService DirectoryService { get; private set; }
        private void InitializeServices()
        {
            if (!IsAuthorized)
                return;
            
            CalendarService = new CalendarService(GetInitializer());
            DirectoryService = new DirectoryService(GetInitializer());
        }
        private BaseClientService.Initializer GetInitializer() => new BaseClientService.Initializer { HttpClientInitializer = _userCredential };
        
    }
}