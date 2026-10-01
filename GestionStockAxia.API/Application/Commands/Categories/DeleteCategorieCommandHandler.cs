using GestionStockAxia.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GestionStockAxia.API.Application.Commands.Categories
{
    public class DeleteCategorieCommandHandler
        : IRequestHandler<DeleteCategorieCommand, bool>
    {
        private readonly ApplicationDbContext _context;

        public DeleteCategorieCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(
            DeleteCategorieCommand request,
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

            _context.Categories.Remove(categorie);

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}