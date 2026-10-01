using GestionStockAxia.API.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionStockAxia.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestController(ApplicationDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                bool connected =
                    await _context.Database.CanConnectAsync();

                if (connected)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Connexion SQL Server réussie !"
                    });
                }

                return StatusCode(500, new
                {
                    success = false,
                    message = "Impossible de se connecter à SQL Server."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}