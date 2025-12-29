// 1. La tua configurazione Firebase (Aggiornata)
const firebaseConfig = {
  apiKey: "AIzaSyAzpudn2GxVeWpD_l6MMy4l9iVbzflE4Os",
  authDomain: "sito-aylen.firebaseapp.com",
  projectId: "sito-aylen",
  storageBucket: "sito-aylen.firebasestorage.app", // Nome corretto per il comando CORS
  messagingSenderId: "730173556812",
  appId: "1:730173556812:web:8066b55a95d670cc788ce9",
  measurementId: "G-WEGB2PCMYF"
};

// 2. Inizializzazione Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// --- FUNZIONI PER LA PAGINA ADMIN ---
if (document.getElementById('admin-form')) {
    const loginBox = document.getElementById('login-box');
    const adminContent = document.getElementById('admin-content');
    const passwordInput = document.getElementById('admin-password');
    const loginBtn = document.getElementById('login-btn');

    // Accesso con password
    loginBtn.addEventListener('click', () => {
        if (passwordInput.value === "mamma2025") {
            loginBox.style.display = 'none';
            adminContent.style.display = 'block';
        } else {
            alert("Password errata!");
        }
    });

    // Gestione caricamento Quadro
    const form = document.getElementById('admin-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerText = "Caricamento in corso...";
        btn.disabled = true;

        const file = document.getElementById('q-foto').files[0];
        const titolo = document.getElementById('q-titolo').value;
        const desc = document.getElementById('q-desc').value;
        const prezzo = document.getElementById('q-prezzo').value;

        try {
            // A. Carica la foto nello Storage
            const fileName = Date.now() + "_" + file.name;
            const storageRef = storage.ref('quadri/' + fileName);
            await storageRef.put(file);
            const photoURL = await storageRef.getDownloadURL();

            // B. Salva i dati nel database (Crea la raccolta "quadri" se non esiste)
            await db.collection("quadri").add({
                titolo: titolo,
                descrizione: desc,
                prezzo: prezzo,
                url: photoURL,
                data: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("✅ Pubblicato con successo!");
            form.reset();
        } catch (error) {
            console.error("Errore durante il caricamento:", error);
            alert("Errore durante il caricamento. Controlla la console (F12) per i dettagli CORS.");
        } finally {
            btn.innerText = "Pubblica sul sito";
            btn.disabled = false;
        }
    });
}

// --- FUNZIONI PER LA PAGINA QUADRI (VISUALIZZAZIONE) ---
if (document.getElementById('galleria-quadri')) {
    const container = document.getElementById('galleria-quadri');

    // Recupera i dati in tempo reale dal database
    db.collection("quadri").orderBy("data", "desc").onSnapshot((snapshot) => {
        container.innerHTML = ""; // Pulisce il contenitore
        snapshot.forEach((doc) => {
            const q = doc.data();
            const card = `
                <div class="quadro-card">
                    <img src="${q.url}" alt="${q.titolo}">
                    <div class="quadro-info">
                        <h3>${q.titolo}</h3>
                        <p>${q.descrizione}</p>
                        <span class="prezzo">${q.prezzo}</span>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    });
}