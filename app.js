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

firebase.initializeApp(firebaseConfig);
const db = firebase.database(); // Inizializza Realtime Database

const CLOUD_NAME = "dryiwjoqm"; 
const UPLOAD_PRESET = "quadri_preset";

// --- GESTIONE LOGIN ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        if (document.getElementById('admin-password').value === "mamma2025") {
            document.getElementById('login-box').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
        } else { alert("Password errata!"); }
    });
}

// --- CARICAMENTO ---
const adminForm = document.getElementById('admin-form');
if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        btn.innerText = "Caricamento...";
        btn.disabled = true;

        try {
            const file = document.getElementById('q-foto').files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);

            // Carica su Cloudinary
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST', body: formData
            });
            const data = await res.json();
            
            // Salva nel Realtime Database
            await db.ref('quadri').push({
                titolo: document.getElementById('q-titolo').value,
                descrizione: document.getElementById('q-desc').value,
                prezzo: document.getElementById('q-prezzo').value,
                url: data.secure_url,
                timestamp: Date.now()
            });

            alert("✅ Pubblicato!");
            adminForm.reset();
        } catch (error) {
            console.error(error);
            alert("Errore nel caricamento.");
        } finally {
            btn.innerText = "Pubblica sul sito";
            btn.disabled = false;
        }
    });
}