using GestionStockAxia.API.Application.DTOs;
using MediatR;

namespace GestionStockAxia.API.Application.Queries.Utilisateurs
{
    public class GetAllUtilisateursQuery : IRequest<List<UtilisateurDto>>
    {
    }
}