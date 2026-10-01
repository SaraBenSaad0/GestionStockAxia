using System;
using System.Collections.Generic;

namespace GestionStockAxia.API.Domain.Entities
{
    public class Commande
    {
        public int IdCommande { get; set; }

        public int IdFournisseur { get; set; }

        public DateTime DateCommande { get; set; }

        public string Statut { get; set; } = string.Empty;

        public decimal MontantTotal { get; set; }

        // Relations
        public Fournisseur Fournisseur { get; set; } = null!;

        public ICollection<LigneCommande> Lignes { get; set; }
            = new List<LigneCommande>();
    }
}