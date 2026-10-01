using GestionStockAxia.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GestionStockAxia.API.Application.Commands.Utilisateurs
{
    public class CreateUtilisateurCommandHandler
        : IRequestHandler<CreateUtilisateurCommand, int>
    {
        private readonly ApplicationDbContext _context;
        private readonly PasswordHasher<string> _passwordHasher;

        public CreateUtilisateurCommandHandler(ApplicationDbContext context)
        {
            _context = context;
            _passwordHasher = new PasswordHasher<string>();
        }

        public async Task<int> Handle(
            CreateUtilisateurCommand request,
            CancellationToken cancellationToken)
        {
            // Check if the email already exists
            var emailExiste = await _context.Utilisateurs
                .AnyAsync(
                    u => u.Email == request.Email,
                    cancellationToken);

            if (emailExiste)
            {
                throw new Exception("Cet email existe déjà.");
            }

            // Create the new user
            var utilisateur = new Domain.Entities.Utilisateur
            {
                Nom = request.Nom,
                Prenom = request.Prenom,
                Email = request.Email,
                TypeUtilisateur = request.TypeUtilisateur,

                // Hash the password before saving it
                MotDePasse = _passwordHasher.HashPassword(
                    request.Email,
                    request.MotDePasse
                ),

                DateCreation = DateTime.Now
            };

            // Add the user to the database
            _context.Utilisateurs.Add(utilisateur);

            // Save changes
            await _context.SaveChangesAsync(cancellationToken);

            // Return the newly created user's ID
            return utilisateur.IdUtilisateur;
        }
    }
}