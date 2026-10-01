using MediatR;

namespace GestionStockAxia.API.Application.Commands.Categories
{
    public class DeleteCategorieCommand : IRequest<bool>
    {
        public int IdCategorie { get; set; }

        public DeleteCategorieCommand(int idCategorie)
        {
            IdCategorie = idCategorie;
        }
    }
}