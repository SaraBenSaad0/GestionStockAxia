namespace GestionStockAxia.API.Domain.Entities
{
    public class Administrateur
    {
        public int IdUtilisateur { get; set; }

        public Utilisateur Utilisateur { get; set; } = null!;
    }
}