// 1. Configurazione Firebase (Puntamento al Realtime Database nel Belgio)
const firebaseConfig = {
  apiKey: "AIzaSyAzpudn2GxVeWpD_l6MMy4l9iVbzflE4Os",
  authDomain: "sito-aylen.firebaseapp.com",
  projectId: "sito-aylen",
  databaseURL: "https://sito-aylen-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "sito-aylen.firebasestorage.app",
  messagingSenderId: "730173556812",
  appId: "1:730173556812:web:8066b55a95d670cc788ce9",
  measurementId: "G-WEGB2PCMYF"
};

// Inizializzazione Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// Configurazione Cloudinary
const CLOUD_NAME = "dryiwjoqm"; 
const UPLOAD_PRESET = "quadri_preset";

console.log("🔥 Sistema Aylen Art inizializzato.");

// --- SEZIONE A: GESTIONE LOGIN (ADMIN) ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const pass = document.getElementById('admin-password').value;
        if (pass === "mamma2025") {
            document.getElementById('login-box').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            console.log("Accesso admin eseguito.");
        } else { 
            alert("Password errata!"); 
        }
    });
}

// --- SEZIONE B: CARICAMENTO QUADRI (ADMIN) ---
const adminForm = document.getElementById('admin-form');
if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        btn.innerText = "Caricamento foto...";
        btn.disabled = true;

        try {
            const file = document.getElementById('q-foto').files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);

            // 1. Upload della foto su Cloudinary
            console.log("Inviando foto a Cloudinary...");
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST', 
                body: formData
            });
            const data = await res.json();
            const photoURL = data.secure_url;
            console.log("Foto caricata con successo:", photoURL);

            // 2. Salvataggio dati nel Realtime Database
            console.log("Salvataggio nel database Firebase...");
            await db.ref('quadri').push({
                titolo: document.getElementById('q-titolo').value,
                descrizione: document.getElementById('q-desc').value,
                prezzo: document.getElementById('q-prezzo').value,
                url: photoURL,
                timestamp: Date.now()
            });

            alert("✅ Opera pubblicata con successo!");
            adminForm.reset();
        } catch (error) {
            console.error("Errore durante il processo:", error);
            alert("Errore nel caricamento. Controlla la connessione.");
        } finally {
            btn.innerText = "Pubblica sul sito";
            btn.disabled = false;
        }
    });
}

// --- SEZIONE C: VISUALIZZAZIONE GALLERIA ---
const galleria = document.getElementById('galleria-quadri');
if (galleria) {
    console.log("Connessione alla galleria quadri...");
    
    // Ascolta i cambiamenti nel database in tempo reale
    db.ref('quadri').on('value', (snapshot) => {
        const data = snapshot.val();
        console.log("Dati recuperati dal database:", data);
        
        galleria.innerHTML = ""; // Pulisce lo schermo
        
        if (data) {
            // Converte l'oggetto del DB in un array e lo inverte per mostrare i nuovi quadri per primi
            const list = Object.values(data).reverse();
            list.forEach(q => {
                galleria.innerHTML += `
                    <div class="quadro-card">
                        <div class="img-container">
                            <img src="${q.url}" alt="${q.titolo}" loading="lazy">
                        </div>
                        <div class="quadro-info">
                            <h3>${q.titolo}</h3>
                            <p>${q.descrizione}</p>
                            <span class="prezzo">${q.prezzo}</span>
                        </div>
                    </div>`;
            });
        } else {
            galleria.innerHTML = "<p>Nessun quadro presente in galleria. Caricane uno dall'area Admin!</p>";
        }
    }, (error) => {
        console.error("Errore di lettura dal database:", error);
        galleria.innerHTML = "<p>Errore di caricamento. Verifica la connessione.</p>";
    });
}