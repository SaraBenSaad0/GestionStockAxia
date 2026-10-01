using GestionStockAxia.API.Application.DTOs;
using GestionStockAxia.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GestionStockAxia.API.Application.Queries.Utilisateurs
{
    public class GetUtilisateurByIdQueryHandler
        : IRequestHandler<GetUtilisateurByIdQuery, UtilisateurDto?>
    {
        private readonly ApplicationDbContext _context;

        public GetUtilisateurByIdQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UtilisateurDto?> Handle(
            GetUtilisateurByIdQuery request,
            CancellationToken cancellationToken)
        {
            var utilisateur = await _context.Utilisateurs
                .AsNoTracking()
                .Where(u => u.IdUtilisateur == request.IdUtilisateur)
                .Select(u => new UtilisateurDto
                {
                    IdUtilisateur = u.IdUtilisateur,
                    Nom = u.Nom,
                    Prenom = u.Prenom,
                    Email = u.Email,
                    TypeUtilisateur = u.TypeUtilisateur,
                    DateCreation = u.DateCreation
                })
                .FirstOrDefaultAsync(cancellationToken);

            return utilisateur;
        }
    }
}