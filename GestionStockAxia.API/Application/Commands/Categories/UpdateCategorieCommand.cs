using MediatR;

namespace GestionStockAxia.API.Application.Commands.Categories
{
    public class UpdateCategorieCommand : IRequest<bool>
    {
        public int IdCategorie { get; set; }

        public string NomCategorie { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
    }
}