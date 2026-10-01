using System;

namespace GestionStockAxia.API.Domain.Entities
{
    public class Prevision
    {
        public int IdPrevision { get; set; }

        public int IdProduit { get; set; }

        public DateTime DatePrevision { get; set; }

        public decimal QuantitePrevue { get; set; }

        public decimal Fiabilite { get; set; }

        public Produit Produit { get; set; } = null!;
    }
}