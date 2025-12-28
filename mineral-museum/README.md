# Digital Mineral Museum - Self-Hosted Platform

A complete self-hosted solution for cataloging and managing a personal mineral collection using Kubernetes, PostgreSQL, and Directus CMS.

## 🎯 Project Overview

**Goal:** Build a beautiful, easy-to-use platform for cataloging minerals with high-resolution photos, detailed metadata, and visual dashboards.

**Target User:** Non-technical end-user requiring a polished, "No-Code" interface.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Traefik Ingress                     │
│         minerals.lan                        │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────┐
│         Directus CMS                      │
│   (Admin UI + API + Asset Management)     │
│         Port: 8055                        │
└─────────┬─────────────────┬───────────────┘
          │                 │
          ▼                 ▼
┌─────────────────┐  ┌──────────────────┐
│   PostgreSQL    │  │  File Storage    │
│   Database      │  │  (PVC 20GB)      │
│   (Bitnami)     │  │  High-res Photos │
└─────────────────┘  └──────────────────┘
```

## 📦 Tech Stack

- **Orchestration:** K3s (Kubernetes)
- **GitOps:** ArgoCD (Continuous Delivery)
- **Database:** PostgreSQL 15 (Bitnami Helm Chart)
- **CMS:** Directus (Headless CMS with Admin UI)
- **Storage:** Persistent Volume Claims (local-path)
- **Ingress:** Traefik (minerals.lan)

## 🚀 Deployment

### Prerequisites

1. K3s cluster running
2. ArgoCD installed and configured
3. GitHub repository access configured in ArgoCD
4. Local DNS or /etc/hosts entry for `minerals.lan`

### Quick Start

1. **Generate security keys:**
```bash
# Generate encryption keys for Directus
echo "KEY=$(openssl rand -base64 32)"
echo "SECRET=$(openssl rand -base64 32)"
```

2. **Update secrets:**
Edit `mineral-museum/secret.yaml` and replace:
   - `KEY` and `SECRET` with generated values
   - Database passwords
   - Admin credentials

3. **Deploy via ArgoCD:**
```bash
# Apply ArgoCD applications
kubectl apply -f argocd-apps/mineral-museum-apps.yaml

# Watch deployment
kubectl get applications -n argocd -w
```

4. **Configure local DNS:**
```bash
# Add to /etc/hosts on your computer
echo "192.168.1.128 minerals.lan" | sudo tee -a /etc/hosts
```

5. **Access Directus:**
   - URL: http://minerals.lan
   - Default credentials: See `secret.yaml`

## 📊 Data Model: Mineral Collection

### Collection Schema

The Directus data model for minerals includes:

**Collection Name:** `minerals`

**Fields:**

| Field Name | Type | Description | Required |
|------------|------|-------------|----------|
| `name` | String | Common name of the mineral | ✅ |
| `scientific_name` | String | Scientific/mineralogical name | ✅ |
| `photos` | File (Multiple) | High-resolution images | ✅ |
| `mohs_hardness` | Decimal | Mohs hardness scale (1-10) | ❌ |
| `color` | String | Primary color(s) | ❌ |
| `origin_location` | String | Where the specimen was found | ❌ |
| `acquisition_date` | Date | When acquired | ❌ |
| `acquisition_source` | String | Where purchased/found | ❌ |
| `weight_grams` | Decimal | Weight in grams | ❌ |
| `dimensions` | String | Size (e.g., "5cm x 3cm x 2cm") | ❌ |
| `crystal_system` | Dropdown | Crystal structure type | ❌ |
| `chemical_formula` | String | Chemical composition | ❌ |
| `luster` | Dropdown | Surface appearance | ❌ |
| `transparency` | Dropdown | Transparent/translucent/opaque | ❌ |
| `specific_gravity` | Decimal | Density measurement | ❌ |
| `streak` | String | Streak color | ❌ |
| `notes` | Text (Rich) | Additional observations | ❌ |
| `tags` | Tags | Category tags | ❌ |
| `featured` | Boolean | Highlight in gallery | ❌ |
| `display_location` | String | Where stored/displayed | ❌ |

### Dropdown Options

**Crystal System:**
- Cubic
- Hexagonal
- Tetragonal
- Orthorhombic
- Monoclinic
- Triclinic
- Amorphous

**Luster:**
- Metallic
- Vitreous (Glassy)
- Pearly
- Silky
- Greasy
- Dull
- Adamantine (Diamond-like)

**Transparency:**
- Transparent
- Translucent
- Opaque

## 🎨 User Interface Setup

### Step 1: Create the Minerals Collection

1. Log into Directus (http://minerals.lan)
2. Go to **Settings** → **Data Model**
3. Click **Create Collection**
4. Name: `minerals`
5. Add all fields from the schema above

### Step 2: Configure Gallery View

1. Go to the **Minerals** collection
2. Click **Layout Options** (top right)
3. Select **Cards** layout
4. Configure:
   - **Image Source:** `photos`
   - **Title:** `name`
   - **Subtitle:** `scientific_name`
   - **Image Fit:** Cover
   - **Size:** Large

### Step 3: Create Insights Dashboard

1. Go to **Insights** in the sidebar
2. Click **Create Dashboard**: "Mineral Collection Overview"
3. Add panels:

**Panel 1: Collection Statistics**
- Type: Metric
- Collection: minerals
- Function: Count
- Title: "Total Minerals"

**Panel 2: By Color**
- Type: Bar Chart
- Collection: minerals
- Group By: color
- Function: Count
- Title: "Minerals by Color"

**Panel 3: Hardness Distribution**
- Type: Line Chart
- Collection: minerals
- X-Axis: mohs_hardness
- Function: Count
- Title: "Mohs Hardness Distribution"

**Panel 4: Origin Map** (if locations have coordinates)
- Type: Map
- Collection: minerals
- Location Field: origin_location
- Title: "Collection Origins"

**Panel 5: Recent Additions**
- Type: List
- Collection: minerals
- Sort: acquisition_date (DESC)
- Limit: 10
- Display: name, photos, acquisition_date

### Step 4: Create Public Gallery (Optional)

1. Go to **Settings** → **Roles & Permissions**
2. Select **Public** role
3. Enable **Read** access for `minerals` collection
4. Configure file access for `directus_files`

## 📁 File Structure

```
homelab-gitops/mineral-museum/
├── namespace.yaml              # Kubernetes namespace
├── secret.yaml                 # Directus & DB credentials
├── pvc.yaml                    # Storage for uploads (20GB)
├── postgres-values.yaml        # PostgreSQL Helm values
├── directus-deployment.yaml    # Directus app deployment
├── ingress.yaml               # Traefik ingress config
└── README.md                  # This file

