import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAzpudn2GxVeWpD_l6MMy4l9iVbzflE4Os",
    authDomain: "sito-aylen.firebaseapp.com",
    projectId: "sito-aylen",
    storageBucket: "sito-aylen.firebasestorage.app",
    messagingSenderId: "730173556812",
    appId: "1:730173556812:web:8066b55a95d670cc788ce9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- 1. LOGICA ADMIN (PASSWORD E UPLOAD) ---
const btnLogin = document.getElementById('btn-login');
if (btnLogin) {
    btnLogin.onclick = () => {
        if (document.getElementById('admin-pass').value === "mamma2025") {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('upload-section').style.display = 'block';
        } else { alert("Password errata!"); }
    };
}

const btnCarica = document.getElementById('btn-carica');
if (btnCarica) {
    btnCarica.onclick = async () => {
        const file = document.getElementById('foto-file').files[0];
        const titolo = document.getElementById('titolo').value;
        const desc = document.getElementById('descrizione').value;
        const prezzo = document.getElementById('prezzo').value;
        const stato = document.getElementById('stato-caricamento');

        if (!file || !titolo) return alert("Inserisci titolo e foto!");

        stato.innerText = "Caricamento in corso...";
        try {
            const fileRef = ref(storage, `quadri/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);

            await addDoc(collection(db, "quadri"), {
                titolo, descrizione: desc, prezzo, immagine: url, data: new Date()
            });

            stato.innerText = "✅ Pubblicato con successo!";
            setTimeout(() => location.reload(), 2000);
        } catch (e) { stato.innerText = "Errore: " + e.message; }
    };
}

// --- 2. LOGICA VETRINA (MOSTRA QUADRI) ---
const galleryGrid = document.getElementById('gallery-container');
if (galleryGrid) {
    const caricaQuadri = async () => {
        const q = query(collection(db, "quadri"), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);
        galleryGrid.innerHTML = ""; // Pulisce il caricamento

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            galleryGrid.innerHTML += `
                <div class="card">
                    <img src="${data.immagine}" alt="${data.titolo}">
                    <div class="card-info">
                        <h3>${data.titolo}</h3>
                        <p>${data.descrizione}</p>
                        <span class="price">${data.prezzo}</span>
                    </div>
                </div>
            `;
        });
    };
    caricaQuadri();
}