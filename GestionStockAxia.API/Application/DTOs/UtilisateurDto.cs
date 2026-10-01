namespace GestionStockAxia.API.Application.DTOs
{
    public class UtilisateurDto
    {
        public int IdUtilisateur { get; set; }

        public string Nom { get; set; } = string.Empty;

        public string Prenom { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string TypeUtilisateur { get; set; } = string.Empty;

        public DateTime DateCreation { get; set; }
    }
}