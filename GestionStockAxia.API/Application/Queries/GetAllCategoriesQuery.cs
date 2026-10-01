using GestionStockAxia.API.Application.DTOs;
using MediatR;

namespace GestionStockAxia.API.Application.Queries.Categories
{
    public class GetAllCategoriesQuery : IRequest<List<CategorieDto>>
    {
    }
}