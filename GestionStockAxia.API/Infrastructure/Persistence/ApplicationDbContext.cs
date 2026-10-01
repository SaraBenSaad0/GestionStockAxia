using GestionStockAxia.API.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GestionStockAxia.API.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Administrateur> Administrateurs { get; set; }
        public DbSet<Employe> Employes { get; set; }
        public DbSet<Fournisseur> Fournisseurs { get; set; }

        public DbSet<Categorie> Categories { get; set; }
        public DbSet<Vehicule> Vehicules { get; set; }
        public DbSet<Produit> Produits { get; set; }
        public DbSet<ProduitVehicule> ProduitVehicules { get; set; }

        public DbSet<Commande> Commandes { get; set; }
        public DbSet<LigneCommande> LignesCommande { get; set; }

        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationStock> NotificationsStock { get; set; }
        public DbSet<NotificationCommande> NotificationsCommande { get; set; }

        public DbSet<Prevision> Previsions { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            // ==========================================
            // UTILISATEUR
            // ==========================================

            modelBuilder.Entity<Utilisateur>()
                .ToTable("Utilisateurs");

            modelBuilder.Entity<Utilisateur>()
                .HasKey(u => u.IdUtilisateur);

            modelBuilder.Entity<Utilisateur>()
                .Property(u => u.Nom)
                .IsRequired();

            modelBuilder.Entity<Utilisateur>()
                .Property(u => u.Prenom)
                .IsRequired();

            modelBuilder.Entity<Utilisateur>()
                .Property(u => u.Email)
                .IsRequired();

            modelBuilder.Entity<Utilisateur>()
                .HasIndex(u => u.Email)
                .IsUnique();


            // ==========================================
            // ADMINISTRATEUR
            // ==========================================

            modelBuilder.Entity<Administrateur>()
                .ToTable("Administrateurs");

            modelBuilder.Entity<Administrateur>()
                .HasKey(a => a.IdUtilisateur);

            modelBuilder.Entity<Administrateur>()
                .HasOne(a => a.Utilisateur)
                .WithOne(u => u.Administrateur)
                .HasForeignKey<Administrateur>(a => a.IdUtilisateur)
                .OnDelete(DeleteBehavior.Cascade);


            // ==========================================
            // EMPLOYE
            // ==========================================

            modelBuilder.Entity<Employe>()
                .ToTable("Employes");

            modelBuilder.Entity<Employe>()
                .HasKey(e => e.IdUtilisateur);

            modelBuilder.Entity<Employe>()
                .HasOne(e => e.Utilisateur)
                .WithOne(u => u.Employe)
                .HasForeignKey<Employe>(e => e.IdUtilisateur)
                .OnDelete(DeleteBehavior.Cascade);


            // ==========================================
            // FOURNISSEUR
            // ==========================================

            modelBuilder.Entity<Fournisseur>()
                .ToTable("Fournisseurs");

            modelBuilder.Entity<Fournisseur>()
                .HasKey(f => f.IdUtilisateur);

            modelBuilder.Entity<Fournisseur>()
                .HasOne(f => f.Utilisateur)
                .WithOne(u => u.Fournisseur)
                .HasForeignKey<Fournisseur>(f => f.IdUtilisateur)
                .OnDelete(DeleteBehavior.Cascade);


            // ==========================================
            // CATEGORIE
            // ==========================================

            modelBuilder.Entity<Categorie>()
                .ToTable("Categories");

            modelBuilder.Entity<Categorie>()
                .HasKey(c => c.IdCategorie);


            // ==========================================
            // VEHICULE
            // ==========================================

            modelBuilder.Entity<Vehicule>()
                .ToTable("Vehicules");

            modelBuilder.Entity<Vehicule>()
                .HasKey(v => v.IdVehicule);


            // ==========================================
            // PRODUIT
            // ==========================================

            modelBuilder.Entity<Produit>()
                .ToTable("Produits");

            modelBuilder.Entity<Produit>()
                .HasKey(p => p.IdProduit);

            modelBuilder.Entity<Produit>()
                .HasOne(p => p.Categorie)
                .WithMany(c => c.Produits)
                .HasForeignKey(p => p.IdCategorie)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Produit>()
                .Property(p => p.PrixUnitaire)
                .HasPrecision(10, 2);


            // ==========================================
            // PRODUIT - VEHICULE
            // ==========================================

            modelBuilder.Entity<ProduitVehicule>()
                .ToTable("ProduitVehicules");

            modelBuilder.Entity<ProduitVehicule>()
                .HasKey(pv => new
                {
                    pv.IdProduit,
                    pv.IdVehicule
                });

            modelBuilder.Entity<ProduitVehicule>()
                .HasOne(pv => pv.Produit)
                .WithMany(p => p.ProduitVehicules)
                .HasForeignKey(pv => pv.IdProduit)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProduitVehicule>()
                .HasOne(pv => pv.Vehicule)
                .WithMany(v => v.ProduitVehicules)
                .HasForeignKey(pv => pv.IdVehicule)
                .OnDelete(DeleteBehavior.Cascade);


            // ==========================================
            // COMMANDE
            // ==========================================

            modelBuilder.Entity<Commande>()
                .ToTable("Commandes");

            modelBuilder.Entity<Commande>()
                .HasKey(c => c.IdCommande);

            modelBuilder.Entity<Commande>()
                .HasOne(c => c.Fournisseur)
                .WithMany(f => f.Commandes)
                .HasForeignKey(c => c.IdFournisseur)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Commande>()
                .Property(c => c.MontantTotal)
                .HasPrecision(12, 2);


            // ==========================================
            // LIGNE COMMANDE
            // ==========================================

            modelBuilder.Entity<LigneCommande>()
                .ToTable("LignesCommande");

            modelBuilder.Entity<LigneCommande>()
                .HasKey(l => l.IdLigne);

            modelBuilder.Entity<LigneCommande>()
                .HasOne(l => l.Commande)
                .WithMany(c => c.Lignes)
                .HasForeignKey(l => l.IdCommande)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LigneCommande>()
                .HasOne(l => l.Produit)
                .WithMany(p => p.LignesCommande)
                .HasForeignKey(l => l.IdProduit)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LigneCommande>()
                .HasOne(l => l.Vehicule)
                .WithMany(v => v.LignesCommande)
                .HasForeignKey(l => l.IdVehicule)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LigneCommande>()
                .Property(l => l.PrixUnitaire)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Vehicule>()
                .Property(v => v.PrixUnitaire)
                .HasPrecision(10, 2);


            // ==========================================
            // NOTIFICATION
            // ==========================================

            modelBuilder.Entity<Notification>()
                .ToTable("Notifications");

            modelBuilder.Entity<Notification>()
                .HasKey(n => n.IdNotification);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Utilisateur)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.IdUtilisateur)
                .OnDelete(DeleteBehavior.Restrict);


            // ==========================================
            // NOTIFICATION STOCK
            // ==========================================

            modelBuilder.Entity<NotificationStock>()
                .ToTable("NotificationsStock");

            modelBuilder.Entity<NotificationStock>()
                .HasKey(ns => ns.IdNotification);

            modelBuilder.Entity<NotificationStock>()
                .HasOne(ns => ns.Notification)
                .WithOne()
                .HasForeignKey<NotificationStock>(ns => ns.IdNotification)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<NotificationStock>()
                .HasOne(ns => ns.Produit)
                .WithMany()
                .HasForeignKey(ns => ns.IdProduit)
                .OnDelete(DeleteBehavior.Restrict);


            // ==========================================
            // NOTIFICATION COMMANDE
            // ==========================================

            modelBuilder.Entity<NotificationCommande>()
                .ToTable("NotificationsCommande");

            modelBuilder.Entity<NotificationCommande>()
                .HasKey(nc => nc.IdNotification);

            modelBuilder.Entity<NotificationCommande>()
                .HasOne(nc => nc.Notification)
                .WithOne()
                .HasForeignKey<NotificationCommande>(nc => nc.IdNotification)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<NotificationCommande>()
                .HasOne(nc => nc.Commande)
                .WithMany()
                .HasForeignKey(nc => nc.IdCommande)
                .OnDelete(DeleteBehavior.Restrict);


            // ==========================================
            // PREVISION
            // ==========================================

            modelBuilder.Entity<Prevision>()
                .ToTable("Previsions");

            modelBuilder.Entity<Prevision>()
                .HasKey(p => p.IdPrevision);

            modelBuilder.Entity<Prevision>()
                .HasOne(p => p.Produit)
                .WithMany(p => p.Previsions)
                .HasForeignKey(p => p.IdProduit)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Prevision>()
                .Property(p => p.Fiabilite)
                .HasPrecision(5, 2);
        }
    }
}