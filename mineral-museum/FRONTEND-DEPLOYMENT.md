# Mineral Museum Frontend Deployment

## Architecture

```
┌─────────────────────────────────────────┐
│     Traefik Ingress (192.168.1.128)     │
├─────────────────────────────────────────┤
│  /           → Frontend (Nginx)          │
│  /minerals   → Directus API/Admin       │
└─────────────────────────────────────────┘
```

## Deployed Components

### Frontend
- **Service**: Nginx serving static HTML/CSS/JS
- **Path**: `http://192.168.1.128/`
- **Port**: 80
- **Resources**: Lightweight (50m CPU, 64Mi RAM)

### Directus API
- **Service**: Directus CMS
- **Path**: `http://192.168.1.128/minerals`
- **Port**: 8055

## Files

- `frontend-configmap.yaml` - HTML files (index.html, add.html)
- `frontend-css-configmap.yaml` - CSS styling
- `frontend-js-configmap.yaml` - JavaScript (app.js, add.js)
- `frontend-deployment.yaml` - Nginx deployment and service
- `ingress.yaml` - Updated ingress routing

## Deployment

The application is automatically deployed by ArgoCD when changes are pushed to the git repository.

### Manual Deployment
```bash
kubectl apply -f frontend-configmap.yaml
kubectl apply -f frontend-css-configmap.yaml
kubectl apply -f frontend-js-configmap.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
```

### Check Status
```bash
kubectl get pods -n mineral-museum
kubectl get svc -n mineral-museum
kubectl get ingress -n mineral-museum
```

## Access

- **Frontend**: http://192.168.1.128/
- **Directus Admin**: http://192.168.1.128/minerals/admin

## Configuration Required

Before the frontend can write data, enable public permissions in Directus:

1. Login to admin: `http://192.168.1.128/minerals/admin`
2. Go to **Settings** → **Roles & Permissions** → **Public**
3. Enable permissions for `minerals` collection:
   - **Read**: ✓
   - **Create**: ✓
4. Enable permissions for **Files**:
   - **Read**: ✓
   - **Create**: ✓
5. Save changes

## Updates

To update the frontend:
1. Edit the ConfigMaps in git
2. Commit and push changes
3. ArgoCD will automatically sync the changes
4. Or manually trigger sync in ArgoCD UI

To force pod restart after ConfigMap changes:
```bash
kubectl rollout restart deployment/frontend -n mineral-museum
```
