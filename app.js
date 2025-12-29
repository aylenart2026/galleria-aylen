// Configurazione Firebase aggiornata con Realtime Database
const firebaseConfig = {
  apiKey: "AIzaSyAzpudn2GxVeWpD_l6MMy4l9iVbzflE4Os",
  authDomain: "sito-aylen.firebaseapp.com",
  projectId: "sito-aylen",
  databaseURL: "https://sito-aylen-default-rtdb.europe-west1.firebasedatabase.app/",
  storageBucket: "sito-aylen.firebasestorage.app",
  messagingSenderId: "730173556812",
  appId: "1:730173556812:web:8066b55a95d670cc788ce9",
  measurementId: "G-WEGB2PCMYF"
};

// Inizializza Firebase e Realtime Database
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Configurazione Cloudinary
const CLOUD_NAME = "dryiwjoqm"; 
const UPLOAD_PRESET = "quadri_preset"; // Assicurati sia "Unsigned" nelle impostazioni Cloudinary

// --- GESTIONE LOGIN ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const passInput = document.getElementById('admin-password');
        if (passInput.value === "mamma2025") {
            document.getElementById('login-box').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
        } else {
            alert("Password errata!");
        }
    });
}

// --- CARICAMENTO QUADRI ---
const adminForm = document.getElementById('admin-form');
if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        btn.innerText = "Caricamento...";
        btn.disabled = true;

        const file = document.getElementById('q-foto').files[0];
        const titolo = document.getElementById('q-titolo').value;
        const desc = document.getElementById('q-desc').value;
        const prezzo = document.getElementById('q-prezzo').value;

        try {
            // 1. Caricamento su Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            const photoURL = data.secure_url;

            // 2. Salvataggio su Realtime Database
            await db.ref('quadri').push({
                titolo: titolo,
                descrizione: desc,
                prezzo: prezzo,
                url: photoURL,
                timestamp: Date.now()
            });

            alert("✅ Opera caricata correttamente!");
            adminForm.reset();
        } catch (error) {
            console.error(error);
            alert("Errore nel caricamento. Controlla la connessione.");
        } finally {
            btn.innerText = "Pubblica sul sito";
            btn.disabled = false;
        }
    });
}

// --- VISUALIZZAZIONE GALLERIA ---
const galleria = document.getElementById('galleria-quadri');
if (galleria) {
    db.ref('quadri').on('value', (snapshot) => {
        galleria.innerHTML = "";
        const data = snapshot.val();
        if (data) {
            // Converte l'oggetto in array e lo ordina per data (più recente sopra)
            const list = Object.values(data).reverse();
            list.forEach(q => {
                galleria.innerHTML += `
                    <div class="quadro-card">
                        <img src="${q.url}" alt="${q.titolo}">
                        <div class="quadro-info">
                            <h3>${q.titolo}</h3>
                            <p>${q.descrizione}</p>
                            <span class="prezzo">${q.prezzo}</span>
                        </div>
                    </div>`;
            });
        }
    });
}