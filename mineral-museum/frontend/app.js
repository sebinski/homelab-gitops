// Configuration
const API_URL = 'http://192.168.1.128/minerals';
const COLLECTION = 'minerals';

// Load minerals on page load
document.addEventListener('DOMContentLoaded', loadMinerals);

async function loadMinerals() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const grid = document.getElementById('minerals-grid');

    try {
        // Fetch minerals from Directus
        const response = await fetch(`${API_URL}/items/${COLLECTION}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide loading
        loading.style.display = 'none';
        
        // Display minerals
        if (data.data && data.data.length > 0) {
            grid.innerHTML = data.data.map(mineral => createMineralCard(mineral)).join('');
        } else {
            grid.innerHTML = '<p style="color: white; text-align: center; width: 100%;">Nessun minerale trovato. <a href="add.html" style="color: #ffd700;">Aggiungi il primo!</a></p>';
        }
        
    } catch (err) {
        console.error('Error loading minerals:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = `Errore nel caricamento: ${err.message}`;
    }
}

function createMineralCard(mineral) {
    const imageUrl = mineral.Foto 
        ? `${API_URL}/assets/${mineral.Foto}?width=400&height=300&fit=cover`
        : '';
    
    const dateFormatted = mineral.Data_acquisizione 
        ? new Date(mineral.Data_acquisizione).toLocaleDateString('it-IT')
        : 'N/A';
    
    return `
        <div class="mineral-card">
            ${imageUrl ? `<img src="${imageUrl}" alt="${mineral.Nome}" class="mineral-image">` : '<div class="mineral-image"></div>'}
            <div class="mineral-info">
                <div class="mineral-name">${mineral.Nome || 'Senza nome'}</div>
                
                ${mineral.Dimensioni ? `<div class="mineral-detail"><strong>Dimensioni:</strong> ${mineral.Dimensioni}</div>` : ''}
                
                ${mineral.Peso ? `<div class="mineral-detail"><strong>Peso:</strong> ${parseFloat(mineral.Peso).toFixed(2)}g</div>` : ''}
                
                <div class="mineral-detail"><strong>Data acquisizione:</strong> ${dateFormatted}</div>
                
                ${mineral.Note ? `<div class="mineral-notes">${mineral.Note}</div>` : ''}
            </div>
        </div>
    `;
}
