using System;

namespace GestionStockAxia.API.Domain.Entities
{
    public class Notification
    {
        public int IdNotification { get; set; }

        public int IdUtilisateur { get; set; }

        public string Message { get; set; } = string.Empty;

        public DateTime DateEnvoi { get; set; }

        public bool Lue { get; set; }

        public string TypeNotification { get; set; } = string.Empty;

        public Utilisateur Utilisateur { get; set; } = null!;
    }
}
