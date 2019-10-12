using DoNotDisturb.Preloaders;
using DoNotDisturb.Services;
using Microsoft.AspNetCore.Mvc;

namespace DoNotDisturb.Controllers
{
    [Route("api/[controller]/[action]")]
    public class AccountController : Controller
    {
        private readonly GoogleService _googleService;
        public AccountController(GoogleService googleService)
        {
            _googleService = googleService;
        }
        [HttpPost]
        public void AuthenticateOffline(string code)
        {
            _googleService.Authorize(code);
        }
    }
}