# Mineral Museum Frontend

A simple, beautiful frontend for the Directus-powered mineral collection.

## Features

- **View Collection**: Browse all minerals with photos and details
- **Add Minerals**: Form to add new minerals with photo upload
- **Responsive Design**: Works on desktop and mobile
- **No Build Required**: Pure HTML/CSS/JavaScript

## Setup

### 1. Enable Public Access in Directus

Login to Directus admin (`http://192.168.1.128/minerals/admin`) and:

1. Go to **Settings** → **Roles & Permissions** → **Public**
2. Enable the following permissions for the `minerals` collection:
   - **Read**: ✓ (to view minerals)
   - **Create**: ✓ (to add new minerals)
3. Enable **Read** permission for the **Files** (to view photos)
4. Enable **Create** permission for the **Files** (to upload photos)
5. Save changes

### 2. Serve the Frontend

#### Option A: Simple Python Server
```bash
cd /home/stansini/workspace/homelab-gitops/mineral-museum/frontend
python3 -m http.server 8080
```
Then open: `http://localhost:8080`

#### Option B: Nginx/Apache
Copy the files to your web server's document root.

#### Option C: Deploy to Kubernetes
Create a simple nginx deployment to serve these static files.

## Usage

- **View Collection**: Open `index.html` to see all minerals
- **Add Mineral**: Click "Aggiungi Minerale" or open `add.html`

## Configuration

If your Directus URL is different, update the `API_URL` in:
- `app.js` (line 2)
- `add.js` (line 2)

## Collection Structure

The app expects a Directus collection named `minerals` with these fields:
- `Nome` (string): Mineral name
- `Dimensioni` (string): Dimensions
- `Peso` (decimal): Weight in grams
- `Data_acquisizione` (date): Acquisition date
- `Note` (text): Notes
- `Foto` (file): Photo reference

## Troubleshooting

### CORS Errors
Make sure CORS is enabled in your Directus deployment (already configured).

### Can't Create Items
Verify the Public role has Create permissions in Directus Settings.

### Photos Not Loading
Ensure Public role has Read access to Files in Directus.
