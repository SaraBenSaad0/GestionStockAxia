namespace GestionStockAxia.API.Domain.Entities
{
    public class LigneCommande
    {
        public int IdLigne { get; set; }

        public int IdCommande { get; set; }

        // Exactly one of IdProduit / IdVehicule is set per line — a line is
        // either a product order or a vehicle order, never both.
        public int? IdProduit { get; set; }

        public int? IdVehicule { get; set; }

        public int Quantite { get; set; }

        public decimal PrixUnitaire { get; set; }

        // Relations
        public Commande Commande { get; set; } = null!;

        public Produit? Produit { get; set; }

        public Vehicule? Vehicule { get; set; }
    }
}
