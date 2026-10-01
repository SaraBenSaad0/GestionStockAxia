using GestionStockAxia.API.Application.DTOs;
using GestionStockAxia.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GestionStockAxia.API.Application.Queries.Categories
{
    public class GetCategorieByIdQueryHandler
        : IRequestHandler<GetCategorieByIdQuery, CategorieDto?>
    {
        private readonly ApplicationDbContext _context;

        public GetCategorieByIdQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CategorieDto?> Handle(
            GetCategorieByIdQuery request,
            CancellationToken cancellationToken)
        {
            var categorie = await _context.Categories
                .AsNoTracking()
                .Where(c => c.IdCategorie == request.IdCategorie)
                .Select(c => new CategorieDto
                {
                    IdCategorie = c.IdCategorie,
                    NomCategorie = c.NomCategorie,
                    Description = c.Description
                })
                .FirstOrDefaultAsync(cancellationToken);

            return categorie;
        }
    }
}