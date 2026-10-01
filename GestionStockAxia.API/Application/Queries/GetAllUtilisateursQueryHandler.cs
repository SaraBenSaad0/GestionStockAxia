using GestionStockAxia.API.Application.DTOs;
using GestionStockAxia.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GestionStockAxia.API.Application.Queries.Utilisateurs
{
    public class GetAllUtilisateursQueryHandler
        : IRequestHandler<GetAllUtilisateursQuery, List<UtilisateurDto>>
    {
        private readonly ApplicationDbContext _context;

        public GetAllUtilisateursQueryHandler(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<UtilisateurDto>> Handle(
            GetAllUtilisateursQuery request,
            CancellationToken cancellationToken)
        {
            var utilisateurs = await _context.Utilisateurs
                .AsNoTracking()
                .Select(u => new UtilisateurDto
                {
                    IdUtilisateur = u.IdUtilisateur,
                    Nom = u.Nom,
                    Prenom = u.Prenom,
                    Email = u.Email,
                    TypeUtilisateur = u.TypeUtilisateur,
                    DateCreation = u.DateCreation
                })
                .ToListAsync(cancellationToken);

            return utilisateurs;
        }
    }
}