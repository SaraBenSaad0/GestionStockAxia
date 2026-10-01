using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionStockAxia.API.Domain.Entities
{
    public class Categorie
    {
        public int IdCategorie { get; set; }

        [Column("nom")]
        public string NomCategorie { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        public ICollection<Produit> Produits { get; set; }
            = new List<Produit>();
    }
}