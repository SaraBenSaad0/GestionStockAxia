using GestionStockAxia.API.Application.DTOs;
using MediatR;

namespace GestionStockAxia.API.Application.Queries.Categories
{
    public class GetCategorieByIdQuery : IRequest<CategorieDto?>
    {
        public int IdCategorie { get; set; }

        public GetCategorieByIdQuery(int idCategorie)
        {
            IdCategorie = idCategorie;
        }
    }
}