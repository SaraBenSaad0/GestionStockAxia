using GestionStockAxia.API.Application.DTOs;
using GestionStockAxia.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GestionStockAxia.API.Application.Commands.Utilisateurs
{
    public class LoginUtilisateurCommandHandler
        : IRequestHandler<LoginUtilisateurCommand, UtilisateurDto?>
    {
        private readonly ApplicationDbContext _context;
        private readonly PasswordHasher<string> _passwordHasher;

        public LoginUtilisateurCommandHandler(
            ApplicationDbContext context)
        {
            _context = context;
            _passwordHasher = new PasswordHasher<string>();
        }

        public async Task<UtilisateurDto?> Handle(
            LoginUtilisateurCommand request,
            CancellationToken cancellationToken)
        {
            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(
                    u => u.Email == request.Email,
                    cancellationToken);

            // Email doesn't exist
            if (utilisateur == null)
            {
                return null;
            }

            // Verify hashed password
            var result = _passwordHasher.VerifyHashedPassword(
                utilisateur.Email,
                utilisateur.MotDePasse,
                request.MotDePasse
            );

            if (result == PasswordVerificationResult.Failed)
            {
                return null;
            }

            // Login successful
            return new UtilisateurDto
            {
                IdUtilisateur = utilisateur.IdUtilisateur,
                Nom = utilisateur.Nom,
                Prenom = utilisateur.Prenom,
                Email = utilisateur.Email,
                TypeUtilisateur = utilisateur.TypeUtilisateur,
                DateCreation = utilisateur.DateCreation
            };
        }
    }
}