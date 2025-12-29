// Configuration
const API_URL = 'http://192.168.1.128/minerals';
const COLLECTION = 'minerals';

// Photo preview
document.getElementById('foto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-img').src = e.target.result;
            document.getElementById('photo-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Form submission
document.getElementById('mineral-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const messageEl = document.getElementById('message');
    const errorEl = document.getElementById('error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Hide previous messages
    messageEl.style.display = 'none';
    errorEl.style.display = 'none';
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvataggio...';
    
    try {
        let fotoId = null;
        
        // Upload photo first if present
        const fotoFile = document.getElementById('foto').files[0];
        if (fotoFile) {
            fotoId = await uploadPhoto(fotoFile);
        }
        
        // Prepare mineral data
        const mineralData = {
            Nome: document.getElementById('nome').value,
            Dimensioni: document.getElementById('dimensioni').value || null,
            Peso: document.getElementById('peso').value ? parseFloat(document.getElementById('peso').value) : null,
            Data_acquisizione: document.getElementById('data_acquisizione').value || null,
            Note: document.getElementById('note').value || null,
            Foto: fotoId
        };
        
        // Create mineral item
        const response = await fetch(`${API_URL}/items/${COLLECTION}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mineralData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0]?.message || 'Errore nel salvataggio');
        }
        
        // Success
        messageEl.style.display = 'block';
        messageEl.textContent = '✓ Minerale aggiunto con successo!';
        
        // Reset form
        document.getElementById('mineral-form').reset();
        document.getElementById('photo-preview').style.display = 'none';
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (err) {
        console.error('Error saving mineral:', err);
        errorEl.style.display = 'block';
        errorEl.textContent = `Errore: ${err.message}`;
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Salva Minerale';
    }
});

async function uploadPhoto(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/files`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('Errore nel caricamento della foto');
    }
    
    const data = await response.json();
    return data.data.id;
}
