namespace GestionStockAxia.API.Domain.Entities
{
    public class NotificationCommande
    {
        public int IdNotification { get; set; }

        public int IdCommande { get; set; }

        public Notification Notification { get; set; } = null!;

        public Commande Commande { get; set; } = null!;
    }
}