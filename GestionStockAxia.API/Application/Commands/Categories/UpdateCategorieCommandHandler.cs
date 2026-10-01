using GestionStockAxia.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GestionStockAxia.API.Application.Commands.Categories
{
    public class UpdateCategorieCommandHandler
        : IRequestHandler<UpdateCategorieCommand, bool>
    {
        private readonly ApplicationDbContext _context;

        public UpdateCategorieCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(
            UpdateCategorieCommand request,
            CancellationToken cancellationToken)
        {
            var categorie = await _context.Categories
                .FirstOrDefaultAsync(
                    c => c.IdCategorie == request.IdCategorie,
                    cancellationToken);

            if (categorie == null)
            {
                return false;
            }

            var nomExiste = await _context.Categories
                .AnyAsync(
                    c => c.NomCategorie == request.NomCategorie
                         && c.IdCategorie != request.IdCategorie,
                    cancellationToken);

            if (nomExiste)
            {
                throw new Exception("Cette catégorie existe déjà.");
            }

            categorie.NomCategorie = request.NomCategorie;
            categorie.Description = request.Description;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}