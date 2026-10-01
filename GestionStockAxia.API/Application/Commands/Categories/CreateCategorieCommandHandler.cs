using GestionStockAxia.API.Domain.Entities;
using GestionStockAxia.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GestionStockAxia.API.Application.Commands.Categories
{
    public class CreateCategorieCommandHandler
        : IRequestHandler<CreateCategorieCommand, int>
    {
        private readonly ApplicationDbContext _context;

        public CreateCategorieCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(
            CreateCategorieCommand request,
            CancellationToken cancellationToken)
        {
            var nomExiste = await _context.Categories
                .AnyAsync(
                    c => c.NomCategorie == request.NomCategorie,
                    cancellationToken);

            if (nomExiste)
            {
                throw new Exception("Cette catégorie existe déjà.");
            }

            var categorie = new Categorie
            {
                NomCategorie = request.NomCategorie,
                Description = request.Description
            };

            _context.Categories.Add(categorie);

            await _context.SaveChangesAsync(cancellationToken);

            return categorie.IdCategorie;
        }
    }
}