namespace GestionStockAxia.API.Domain.Entities
{
    public class ProduitVehicule
    {
        public int IdProduit { get; set; }

        public int IdVehicule { get; set; }

        public Produit Produit { get; set; } = null!;

        public Vehicule Vehicule { get; set; } = null!;
    }
}