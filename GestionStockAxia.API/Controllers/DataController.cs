using GestionStockAxia.API.Domain.Entities;
using GestionStockAxia.API.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GestionStockAxia.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DataController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public DataController(ApplicationDbContext context) { _context = context; }

        private int CurrentUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsAdmin() => User.IsInRole("ADMIN");

        // ==========================================
        // PRODUITS
        // ==========================================

        [HttpGet("produits")]
        public async Task<IActionResult> GetProduits()
        {
            var produits = await _context.Produits.AsNoTracking()
                .Include(p => p.Categorie)
                .OrderBy(p => p.Designation)
                .Select(p => new
                {
                    p.IdProduit,
                    p.Reference,
                    p.Designation,
                    p.Description,
                    p.PrixUnitaire,
                    p.QuantiteStock,
                    p.SeuilAlerte,
                    p.IdCategorie,
                    categorieNom = p.Categorie.NomCategorie,
                    stockFaible = p.QuantiteStock <= p.SeuilAlerte
                })
                .ToListAsync();
            return Ok(produits);
        }

        [HttpPost("produits")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateProduit([FromBody] ProduitRequest request)
        {
            if (!await _context.Categories.AnyAsync(c => c.IdCategorie == request.IdCategorie))
                return BadRequest(new { message = "Catégorie invalide." });

            var produit = new Produit
            {
                Reference = request.Reference.Trim(),
                Designation = request.Designation.Trim(),
                Description = request.Description,
                PrixUnitaire = request.PrixUnitaire,
                QuantiteStock = request.QuantiteStock,
                SeuilAlerte = request.SeuilAlerte,
                IdCategorie = request.IdCategorie
            };
            _context.Produits.Add(produit);
            await _context.SaveChangesAsync();
            return Ok(new { produit.IdProduit });
        }

        [HttpPut("produits/{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateProduit(int id, [FromBody] ProduitRequest request)
        {
            var produit = await _context.Produits.FindAsync(id);
            if (produit == null) return NotFound();
            if (!await _context.Categories.AnyAsync(c => c.IdCategorie == request.IdCategorie))
                return BadRequest(new { message = "Catégorie invalide." });

            var stockRedescendu = request.QuantiteStock <= request.SeuilAlerte && produit.QuantiteStock > produit.SeuilAlerte;

            produit.Reference = request.Reference.Trim();
            produit.Designation = request.Designation.Trim();
            produit.Description = request.Description;
            produit.PrixUnitaire = request.PrixUnitaire;
            produit.QuantiteStock = request.QuantiteStock;
            produit.SeuilAlerte = request.SeuilAlerte;
            produit.IdCategorie = request.IdCategorie;
            await _context.SaveChangesAsync();

            if (stockRedescendu)
                await NotifyAllAdmins("STOCK", $"Le stock de \"{produit.Designation}\" est descendu à {produit.QuantiteStock} (seuil {produit.SeuilAlerte}).");

            return Ok(new { produit.IdProduit });
        }

        [HttpDelete("produits/{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteProduit(int id)
        {
            var produit = await _context.Produits.FindAsync(id);
            if (produit == null) return NotFound();
            _context.Produits.Remove(produit);
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateException) { return BadRequest(new { message = "Ce produit est utilisé dans des commandes existantes et ne peut pas être supprimé." }); }
            return NoContent();
        }

        // ==========================================
        // VEHICULES
        // ==========================================

        [HttpGet("vehicules")]
        public async Task<IActionResult> GetVehicules()
        {
            var vehicules = await _context.Vehicules.AsNoTracking()
                .OrderBy(v => v.Marque).ThenBy(v => v.Modele)
                .Select(v => new { v.IdVehicule, v.Marque, v.Modele, v.AnneeDebut, v.AnneeFin, v.PrixUnitaire })
                .ToListAsync();
            return Ok(vehicules);
        }

        [HttpPost("vehicules")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateVehicule([FromBody] VehiculeRequest request)
        {
            var vehicule = new Vehicule { Marque = request.Marque.Trim(), Modele = request.Modele.Trim(), AnneeDebut = request.AnneeDebut, AnneeFin = request.AnneeFin, PrixUnitaire = request.PrixUnitaire };
            _context.Vehicules.Add(vehicule);
            await _context.SaveChangesAsync();
            return Ok(new { vehicule.IdVehicule });
        }

        [HttpPut("vehicules/{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateVehicule(int id, [FromBody] VehiculeRequest request)
        {
            var vehicule = await _context.Vehicules.FindAsync(id);
            if (vehicule == null) return NotFound();
            vehicule.Marque = request.Marque.Trim();
            vehicule.Modele = request.Modele.Trim();
            vehicule.AnneeDebut = request.AnneeDebut;
            vehicule.AnneeFin = request.AnneeFin;
            vehicule.PrixUnitaire = request.PrixUnitaire;
            await _context.SaveChangesAsync();
            return Ok(new { vehicule.IdVehicule });
        }

        [HttpDelete("vehicules/{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteVehicule(int id)
        {
            var vehicule = await _context.Vehicules.FindAsync(id);
            if (vehicule == null) return NotFound();
            _context.Vehicules.Remove(vehicule);
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateException) { return BadRequest(new { message = "Ce véhicule est lié à des produits existants et ne peut pas être supprimé." }); }
            return NoContent();
        }

        // ==========================================
        // FOURNISSEURS  (no dedicated columns beyond the linked account —
        // the "company profile" IS the Utilisateur row of type FOURNISSEUR)
        // ==========================================

        [HttpGet("fournisseurs")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetFournisseurs()
        {
            var fournisseurs = await _context.Fournisseurs.AsNoTracking()
                .Include(f => f.Utilisateur)
                .Select(f => new
                {
                    f.IdUtilisateur,
                    f.Utilisateur.Nom,
                    f.Utilisateur.Prenom,
                    f.Utilisateur.Email,
                    f.Utilisateur.DateCreation,
                    nombreCommandes = f.Commandes.Count,
                    montantTotal = f.Commandes.Sum(c => (decimal?)c.MontantTotal) ?? 0m
                })
                .ToListAsync();
            return Ok(fournisseurs);
        }

        // ==========================================
        // COMMANDES
        // ==========================================

        [HttpGet("commandes")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetCommandes()
        {
            var commandes = await _context.Commandes.AsNoTracking()
                .Include(c => c.Fournisseur).ThenInclude(f => f.Utilisateur)
                .Include(c => c.Lignes)
                .OrderByDescending(c => c.DateCommande)
                .Select(c => new
                {
                    c.IdCommande,
                    c.DateCommande,
                    c.Statut,
                    c.MontantTotal,
                    fournisseurId = c.IdFournisseur,
                    fournisseurNom = c.Fournisseur.Utilisateur.Nom + " " + c.Fournisseur.Utilisateur.Prenom,
                    nombreLignes = c.Lignes.Count
                })
                .ToListAsync();
            return Ok(commandes);
        }

        [HttpGet("commandes/mes-commandes")]
        [Authorize(Roles = "FOURNISSEUR")]
        public async Task<IActionResult> GetMesCommandes()
        {
            var userId = CurrentUserId();
            var commandes = await _context.Commandes.AsNoTracking()
                .Where(c => c.IdFournisseur == userId)
                .Include(c => c.Lignes).ThenInclude(l => l.Produit)
                .OrderByDescending(c => c.DateCommande)
                .Select(c => new
                {
                    c.IdCommande,
                    c.DateCommande,
                    c.Statut,
                    c.MontantTotal,
                    lignes = c.Lignes.Select(l => new
                    {
                        type = l.IdProduit != null ? "PRODUIT" : "VEHICULE",
                        l.IdProduit,
                        l.IdVehicule,
                        nom = l.IdProduit != null ? l.Produit!.Designation : l.Vehicule!.Marque + " " + l.Vehicule!.Modele,
                        l.Quantite,
                        l.PrixUnitaire
                    })
                })
                .ToListAsync();
            return Ok(commandes);
        }

        [HttpPost("commandes")]
        [Authorize(Roles = "FOURNISSEUR")]
        public async Task<IActionResult> CreateCommande([FromBody] CommandeRequest request)
        {
            if (request.Lignes == null || request.Lignes.Count == 0)
                return BadRequest(new { message = "Ajoutez au moins un produit ou un véhicule à la commande." });

            foreach (var l in request.Lignes)
            {
                if (l.IdProduit == null && l.IdVehicule == null)
                    return BadRequest(new { message = "Chaque ligne doit indiquer un produit ou un véhicule." });
                if (l.IdProduit != null && l.IdVehicule != null)
                    return BadRequest(new { message = "Une ligne ne peut pas être à la fois un produit et un véhicule." });
                if (l.Quantite <= 0)
                    return BadRequest(new { message = "La quantité doit être supérieure à 0." });
            }

            var userId = CurrentUserId();

            var produitIds = request.Lignes.Where(l => l.IdProduit != null).Select(l => l.IdProduit!.Value).Distinct().ToList();
            var produits = await _context.Produits.Where(p => produitIds.Contains(p.IdProduit)).ToListAsync();
            if (produits.Count != produitIds.Count)
                return BadRequest(new { message = "Un ou plusieurs produits sont invalides." });

            var vehiculeIds = request.Lignes.Where(l => l.IdVehicule != null).Select(l => l.IdVehicule!.Value).Distinct().ToList();
            var vehicules = await _context.Vehicules.Where(v => vehiculeIds.Contains(v.IdVehicule)).ToListAsync();
            if (vehicules.Count != vehiculeIds.Count)
                return BadRequest(new { message = "Un ou plusieurs véhicules sont invalides." });

            var commande = new Commande { IdFournisseur = userId, DateCommande = DateTime.Now, Statut = "En attente" };
            foreach (var ligne in request.Lignes)
            {
                if (ligne.IdProduit != null)
                {
                    var produit = produits.First(p => p.IdProduit == ligne.IdProduit);
                    commande.Lignes.Add(new LigneCommande { IdProduit = produit.IdProduit, Quantite = ligne.Quantite, PrixUnitaire = produit.PrixUnitaire });
                }
                else
                {
                    var vehicule = vehicules.First(v => v.IdVehicule == ligne.IdVehicule);
                    commande.Lignes.Add(new LigneCommande { IdVehicule = vehicule.IdVehicule, Quantite = ligne.Quantite, PrixUnitaire = vehicule.PrixUnitaire });
                }
            }
            commande.MontantTotal = commande.Lignes.Sum(l => l.Quantite * l.PrixUnitaire);

            _context.Commandes.Add(commande);
            await _context.SaveChangesAsync();

            await NotifyAllAdmins("COMMANDE", $"Une nouvelle commande de {commande.MontantTotal:0.00} DT vient d'être passée.");

            return Ok(new { commande.IdCommande });
        }

        [HttpPut("commandes/{id:int}/statut")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateStatutCommande(int id, [FromBody] StatutRequest request)
        {
            var commande = await _context.Commandes.FindAsync(id);
            if (commande == null) return NotFound();
            commande.Statut = request.Statut;
            await _context.SaveChangesAsync();

            await NotifyUser(commande.IdFournisseur, "COMMANDE", $"Votre commande #{commande.IdCommande} est maintenant : {request.Statut}.");

            return Ok(new { commande.IdCommande, commande.Statut });
        }

        // ==========================================
        // NOTIFICATIONS  (each user sees only their own)
        // ==========================================

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = CurrentUserId();
            var notifications = await _context.Notifications.AsNoTracking()
                .Where(n => n.IdUtilisateur == userId)
                .OrderByDescending(n => n.DateEnvoi)
                .Select(n => new { n.IdNotification, n.Message, n.Lue, n.DateEnvoi, n.TypeNotification })
                .ToListAsync();
            return Ok(notifications);
        }

        [HttpGet("notifications/non-lues-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = CurrentUserId();
            var count = await _context.Notifications.CountAsync(n => n.IdUtilisateur == userId && !n.Lue);
            return Ok(new { count });
        }

        [HttpPut("notifications/{id:int}/lue")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = CurrentUserId();
            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.IdNotification == id && n.IdUtilisateur == userId);
            if (notification == null) return NotFound();
            notification.Lue = true;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("notifications/lire-tout")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = CurrentUserId();
            await _context.Notifications.Where(n => n.IdUtilisateur == userId && !n.Lue)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.Lue, true));
            return NoContent();
        }

        // ==========================================
        // STATISTIQUES (ADMIN)
        // ==========================================

        [HttpGet("stats")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetStats()
        {
            var now = DateTime.Now;
            var debutMoisActuel = new DateTime(now.Year, now.Month, 1);
            var debutMoisPrecedent = debutMoisActuel.AddMonths(-1);

            var commandesMoisActuel = await _context.Commandes.CountAsync(c => c.DateCommande >= debutMoisActuel);
            var montantMoisActuel = await _context.Commandes.Where(c => c.DateCommande >= debutMoisActuel).SumAsync(c => (decimal?)c.MontantTotal) ?? 0m;
            var commandesMoisPrecedent = await _context.Commandes.CountAsync(c => c.DateCommande >= debutMoisPrecedent && c.DateCommande < debutMoisActuel);
            var montantMoisPrecedent = await _context.Commandes.Where(c => c.DateCommande >= debutMoisPrecedent && c.DateCommande < debutMoisActuel).SumAsync(c => (decimal?)c.MontantTotal) ?? 0m;
            var produitsStockFaible = await _context.Produits.CountAsync(p => p.QuantiteStock <= p.SeuilAlerte);

            var debut12Mois = debutMoisActuel.AddMonths(-11);
            var commandesBrutes = await _context.Commandes
                .Where(c => c.DateCommande >= debut12Mois)
                .Select(c => new { c.DateCommande, c.MontantTotal })
                .ToListAsync();

            var historique = Enumerable.Range(0, 12).Select(i =>
            {
                var moisDate = debut12Mois.AddMonths(i);
                var duMois = commandesBrutes.Where(c => c.DateCommande.Year == moisDate.Year && c.DateCommande.Month == moisDate.Month).ToList();
                return new
                {
                    mois = moisDate.ToString("MMM yyyy", new System.Globalization.CultureInfo("fr-FR")),
                    commandes = duMois.Count,
                    montant = duMois.Sum(c => c.MontantTotal)
                };
            }).ToList();

            return Ok(new
            {
                moisActuel = debutMoisActuel.ToString("MMMM yyyy", new System.Globalization.CultureInfo("fr-FR")),
                moisPrecedent = debutMoisPrecedent.ToString("MMMM yyyy", new System.Globalization.CultureInfo("fr-FR")),
                commandesMoisActuel,
                montantMoisActuel,
                commandesMoisPrecedent,
                montantMoisPrecedent,
                produitsStockFaible,
                historique
            });
        }

        // ==========================================
        // PRÉVISIONS D'ACHAT (ADMIN)
        // Forecast built from the last 3 months of actual order history —
        // a transparent weighted average, not a black-box model, so the
        // reasoning behind every number stays visible.
        // ==========================================

        [HttpGet("previsions")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetPrevisions()
        {
            var now = DateTime.Now;
            var debutMoisActuel = new DateTime(now.Year, now.Month, 1);
            var debutM1 = debutMoisActuel.AddMonths(-1);
            var debutM2 = debutMoisActuel.AddMonths(-2);
            var debutM3 = debutMoisActuel.AddMonths(-3);

            var lignes = await _context.Commandes
                .Where(c => c.DateCommande >= debutM3)
                .SelectMany(c => c.Lignes.Select(l => new { c.DateCommande, l.IdProduit, l.IdVehicule, l.Quantite }))
                .ToListAsync();

            var produits = await _context.Produits.AsNoTracking()
                .Include(p => p.Categorie)
                .Select(p => new { p.IdProduit, p.Reference, p.Designation, p.QuantiteStock, p.SeuilAlerte, categorieNom = p.Categorie.NomCategorie })
                .ToListAsync();

            var vehicules = await _context.Vehicules.AsNoTracking()
                .Select(v => new { v.IdVehicule, v.Marque, v.Modele, v.AnneeDebut, v.AnneeFin })
                .ToListAsync();

            int QteMoisProduit(int idProduit, DateTime debut, DateTime fin) =>
                lignes.Where(l => l.IdProduit == idProduit && l.DateCommande >= debut && l.DateCommande < fin).Sum(l => l.Quantite);

            int QteMoisVehicule(int idVehicule, DateTime debut, DateTime fin) =>
                lignes.Where(l => l.IdVehicule == idVehicule && l.DateCommande >= debut && l.DateCommande < fin).Sum(l => l.Quantite);

            var previsions = produits.Select(p =>
            {
                var m1 = QteMoisProduit(p.IdProduit, debutM1, debutMoisActuel);
                var m2 = QteMoisProduit(p.IdProduit, debutM2, debutM1);
                var m3 = QteMoisProduit(p.IdProduit, debutM3, debutM2);

                // Recent months count more: 50% last month, 30% two months ago, 20% three months ago.
                var predicted = (int)Math.Round(m1 * 0.5 + m2 * 0.3 + m3 * 0.2, MidpointRounding.AwayFromZero);
                var achatRecommande = Math.Max(0, predicted + p.SeuilAlerte - p.QuantiteStock);
                var tendance = m1 > m2 ? "hausse" : m1 < m2 ? "baisse" : "stable";

                return new
                {
                    p.IdProduit,
                    p.Reference,
                    p.Designation,
                    p.categorieNom,
                    p.QuantiteStock,
                    p.SeuilAlerte,
                    quantiteMoisDernier = m1,
                    quantiteMoisPrecedent = m2,
                    quantiteMoisAnterieur = m3,
                    quantitePrevue = predicted,
                    achatRecommande,
                    tendance
                };
            })
            .Where(p => p.quantiteMoisDernier > 0 || p.quantiteMoisPrecedent > 0 || p.quantiteMoisAnterieur > 0 || p.achatRecommande > 0)
            .OrderByDescending(p => p.achatRecommande)
            .ToList();

            // Vehicules carry no stock/seuil concept (they're a compatibility catalog, not
            // consumable inventory), so there is no "current stock" to subtract — the
            // recommended purchase quantity is simply the predicted demand itself.
            var previsionsVehicules = vehicules.Select(v =>
            {
                var m1 = QteMoisVehicule(v.IdVehicule, debutM1, debutMoisActuel);
                var m2 = QteMoisVehicule(v.IdVehicule, debutM2, debutM1);
                var m3 = QteMoisVehicule(v.IdVehicule, debutM3, debutM2);

                var predicted = (int)Math.Round(m1 * 0.5 + m2 * 0.3 + m3 * 0.2, MidpointRounding.AwayFromZero);
                var tendance = m1 > m2 ? "hausse" : m1 < m2 ? "baisse" : "stable";

                return new
                {
                    v.IdVehicule,
                    v.Marque,
                    v.Modele,
                    v.AnneeDebut,
                    v.AnneeFin,
                    quantiteMoisDernier = m1,
                    quantiteMoisPrecedent = m2,
                    quantiteMoisAnterieur = m3,
                    quantitePrevue = predicted,
                    achatRecommande = predicted,
                    tendance
                };
            })
            .Where(v => v.quantiteMoisDernier > 0 || v.quantiteMoisPrecedent > 0 || v.quantiteMoisAnterieur > 0)
            .OrderByDescending(v => v.achatRecommande)
            .ToList();

            return Ok(new
            {
                moisPrevu = debutMoisActuel.ToString("MMMM yyyy", new System.Globalization.CultureInfo("fr-FR")),
                totalQuantitePrevue = previsions.Sum(p => p.quantitePrevue),
                totalAchatRecommande = previsions.Sum(p => p.achatRecommande),
                produits = previsions,
                totalQuantitePrevueVehicules = previsionsVehicules.Sum(v => v.quantitePrevue),
                vehicules = previsionsVehicules
            });
        }

        // ==========================================
        // DASHBOARD (role-aware summary)
        // ==========================================

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            if (IsAdmin())
            {
                return Ok(new
                {
                    role = "ADMIN",
                    totalProduits = await _context.Produits.CountAsync(),
                    totalVehicules = await _context.Vehicules.CountAsync(),
                    totalFournisseurs = await _context.Fournisseurs.CountAsync(),
                    totalCommandes = await _context.Commandes.CountAsync(),
                    commandesEnAttente = await _context.Commandes.CountAsync(c => c.Statut == "En attente"),
                    produitsStockFaible = await _context.Produits.CountAsync(p => p.QuantiteStock <= p.SeuilAlerte),
                    dernieresCommandes = await _context.Commandes.AsNoTracking()
                        .Include(c => c.Fournisseur).ThenInclude(f => f.Utilisateur)
                        .OrderByDescending(c => c.DateCommande).Take(5)
                        .Select(c => new { c.IdCommande, c.DateCommande, c.Statut, c.MontantTotal, fournisseurNom = c.Fournisseur.Utilisateur.Nom + " " + c.Fournisseur.Utilisateur.Prenom })
                        .ToListAsync()
                });
            }

            var userId = CurrentUserId();
            return Ok(new
            {
                role = "FOURNISSEUR",
                totalCommandes = await _context.Commandes.CountAsync(c => c.IdFournisseur == userId),
                commandesEnAttente = await _context.Commandes.CountAsync(c => c.IdFournisseur == userId && c.Statut == "En attente"),
                montantTotal = await _context.Commandes.Where(c => c.IdFournisseur == userId).SumAsync(c => (decimal?)c.MontantTotal) ?? 0m,
                notificationsNonLues = await _context.Notifications.CountAsync(n => n.IdUtilisateur == userId && !n.Lue),
                dernieresCommandes = await _context.Commandes.AsNoTracking()
                    .Where(c => c.IdFournisseur == userId)
                    .OrderByDescending(c => c.DateCommande).Take(5)
                    .Select(c => new { c.IdCommande, c.DateCommande, c.Statut, c.MontantTotal })
                    .ToListAsync()
            });
        }

        // ==========================================
        // HELPERS
        // ==========================================

        private async Task NotifyAllAdmins(string type, string message)
        {
            var adminIds = await _context.Administrateurs.Select(a => a.IdUtilisateur).ToListAsync();
            foreach (var id in adminIds)
                _context.Notifications.Add(new Notification { IdUtilisateur = id, TypeNotification = type, Message = message, Lue = false, DateEnvoi = DateTime.Now });
            await _context.SaveChangesAsync();
        }

        private async Task NotifyUser(int idUtilisateur, string type, string message)
        {
            _context.Notifications.Add(new Notification { IdUtilisateur = idUtilisateur, TypeNotification = type, Message = message, Lue = false, DateEnvoi = DateTime.Now });
            await _context.SaveChangesAsync();
        }
    }

    public class ProduitRequest
    {
        public string Reference { get; set; } = "";
        public string Designation { get; set; } = "";
        public string? Description { get; set; }
        public decimal PrixUnitaire { get; set; }
        public int QuantiteStock { get; set; }
        public int SeuilAlerte { get; set; }
        public int IdCategorie { get; set; }
    }
    public class VehiculeRequest { public string Marque { get; set; } = ""; public string Modele { get; set; } = ""; public int AnneeDebut { get; set; } public int AnneeFin { get; set; } public decimal PrixUnitaire { get; set; } }
    public class LigneRequest { public int? IdProduit { get; set; } public int? IdVehicule { get; set; } public int Quantite { get; set; } }
    public class CommandeRequest { public List<LigneRequest> Lignes { get; set; } = new(); }
    public class StatutRequest { public string Statut { get; set; } = ""; }
}
