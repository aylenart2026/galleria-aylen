// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAzpudn2GxVeWpD_l6MMy4l9iVbzflE4Os",
  authDomain: "sito-aylen.firebaseapp.com",
  projectId: "sito-aylen",
  storageBucket: "sito-aylen.firebasestorage.app",
  messagingSenderId: "730173556812",
  appId: "1:730173556812:web:8066b55a95d670cc788ce9",
  measurementId: "G-WEGB2PCMYF"
};

// Inizializzazione Firebase e Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Configurazione Cloudinary
const CLOUD_NAME = "dryiwjoqm"; 
const UPLOAD_PRESET = "quadri_preset"; // Deve essere "Unsigned" su Cloudinary

// --- LOGICA AREA ADMIN ---
if (document.getElementById('admin-form')) {
    const loginBox = document.getElementById('login-box');
    const adminContent = document.getElementById('admin-content');
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('admin-password');

    // Funzione di Login
    loginBtn.addEventListener('click', () => {
        if (passwordInput.value === "mamma2025") {
            loginBox.style.display = 'none';
            adminContent.style.display = 'block';
        } else {
            alert("Password errata!");
        }
    });

    // Invio del Modulo
    const form = document.getElementById('admin-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        btn.innerText = "Caricamento in corso...";
        btn.disabled = true;

        const file = document.getElementById('q-foto').files[0];
        const titolo = document.getElementById('q-titolo').value;
        const desc = document.getElementById('q-desc').value;
        const prezzo = document.getElementById('q-prezzo').value;

        try {
            // 1. Caricamento Foto su Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (!res.ok) throw new Error("Errore durante l'upload su Cloudinary");
            
            const data = await res.json();
            const photoURL = data.secure_url;

            // 2. Salvataggio Dati su Firestore (crea raccolta "quadri" se non esiste)
            await db.collection("quadri").add({
                titolo: titolo,
                descrizione: desc,
                prezzo: prezzo,
                url: photoURL,
                data: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("✅ Opera pubblicata con successo!");
            form.reset();
        } catch (error) {
            console.error(error);
            alert("Si è verificato un errore durante il caricamento.");
        } finally {
            btn.innerText = "Pubblica sul sito";
            btn.disabled = false;
        }
    });
}

// --- VISUALIZZAZIONE GALLERIA (Se presente un contenitore) ---
if (document.getElementById('galleria-quadri')) {
    const container = document.getElementById('galleria-quadri');
    
    // Ascolta i cambiamenti nel database in tempo reale
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