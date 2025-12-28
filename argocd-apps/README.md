# ArgoCD Setup for Home Assistant

## Current Status

✅ ArgoCD Application created: `home-assistant`
⚠️ Requires GitHub authentication (repository is private)

## Authentication Setup Options

### Option 1: GitHub Personal Access Token (Recommended)

1. **Create a GitHub Personal Access Token:**
   - Go to: https://github.com/settings/tokens/new
   - Select scopes: `repo` (Full control of private repositories)
   - Generate token and copy it

2. **Add repository to ArgoCD:**
   ```bash
   kubectl apply -f - <<EOF
   apiVersion: v1
   kind: Secret
   metadata:
     name: repo-workspace
     namespace: argocd
     labels:
       argocd.argoproj.io/secret-type: repository
   stringData:
     type: git
     url: https://github.com/sebastiantansini/workspace.git
     password: YOUR_GITHUB_TOKEN_HERE
     username: sebastiantansini
   EOF
   ```

3. **Verify connection:**
   ```bash
   kubectl get applications -n argocd home-assistant
   ```

### Option 2: SSH Key Authentication

1. **Generate SSH key (if not exists):**
   ```bash
   ssh-keygen -t ed25519 -C "argocd@homelab" -f ~/.ssh/argocd_github -N ""
   ```

2. **Add SSH key to GitHub:**
   - Copy public key: `cat ~/.ssh/argocd_github.pub`
   - Add to: https://github.com/sebastiantansini/workspace/settings/keys

3. **Add SSH repository to ArgoCD:**
   ```bash
   kubectl create secret generic repo-workspace-ssh \
     --from-file=sshPrivateKey=$HOME/.ssh/argocd_github \
     -n argocd
   
   kubectl label secret repo-workspace-ssh \
     argocd.argoproj.io/secret-type=repository -n argocd
   
   kubectl annotate secret repo-workspace-ssh \
     managed-by=argocd.argoproj.io -n argocd
   ```

4. **Update ArgoCD Application to use SSH:**
   Update the `repoURL` in the application manifest to:
   ```yaml
   repoURL: git@github.com:sebastiantansini/workspace.git
   ```

### Option 3: Make Repository Public

1. Go to: https://github.com/sebastiantansini/workspace/settings
2. Scroll to "Danger Zone"
3. Click "Change visibility" → "Make public"
4. ArgoCD will automatically sync

## Quick Setup Script

Save this as `setup-argocd-github.sh`:

```bash
#!/bin/bash

echo "Enter your GitHub Personal Access Token:"
read -s GITHUB_TOKEN

kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: repo-workspace
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  type: git
  url: https://github.com/sebastiantansini/workspace.git
  password: ${GITHUB_TOKEN}
  username: sebastiantansini
EOF

echo ""
echo "✅ Repository credentials configured!"
echo "ArgoCD will now sync automatically."
echo ""
echo "Check status:"
echo "kubectl get applications -n argocd home-assistant"
```

Make it executable: `chmod +x setup-argocd-github.sh`

## ArgoCD Configuration

The ArgoCD Application is configured with:

- **Auto-Sync:** Enabled - automatically deploys changes from Git
- **Self-Heal:** Enabled - automatically corrects manual changes to match Git
- **Prune:** Enabled - removes resources deleted from Git
- **Sync Interval:** Default 3 minutes

### View ArgoCD UI

```bash
# Port forward to access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access: https://localhost:8080
# Username: admin
# Password: (from command above)
```

## How It Works

1. **You push changes** to GitHub (homelab-gitops/home-assistant/)
2. **ArgoCD detects changes** (every 3 minutes or on webhook)
3. **ArgoCD syncs** the cluster state to match Git
4. **Home Assistant pods** automatically restart with new configuration

## Automatic Image Updates

The Home Assistant deployment uses `image: ghcr.io/home-assistant/home-assistant:latest` with `imagePullPolicy: Always`.

This means:
- ✅ K8s will pull the latest image on pod restart
- ⚠️ ArgoCD won't detect image changes (only manifest changes)

### To Enable True Auto-Updates

Install **ArgoCD Image Updater**:

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml
```

Then annotate the application:

```yaml
metadata:
  annotations:
    argocd-image-updater.argoproj.io/image-list: home-assistant=ghcr.io/home-assistant/home-assistant
    argocd-image-updater.argoproj.io/home-assistant.update-strategy: latest
```

## Monitoring

```bash
# Watch application status
kubectl get applications -n argocd -w

# View sync details
kubectl describe application home-assistant -n argocd

# Check ArgoCD logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller -f
```

## Troubleshooting

### Check Application Status
```bash
kubectl get applications -n argocd home-assistant -o yaml
```

### Force Sync
```bash
kubectl patch application home-assistant -n argocd \
  --type merge \
  -p '{"metadata": {"annotations": {"argocd.argoproj.io/refresh": "normal"}}}'
```

### Delete and Recreate
```bash
kubectl delete application home-assistant -n argocd
kubectl apply -f /home/stansini/workspace/homelab-gitops/argocd-apps/home-assistant-app.yaml
```

## Files Created

- `/home/stansini/workspace/homelab-gitops/argocd-apps/home-assistant-app.yaml` - ArgoCD Application manifest
- This guide for reference

## Next Steps

1. Choose an authentication method (Option 1 recommended)
2. Configure repository access in ArgoCD
3. Verify sync status: `kubectl get applications -n argocd`
4. Access ArgoCD UI to monitor deployments
5. (Optional) Set up image updater for automatic container updates
