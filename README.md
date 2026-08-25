# Green Legacy Initiative

Site public de Green Legacy Initiative, une organisation basée à Genève qui agit avec les écoles et les communautés en Côte d’Ivoire pour restaurer les forêts et les mangroves.

## Ce qui est inclus

- Page publique responsive avec les récits, programmes, projets, FAQ et appel aux dons.
- Contenu éditorial séparé dans `src/content/` sous forme de Markdown.
- Interface Decap CMS disponible à `/admin/`.
- Formulaires contact, bénévolat et newsletter réellement enregistrés dans PostgreSQL via l’API partagée.
- Résumé d’impact et lien de don configurables par variables d’environnement.
- `sitemap.xml`, `robots.txt`, métadonnées Open Graph et données structurées SEO.
- Configuration Netlify dans `netlify.toml` et workflow GitHub Pages dans `.github/workflows/deploy.yml`.

## Développement dans Replit

```bash
pnpm --filter @workspace/green-legacy-initiative run dev
```

Le site utilise l’API partagée montée sur `/api`. Le serveur API et la base PostgreSQL doivent être démarrés pour que les formulaires fonctionnent.

## Configuration de l’API

Les valeurs suivantes sont optionnelles en développement, mais doivent être définies avant de présenter le site publiquement :

```bash
GREEN_LEGACY_DONATION_URL=https://votre-lien-de-don.example
GREEN_LEGACY_CONTACT_EMAIL=bonjour@votre-domaine.example
GREEN_LEGACY_TREES_PLANTED=120000
GREEN_LEGACY_HECTARES_RESTORED=240
GREEN_LEGACY_SCHOOLS_ENGAGED=18
GREEN_LEGACY_SURVIVAL_RATE=85
```

Les trois formulaires créent des enregistrements dans la table `green_legacy_submissions`. Pour consulter les demandes, utilisez la base de données de développement ou ajoutez une interface privée séparée.

## Decap CMS

Le fichier `public/admin/config.yml` pointe vers `src/content/` et `public/images`. Pour que les modifications depuis `/admin/` soient enregistrées dans Git, le dépôt doit activer Netlify Identity + Git Gateway, ou un backend OAuth compatible Decap CMS. L’interface est prête, mais l’authentification Git dépend du fournisseur de déploiement choisi.

## Déploiement statique

Le build Vite produit `dist/public`.

- **Netlify** : le fichier `netlify.toml` contient la commande et le dossier de publication.
- **GitHub Pages** : le workflow publie automatiquement à chaque push sur `main`.

Les formulaires nécessitent que l’API soit accessible depuis le domaine statique. Définissez `VITE_API_BASE_URL` dans Netlify ou dans les variables GitHub Actions avec l’URL publique de l’API. Sans cette variable, le frontend utilise `/api` sur le même domaine, ce qui convient au déploiement Replit avec l’API partagée.