argocd-apps/
└── mineral-museum-apps.yaml   # ArgoCD applications
```

## 🔧 Management Commands

### View Application Status
```bash
kubectl get applications -n argocd | grep mineral
```

### Check Pod Status
```bash
kubectl get pods -n mineral-museum
```

### View Directus Logs
```bash
kubectl logs -n mineral-museum -l app=directus -f
```

### Access PostgreSQL
```bash
kubectl port-forward -n mineral-museum svc/mineral-museum-postgresql 5432:5432
# Connect with: psql -h localhost -U directus -d mineral_museum
```

### Restart Directus
```bash
kubectl rollout restart deployment/directus -n mineral-museum
```

### Check Storage Usage
```bash
kubectl get pvc -n mineral-museum
```

## 🔐 Security Considerations

### Initial Setup (MUST DO):

1. **Change all default passwords** in `secret.yaml`:
   - `ADMIN_PASSWORD`
   - `DB_PASSWORD`
   - `postgresPassword`

2. **Generate unique encryption keys:**
   ```bash
   kubectl create secret generic directus-secrets \
     --from-literal=KEY=$(openssl rand -base64 32) \
     --from-literal=SECRET=$(openssl rand -base64 32) \
     -n mineral-museum --dry-run=client -o yaml
   ```

3. **Seal secrets** (optional but recommended):
   - Consider using Sealed Secrets or External Secrets Operator
   - Don't commit real passwords to Git

### Ongoing Security:

- Regular database backups
- Keep Directus and PostgreSQL updated
- Restrict network access (use NetworkPolicies)
- Enable HTTPS with cert-manager + Let's Encrypt

## 💾 Backup Strategy

### Database Backup
```bash
# Create backup
kubectl exec -n mineral-museum mineral-museum-postgresql-0 -- \
  pg_dump -U directus mineral_museum > mineral_museum_$(date +%Y%m%d).sql

# Restore backup
cat backup.sql | kubectl exec -i -n mineral-museum mineral-museum-postgresql-0 -- \
  psql -U directus -d mineral_museum
```

### File Storage Backup
```bash
# Find PVC location
kubectl get pv | grep directus-uploads

# Backup uploads (adjust path based on PV)
sudo tar -czf uploads_backup_$(date +%Y%m%d).tar.gz \
  /var/lib/rancher/k3s/storage/<pvc-volume-id>
```

## 🐛 Troubleshooting

### Directus won't start
```bash
# Check logs
kubectl logs -n mineral-museum -l app=directus

# Common issues:
# 1. Database not ready - wait for PostgreSQL to be healthy
# 2. Secret keys not set - check secret.yaml
# 3. Database connection failed - verify credentials
```

### Can't access minerals.lan
```bash
# Check ingress
kubectl get ingress -n mineral-museum

# Verify Traefik is running
kubectl get svc -n kube-system traefik

# Test service directly
kubectl port-forward -n mineral-museum svc/directus 8055:8055
# Access: http://localhost:8055
```

### Database connection errors
```bash
# Check PostgreSQL is running
kubectl get pods -n mineral-museum | grep postgres

# Test connection
kubectl exec -it -n mineral-museum mineral-museum-postgresql-0 -- \
  psql -U directus -d mineral_museum -c "SELECT 1;"
```

## 📚 Additional Resources

- [Directus Documentation](https://docs.directus.io/)
- [Directus Data Model Guide](https://docs.directus.io/configuration/data-model/)
- [PostgreSQL Bitnami Chart](https://github.com/bitnami/charts/tree/main/bitnami/postgresql)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)

## 🎓 User Guide for Non-Technical Users

### Adding a New Mineral

1. Go to http://minerals.lan
2. Click **Minerals** in the sidebar
3. Click **Create Item** (+)
4. Fill in the form:
   - Upload photos (drag & drop)
   - Enter name and scientific name
   - Fill in any known details
5. Click **Save**

### Viewing the Gallery

1. Go to **Minerals** collection
2. Switch to **Cards** view (icon in top right)
3. Browse your collection visually
4. Click any card to see full details

### Using the Dashboard

1. Click **Insights** in the sidebar
2. View statistics and charts
3. See recent additions
4. Explore collection by categories

---

**Built with ❤️ for mineral enthusiasts**
