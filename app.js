// CONFIGURAZIONE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAzpudn2GxVeWpD_l6MMy4l9iVbzflE4Os",
  authDomain: "sito-aylen.firebaseapp.com",
  projectId: "sito-aylen",
  storageBucket: "sito-aylen.firebasestorage.app",
  messagingSenderId: "730173556812",
  appId: "1:730173556812:web:8066b55a95d670cc788ce9",
  measurementId: "G-WEGB2PCMYF"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Firestore gestirà i testi

// CONFIGURAZIONE CLOUDINARY
const CLOUD_NAME = "dryiwjoqm"; 
const UPLOAD_PRESET = "quadri_preset";

// --- GESTIONE PAGINA ADMIN ---
if (document.getElementById('admin-form')) {
    const loginBox = document.getElementById('login-box');
    const adminContent = document.getElementById('admin-content');
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('admin-password');

    loginBtn.addEventListener('click', () => {
        if (passwordInput.value === "mamma2025") {
            loginBox.style.display = 'none';
            adminContent.style.display = 'block';
        } else { alert("Password errata!"); }
    });

    const form = document.getElementById('admin-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerText = "Caricamento foto...";
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

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (!res.ok) throw new Error("Errore Cloudinary: verifica l'upload preset Unsigned.");
            
            const data = await res.json();
            const photoURL = data.secure_url; // URL della foto caricata

            // 2. Salvataggio dati su Firestore
            // La raccolta "quadri" verrà creata automaticamente ora
            await db.collection("quadri").add({
                titolo: titolo,
                descrizione: desc,
                prezzo: prezzo,
                url: photoURL,
                data: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("✅ Quadro pubblicato con successo!");
            form.reset();
        } catch (error) {
            console.error(error);
            alert("Errore nel caricamento. Controlla la console.");
        } finally {
            btn.innerText = "Pubblica sul sito";
            btn.disabled = false;
        }
    });
}

// --- VISUALIZZAZIONE GALLERIA ---
if (document.getElementById('galleria-quadri')) {
    const container = document.getElementById('galleria-quadri');
    
    // Recupero dati in tempo reale
    db.collection("quadri").orderBy("data", "desc").onSnapshot((snapshot) => {
        container.innerHTML = ""; 
        snapshot.forEach((doc) => {
            const q = doc.data();
            container.innerHTML += `
                <div class="quadro-card">
                    <img src="${q.url}" alt="${q.titolo}">
                    <div class="quadro-info">
                        <h3>${q.titolo}</h3>
                        <p>${q.descrizione}</p>
                        <span class="prezzo">${q.prezzo}</span>
                    </div>
                </div>`;
        });
    });
}