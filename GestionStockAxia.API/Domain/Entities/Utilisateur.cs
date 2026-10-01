using System;
using System.Collections.Generic;

namespace GestionStockAxia.API.Domain.Entities
{
    public class Utilisateur
    {
        public int IdUtilisateur { get; set; }

        public string Nom { get; set; } = string.Empty;

        public string Prenom { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string MotDePasse { get; set; } = string.Empty;

        public string TypeUtilisateur { get; set; } = string.Empty;

        public DateTime DateCreation { get; set; }

        // Relations
        public Administrateur? Administrateur { get; set; }

        public Employe? Employe { get; set; }

        public Fournisseur? Fournisseur { get; set; }

        public ICollection<Notification> Notifications { get; set; }
            = new List<Notification>();
    }
}