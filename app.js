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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// --- LOGIN ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        if (document.getElementById('admin-password').value === "mamma2025") {
            document.getElementById('login-box').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            caricaListaAdmin(); 
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
            formData.append('upload_preset', "quadri_preset");

            const res = await fetch(`https://api.cloudinary.com/v1_1/dryiwjoqm/image/upload`, {
                method: 'POST', body: formData
            });
            const data = await res.json();

            await db.ref('quadri').push({
                titolo: document.getElementById('q-titolo').value,
                descrizione: document.getElementById('q-desc').value,
                prezzo: document.getElementById('q-prezzo').value,
                url: data.secure_url,
                timestamp: Date.now()
            });

            alert("✅ Opera pubblicata!");
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

// --- LISTA ADMIN PER ELIMINAZIONE ---
function caricaListaAdmin() {
    const listContainer = document.getElementById('admin-list-quadri');
    if (!listContainer) return;

    db.ref('quadri').on('value', (snapshot) => {
        const data = snapshot.val();
        listContainer.innerHTML = ""; 
        
        if (data) {
            Object.keys(data).forEach(id => {
                const q = data[id];
                listContainer.innerHTML += `
                    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee; padding: 10px 0;">
                        <span>${q.titolo}</span>
                        <button onclick="eliminaQuadro('${id}')" style="background: #ff4d4d; width: auto; padding: 5px 10px; font-size: 0.8rem; color: white; border: none; cursor: pointer;">Elimina</button>
                    </div>`;
            });
        } else {
            listContainer.innerHTML = "<p>Nessun quadro presente.</p>";
        }
    });
}

window.eliminaQuadro = function(id) {
    if (confirm("Sei sicuro di voler eliminare questo quadro?")) {
        db.ref('quadri/' + id).remove()
            .then(() => alert("Quadro eliminato!"))
            .catch(error => alert("Errore: " + error.message));
    }
}

// --- GALLERIA PUBBLICA ---
const galleria = document.getElementById('galleria-quadri');
if (galleria) {
    db.ref('quadri').on('value', (snapshot) => {
        const data = snapshot.val();
        galleria.innerHTML = ""; 
        if (data) {
            Object.values(data).reverse().forEach(q => {
                galleria.innerHTML += `
                    <div class="card">
                        <a href="${q.url}" target="_blank" title="Clicca per vedere la foto intera">
                            <img src="${q.url}" alt="${q.titolo}">
                        </a>
                        <div class="card-info">
                            <h3>${q.titolo}</h3>
                            <p>${q.descrizione}</p>
                            <span class="price">${q.prezzo}</span>
                        </div>
                    </div>`;
            });
        } else {
            galleria.innerHTML = "<p>Nessun quadro presente.</p>";
        }
    });
}