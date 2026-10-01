using GestionStockAxia.API.Application.DTOs;
using GestionStockAxia.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GestionStockAxia.API.Application.Queries.Categories
{
    public class GetAllCategoriesQueryHandler
        : IRequestHandler<GetAllCategoriesQuery, List<CategorieDto>>
    {
        private readonly ApplicationDbContext _context;

        public GetAllCategoriesQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CategorieDto>> Handle(
            GetAllCategoriesQuery request,
            CancellationToken cancellationToken)
        {
            var categories = await _context.Categories
                .AsNoTracking()
                .Select(c => new CategorieDto
                {
                    IdCategorie = c.IdCategorie,
                    NomCategorie = c.NomCategorie,
                    Description = c.Description
                })
                .ToListAsync(cancellationToken);

            return categories;
        }
    }
}