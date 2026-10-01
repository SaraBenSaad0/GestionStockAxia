using GestionStockAxia.API.Application.DTOs;
using MediatR;

namespace GestionStockAxia.API.Application.Queries.Utilisateurs
{
    public class GetUtilisateurByIdQuery : IRequest<UtilisateurDto?>
    {
        public int IdUtilisateur { get; set; }

        public GetUtilisateurByIdQuery(int idUtilisateur)
        {
            IdUtilisateur = idUtilisateur;
        }
    }
}