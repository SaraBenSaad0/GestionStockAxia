namespace GestionStockAxia.API.Application.DTOs
{
    public class CategorieDto
    {
        public int IdCategorie { get; set; }

        public string NomCategorie { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
    }
}