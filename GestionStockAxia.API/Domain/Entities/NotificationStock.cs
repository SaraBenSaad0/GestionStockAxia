namespace GestionStockAxia.API.Domain.Entities
{
    public class NotificationStock
    {
        public int IdNotification { get; set; }

        public int IdProduit { get; set; }

        public int QuantiteActuelle { get; set; }

        public int SeuilMinimum { get; set; }

        public Notification Notification { get; set; } = null!;

        public Produit Produit { get; set; } = null!;
    }
}