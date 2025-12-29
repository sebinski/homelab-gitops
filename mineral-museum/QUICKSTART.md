# Digital Mineral Museum - Quick Reference

## Project Status: ✅ DEPLOYED & RUNNING

### Access
- **Frontend:** http://192.168.1.128/
- **Add Minerals:** http://192.168.1.128/add.html
- **Directus Admin:** http://192.168.1.128/minerals/admin
- **API Endpoint:** http://192.168.1.128/minerals/items/minerals
- **Server IP:** 192.168.1.128
- **Credentials:** Set in `secret.yaml`

### Infrastructure Components

| Component | Status | Details |
|-----------|--------|---------|
| **Frontend** | ✅ Running | Nginx static frontend served at `/` |
| **PostgreSQL** | ✅ Running | Bitnami chart 18.1.13, 5GB storage |
| **Directus CMS** | ✅ Running | Latest image, 20GB upload storage |
| **Ingress** | ✅ Configured | Traefik at 192.168.1.128 (`/` frontend, `/minerals` Directus) |
| **ArgoCD** | ✅ Synced | Auto-deploy from Git |

### Storage Volumes

| PVC | Size | Purpose |
|-----|------|---------|
| directus-uploads | 20GB | High-resolution mineral photos |
| postgres-data | 5GB | Database persistence |

### ArgoCD Applications

- `mineral-museum-postgres` - PostgreSQL database (Helm chart)
- `mineral-museum-directus` - Directus CMS (Git manifests)

Both configured with auto-sync and self-heal enabled.

### File Locations

```
homelab-gitops/
├── mineral-museum/
│   ├── README.md                   # Complete documentation
│   ├── QUICKSTART.md              # Quick reference
│   ├── FRONTEND-DEPLOYMENT.md     # Frontend setup guide
│   ├── namespace.yaml              # Kubernetes namespace
│   ├── secret.yaml                 # Credentials (change defaults!)
│   ├── pvc.yaml                    # Storage definitions
│   ├── postgres-values.yaml        # DB configuration
│   ├── directus-deployment.yaml    # CMS deployment
│   ├── ingress.yaml               # Traefik routing
│   ├── frontend-configmap.yaml    # Frontend files (HTML/CSS/JS)
│   ├── frontend-deployment.yaml   # Nginx deployment
│   └── frontend/                  # Frontend source files
│
└── argocd-apps/
    └── mineral-museum-apps.yaml   # ArgoCD applications
```

### Quick Commands

```bash
# View pods
kubectl get pods -n mineral-museum

# Check applications
kubectl get applications -n argocd | grep mineral

# View frontend logs
kubectl logs -n mineral-museum -l app=frontend -f

# View Directus logs
kubectl logs -n mineral-museum -l app=directus -f

# Restart Directus
kubectl rollout restart deployment/directus -n mineral-museum

# Restart frontend (after ConfigMap changes)
kubectl rollout restart deployment/frontend -n mineral-museum

# Access PostgreSQL
kubectl port-forward -n mineral-museum svc/mineral-museum-postgres-postgresql 5432:5432

# Check storage usage
kubectl get pvc -n mineral-museum

# Test API endpoint
curl http://192.168.1.128/minerals/items/minerals
```

### Data Model Highlights

**Collection Name:** `minerals`

**Key Fields:**
- `Nome` - Mineral name
- `Foto` - Single photo (asset)
- `Dimensioni` - e.g. "15x20"
- `Peso` - Weight in grams
- `Data_acquisizione` - Acquisition date
- `Note` - Notes

**UI Layouts:**
- **Gallery View:** Card layout with photo thumbnails
- **Dashboard:** Statistics, charts, and recent additions
- **Table View:** Detailed list with sorting/filtering

### Security Checklist

- [ ] Change Directus admin password
- [ ] Update PostgreSQL passwords in secret.yaml
- [ ] Generate new KEY and SECRET (openssl rand -base64 32)
- [ ] Consider enabling HTTPS with cert-manager
- [ ] Set up regular database backups
- [ ] Review and restrict public access if needed

### For Your Girlfriend (Non-Technical User)

**To Add a New Mineral:**
1. Go to http://192.168.1.128/add.html
2. Fill in the form (Nome is required)
3. Optionally upload a photo
4. Click "Salva Minerale"

**To Browse Your Collection:**
1. Click "Minerals" in the sidebar
2. Switch to "Cards" view (icon in top right)
3. Scroll through your beautiful gallery
4. Click any mineral to see full details

**To See Statistics:**
1. Click "Insights" in the sidebar
2. View charts showing your collection by:
   - Total count
   - Colors
   - Hardness
   - Origins

### Maintenance

**Backup Database:**
```bash
kubectl exec -n mineral-museum mineral-museum-postgres-postgresql-0 -- \
  pg_dump -U directus mineral_museum > backup_$(date +%Y%m%d).sql
```

**Backup Photos:**
Photos are stored in PVC at: `/var/lib/rancher/k3s/storage/<pvc-id>`

**Monitor Disk Space:**
```bash
kubectl get pvc -n mineral-museum
df -h /var/lib/rancher/k3s/storage/
```

### Troubleshooting

**Can't access the app?**
- Use the IP directly: http://192.168.1.128/
- Check ingress: `kubectl get ingress -n mineral-museum`
- Test direct access: `kubectl port-forward -n mineral-museum svc/directus 8055:8055`

**Directus not loading?**
- Check logs: `kubectl logs -n mineral-museum -l app=directus`
- Verify PostgreSQL is running: `kubectl get pods -n mineral-museum`

**ArgoCD not syncing?**
- Force refresh: `kubectl patch application mineral-museum-directus -n argocd --type merge -p '{"metadata": {"annotations": {"argocd.argoproj.io/refresh": "hard"}}}'`

---

**Project Created:** December 28, 2025
**Deployment Method:** GitOps with ArgoCD
**Managed by:** K3s Kubernetes Cluster

**Ready to catalog your mineral collection! 💎**
