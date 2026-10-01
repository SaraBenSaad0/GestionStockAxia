using MediatR;
using GestionStockAxia.API.Application.DTOs;

namespace GestionStockAxia.API.Application.Commands.Utilisateurs
{
    public class LoginUtilisateurCommand : IRequest<UtilisateurDto?>
    {
        public string Email { get; set; } = string.Empty;

        public string MotDePasse { get; set; } = string.Empty;
    }
}