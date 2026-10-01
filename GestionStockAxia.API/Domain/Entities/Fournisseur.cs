using System.Collections.Generic;

namespace GestionStockAxia.API.Domain.Entities
{
    public class Fournisseur
    {
        public int IdUtilisateur { get; set; }

        public Utilisateur Utilisateur { get; set; } = null!;

        public ICollection<Commande> Commandes { get; set; }
            = new List<Commande>();
    }
}