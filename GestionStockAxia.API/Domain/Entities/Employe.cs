namespace GestionStockAxia.API.Domain.Entities
{
    public class Employe
    {
        public int IdUtilisateur { get; set; }

        public Utilisateur Utilisateur { get; set; } = null!;
    }
}