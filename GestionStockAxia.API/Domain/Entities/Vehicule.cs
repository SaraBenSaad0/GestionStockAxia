using System.Collections.Generic;

namespace GestionStockAxia.API.Domain.Entities
{
    public class Vehicule
    {
        public int IdVehicule { get; set; }

        public string Marque { get; set; } = string.Empty;

        public string Modele { get; set; } = string.Empty;

        public int AnneeDebut { get; set; }

        public int AnneeFin { get; set; }

        public decimal PrixUnitaire { get; set; }

        public ICollection<ProduitVehicule> ProduitVehicules { get; set; }
            = new List<ProduitVehicule>();

        public ICollection<LigneCommande> LignesCommande { get; set; }
            = new List<LigneCommande>();
    }
}
