using MediatR;

namespace GestionStockAxia.API.Application.Commands.Categories
{
    public class CreateCategorieCommand : IRequest<int>
    {
        public string NomCategorie { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
    }
}