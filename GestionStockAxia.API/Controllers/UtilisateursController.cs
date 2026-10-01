using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GestionStockAxia.API.Application.DTOs;
using GestionStockAxia.API.Domain.Entities;
using GestionStockAxia.API.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace GestionStockAxia.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UtilisateursController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<string> _hasher = new();

        public UtilisateursController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST api/Utilisateurs/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var email = (request.Email ?? "").Trim();
            var user = await _context.Utilisateurs.FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower());
            if (user == null) return Unauthorized(new { message = "Email ou mot de passe incorrect." });

            var result = _hasher.VerifyHashedPassword(user.Email, user.MotDePasse, request.MotDePasse ?? "");
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized(new { message = "Email ou mot de passe incorrect." });

            return Ok(new { token = CreateToken(user), user = ToDto(user) });
        }

        // POST api/Utilisateurs/register  (public — always creates a FOURNISSEUR account)
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] CreateUserRequest request)
        {
            return await CreateUser(request, "FOURNISSEUR");
        }

        // POST api/Utilisateurs/repair-demo-accounts
        // DEV ONLY: resets every account's password to "Password123!". Anonymous on purpose —
        // if the admin account can't log in there is no other way to reach an admin-only endpoint.
        // Delete this action before shipping to production.
        [HttpPost("repair-demo-accounts")]
        [AllowAnonymous]
        public async Task<IActionResult> RepairDemoAccounts()
        {
            var users = await _context.Utilisateurs.ToListAsync();
            foreach (var user in users)
            {
                user.MotDePasse = _hasher.HashPassword(user.Email, "Password123!");
                if (user.TypeUtilisateur == "FOURNISSEUR" && !await _context.Fournisseurs.AnyAsync(f => f.IdUtilisateur == user.IdUtilisateur))
                {
                    _context.Fournisseurs.Add(new Fournisseur { IdUtilisateur = user.IdUtilisateur });
                }
                if (user.TypeUtilisateur == "ADMIN" && !await _context.Administrateurs.AnyAsync(a => a.IdUtilisateur == user.IdUtilisateur))
                {
                    _context.Administrateurs.Add(new Administrateur { IdUtilisateur = user.IdUtilisateur });
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = $"{users.Count} compte(s) réinitialisé(s). Mot de passe pour tous: Password123!" });
        }

        // GET api/Utilisateurs/me
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var user = await _context.Utilisateurs.FindAsync(CurrentUserId());
            return user == null ? Unauthorized() : Ok(ToDto(user));
        }

        // GET api/Utilisateurs
        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _context.Utilisateurs.AsNoTracking()
                .OrderByDescending(x => x.DateCreation)
                .ToListAsync();
            return Ok(users.Select(ToDto));
        }

        // GET api/Utilisateurs/5
        [HttpGet("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _context.Utilisateurs.FindAsync(id);
            return user == null ? NotFound() : Ok(ToDto(user));
        }

        // POST api/Utilisateurs  (admin creates ADMIN or FOURNISSEUR accounts)
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            var role = request.TypeUtilisateur?.ToUpperInvariant();
            if (role is not ("ADMIN" or "FOURNISSEUR"))
                return BadRequest(new { message = "Le rôle doit être ADMIN ou FOURNISSEUR." });
            return await CreateUser(request, role);
        }

        // PUT api/Utilisateurs/5  (an admin can edit anyone; a fournisseur can only edit their own profile)
        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
        {
            if (!User.IsInRole("ADMIN") && id != CurrentUserId())
                return Forbid();

            var user = await _context.Utilisateurs.FindAsync(id);
            if (user == null) return NotFound();

            var email = request.Email.Trim();
            if (await _context.Utilisateurs.AnyAsync(x => x.IdUtilisateur != id && x.Email.ToLower() == email.ToLower()))
                return Conflict(new { message = "Cet email est déjà utilisé." });

            user.Nom = request.Nom.Trim();
            user.Prenom = request.Prenom?.Trim() ?? "";
            user.Email = email;
            if (!string.IsNullOrWhiteSpace(request.MotDePasse))
                user.MotDePasse = _hasher.HashPassword(user.Email, request.MotDePasse);

            if (User.IsInRole("ADMIN"))
            {
                var role = request.TypeUtilisateur?.ToUpperInvariant();
                if (role is "ADMIN" or "FOURNISSEUR") user.TypeUtilisateur = role;
            }

            await _context.SaveChangesAsync();
            return Ok(ToDto(user));
        }

        // DELETE api/Utilisateurs/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            if (id == CurrentUserId()) return BadRequest(new { message = "Vous ne pouvez pas supprimer votre propre compte." });
            var user = await _context.Utilisateurs.FindAsync(id);
            if (user == null) return NotFound();
            _context.Utilisateurs.Remove(user);
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateException) { return BadRequest(new { message = "Impossible de supprimer cet utilisateur : il est encore lié à des données existantes." }); }
            return NoContent();
        }

        private async Task<IActionResult> CreateUser(CreateUserRequest request, string forcedRole)
        {
            if (string.IsNullOrWhiteSpace(request.Nom) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.MotDePasse))
                return BadRequest(new { message = "Nom, email et mot de passe sont obligatoires." });

            var email = request.Email.Trim();
            if (await _context.Utilisateurs.AnyAsync(x => x.Email.ToLower() == email.ToLower()))
                return Conflict(new { message = "Cet email existe déjà." });

            var user = new Utilisateur
            {
                Nom = request.Nom.Trim(),
                Prenom = request.Prenom?.Trim() ?? "",
                Email = email,
                TypeUtilisateur = forcedRole,
                MotDePasse = _hasher.HashPassword(email, request.MotDePasse),
                DateCreation = DateTime.Now
            };
            _context.Utilisateurs.Add(user);
            await _context.SaveChangesAsync();

            if (forcedRole == "ADMIN")
                _context.Administrateurs.Add(new Administrateur { IdUtilisateur = user.IdUtilisateur });
            else
                _context.Fournisseurs.Add(new Fournisseur { IdUtilisateur = user.IdUtilisateur });
            await _context.SaveChangesAsync();

            return Ok(new { idUtilisateur = user.IdUtilisateur, user = ToDto(user) });
        }

        private int CurrentUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private string CreateToken(Utilisateur user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.IdUtilisateur.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.TypeUtilisateur)
            };
            var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddHours(8), signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static UtilisateurDto ToDto(Utilisateur user) => new()
        {
            IdUtilisateur = user.IdUtilisateur,
            Nom = user.Nom,
            Prenom = user.Prenom,
            Email = user.Email,
            TypeUtilisateur = user.TypeUtilisateur,
            DateCreation = user.DateCreation
        };
    }

    public class LoginRequest { public string Email { get; set; } = ""; public string MotDePasse { get; set; } = ""; }
    public class CreateUserRequest
    {
        public string Nom { get; set; } = "";
        public string? Prenom { get; set; }
        public string Email { get; set; } = "";
        public string MotDePasse { get; set; } = "";
        public string TypeUtilisateur { get; set; } = "FOURNISSEUR";
    }
    public class UpdateUserRequest : CreateUserRequest { }
}
