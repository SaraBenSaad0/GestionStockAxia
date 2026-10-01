using System.Collections.Generic;

namespace GestionStockAxia.API.Domain.Entities
{
    public class Produit
    {
        public int IdProduit { get; set; }

        public string Reference { get; set; } = string.Empty;

        public string Designation { get; set; } = string.Empty;

        public string? Description { get; set; }

        public decimal PrixUnitaire { get; set; }

        public int QuantiteStock { get; set; }

        public int SeuilAlerte { get; set; }

        public int IdCategorie { get; set; }

        // Relations
        public Categorie Categorie { get; set; } = null!;

        public ICollection<ProduitVehicule> ProduitVehicules { get; set; }
            = new List<ProduitVehicule>();

        public ICollection<LigneCommande> LignesCommande { get; set; }
            = new List<LigneCommande>();

        public ICollection<Prevision> Previsions { get; set; }
            = new List<Prevision>();
    }
}
