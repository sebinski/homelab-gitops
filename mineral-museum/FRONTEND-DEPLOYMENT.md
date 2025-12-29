# Mineral Museum Frontend Deployment

## ✅ Deployment Complete

The frontend is now deployed and accessible!

## Access URLs

- **Frontend (Main Page)**: http://192.168.1.128/
- **Add Mineral Page**: http://192.168.1.128/add.html
- **Directus Admin**: http://192.168.1.128/minerals/admin
- **Directus API**: http://192.168.1.128/minerals/items/minerals

## Architecture

```
┌─────────────────────────────────────────┐
│     Traefik Ingress (192.168.1.128)     │
├─────────────────────────────────────────┤
│  /           → Frontend (Nginx)          │ Priority: 200
│  /minerals   → Directus API/Admin       │ Priority: 300 (with stripprefix)
└─────────────────────────────────────────┘
```

## Deployed Components

### Frontend
- **Service**: Nginx serving static HTML/CSS/JS
- **Path**: `http://192.168.1.128/`
- **Port**: 80
- **Resources**: Lightweight (50m CPU, 64Mi RAM)
- **ConfigMap**: `frontend-files` (contains all HTML/CSS/JS)

### Directus API
- **Service**: Directus CMS
- **Path**: `http://192.168.1.128/minerals`
- **Port**: 8055
- **Middleware**: stripprefix-minerals (removes /minerals prefix)

## Files

- `frontend-configmap.yaml` - Single ConfigMap with all frontend files
- `frontend-deployment.yaml` - Nginx deployment and service
- `ingress.yaml` - Ingress routing for both frontend and API
- `frontend/` - Source files (for reference/editing)

## GitOps with ArgoCD

The application is automatically deployed by ArgoCD when changes are pushed to the git repository.

**ArgoCD Application**: `mineral-museum-directus`
- **Repo**: https://github.com/sebinski/homelab-gitops.git
- **Path**: `mineral-museum`
- **Auto-sync**: Enabled
- **Self-heal**: Enabled

## Configuration Required (One-Time)

Before the frontend can create/read data, enable public permissions in Directus:

1. Login to admin: http://192.168.1.128/minerals/admin
2. Go to **Settings** → **Roles & Permissions** → **Public**
3. Enable permissions for `minerals` collection:
   - ✓ **Read**
   - ✓ **Create**
4. Enable permissions for **Directus Files**:
   - ✓ **Read**
   - ✓ **Create**
5. Save changes

## Updating the Frontend

### Method 1: Edit ConfigMap (Recommended for GitOps)
1. Edit `mineral-museum/frontend-configmap.yaml` in git
2. Commit and push changes
3. ArgoCD will automatically sync
4. Restart pods to apply changes:
   ```bash
   kubectl rollout restart deployment/frontend -n mineral-museum
   ```

### Method 2: Edit Source Files
1. Edit files in `mineral-museum/frontend/`
2. Copy changes to `frontend-configmap.yaml`
3. Commit and push
4. Restart deployment

## Useful Commands

```bash
# Check deployment status
kubectl get pods -n mineral-museum
kubectl get svc -n mineral-museum
kubectl get ingress -n mineral-museum

# View frontend logs
kubectl logs -n mineral-museum -l app=frontend

# Restart frontend (after ConfigMap changes)
kubectl rollout restart deployment/frontend -n mineral-museum

# Force ArgoCD sync
kubectl patch app mineral-museum-directus -n argocd -p '{"metadata": {"annotations": {"argocd.argoproj.io/refresh": "normal"}}}' --type merge

# Test endpoints
curl http://192.168.1.128/
curl http://192.168.1.128/minerals/items/minerals
```

## Troubleshooting

### Frontend not loading
```bash
kubectl logs -n mineral-museum -l app=frontend
kubectl describe pod -n mineral-museum -l app=frontend
```

### API returning errors
- Check Directus pod: `kubectl logs -n mineral-museum -l app=directus`
- Verify PUBLIC_ENABLED is set in Directus deployment
- Check public permissions in Directus admin

### Changes not applying
- Verify ArgoCD sync status: `kubectl get app mineral-museum-directus -n argocd`
- Manually restart: `kubectl rollout restart deployment/frontend -n mineral-museum`

## Features

✅ **View Collection**: Beautiful card-based grid showing all minerals
✅ **Add Minerals**: Form with photo upload capability
✅ **Responsive Design**: Works on desktop and mobile
✅ **No Authentication**: Public access enabled for read/create
✅ **GitOps Deployment**: Managed by ArgoCD
✅ **Automatic Sync**: Changes in git automatically deployed
