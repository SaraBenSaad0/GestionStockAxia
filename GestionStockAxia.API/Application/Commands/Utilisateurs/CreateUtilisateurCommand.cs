using MediatR;

namespace GestionStockAxia.API.Application.Commands.Utilisateurs
{
    public class CreateUtilisateurCommand : IRequest<int>
    {
        public string Nom { get; set; } = string.Empty;

        public string Prenom { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string MotDePasse { get; set; } = string.Empty;

        public string TypeUtilisateur { get; set; } = string.Empty;
    }
}