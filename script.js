// ===============================
// CONFIGURATION - à modifier ici pour les futures mises à jour
// ===============================

// Liste des noms, chacun associé à ses numéros disponibles.
// Le "numero" ne contient QUE les chiffres, le "NUM" est rajouté automatiquement.
// 👇 Cette liste est maintenant chargée depuis data.json (voir chargerDonnees() plus bas)
let noms = [];

// Zones de texte sur l'image (coordonnées à récupérer depuis Figma)
// 👇 ADAPTE CES COORDONNÉES À TON TEMPLATE
const zones = {
    numeroFull:  { x: 947, y: 1022, style: 'P1' }, // rempli par la Liste 2 (ex: NUM002)
    nom:         { x: 68, y: 1175, style: 'P2' }, // rempli par la Liste 1
    numeroShort: { x: 324, y: 1230, style: 'P2' }, // rempli par la Liste 2 (ex: 002)
    dateHeure:   { x: 68, y: 1450, style: 'P2' }, // rempli automatiquement au clic sur Générer
};

// ===============================
// INITIALISATION
// ===============================

const canvas = document.getElementById('monCanvas');
const ctx = canvas.getContext('2d');
let imageChargee = false;

const img = new Image();
img.src = 'template-sms.png'; // 👈 même image que la V1
img.onload = function () {
    imageChargee = true;
    ctx.drawImage(img, 0, 0);
};
img.onerror = function () {
    alert("Erreur : impossible de charger l'image template-sms.png");
};

const selectNom = document.getElementById('selectNom');
const selectNumero = document.getElementById('selectNumero');

// Remplit la Liste 1 (Noms) une fois les données chargées
function initListeNoms() {
    noms.forEach((n, index) => {
        const option = document.createElement('option');
        option.value = index; // on stocke l'index pour retrouver l'objet facilement
        option.textContent = n.label;
        selectNom.appendChild(option);
    });
}

// Charge la liste des noms/numéros depuis data.json
// ⚠️ Nécessite un serveur local (Live Server, python -m http.server, etc.)
// Le fetch() sur un fichier local (file://) est bloqué par le navigateur.
async function chargerDonnees() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        noms = data.noms;
        initListeNoms();
    } catch (erreur) {
        console.error('Erreur de chargement du JSON :', erreur);
        alert("Impossible de charger la liste des noms/numéros ! Assure-toi d'utiliser un serveur local (Live Server, etc.) et non file://");
    }
}

chargerDonnees();

// Quand on choisit un Nom → on remplit/vide la Liste 2 des numéros associés
selectNom.addEventListener('change', () => {
    // Reset de la liste 2
    selectNumero.innerHTML = '';

    if (selectNom.value === '') {
        selectNumero.disabled = true;
        selectNumero.innerHTML = '<option value="">-- Choisis d\'abord un nom --</option>';
        return;
    }

    const nomChoisi = noms[selectNom.value];

    const optionVide = document.createElement('option');
    optionVide.value = '';
    optionVide.textContent = '-- Choisir un numéro --';
    selectNumero.appendChild(optionVide);

    nomChoisi.numeros.forEach(num => {
        const option = document.createElement('option');
        option.value = num;
        option.textContent = 'BUS' + num;
        selectNumero.appendChild(option);
    });

    selectNumero.disabled = false;
});

// ===============================
// STYLES DE TEXTE
// ===============================

function appliquerStyle(ctx, style, alignement = 'left') {
    if (style === 'P1') {
        ctx.font = '36px Google Sans Flex, sans-serif';
        ctx.fillStyle = '#131218';
    } else if (style === 'P2') {
        ctx.font = '36px Google Sans Flex, sans-serif';
        ctx.fillStyle = '#E7E8ED';
    }
    ctx.textBaseline = 'top';
    ctx.textAlign = alignement;
}

// ===============================
// DATE / HEURE AUTOMATIQUE
// Format : "Le JJ.MM.AAAA de HH:MM à HH:MM" (2e heure = 1re heure + 1h)
// ===============================

function genererDateHeure() {
    const maintenant = new Date();

    const jj = String(maintenant.getDate()).padStart(2, '0');
    const mm = String(maintenant.getMonth() + 1).padStart(2, '0');
    const aaaa = maintenant.getFullYear();

    const hDebut = String(maintenant.getHours()).padStart(2, '0');
    const minDebut = String(maintenant.getMinutes()).padStart(2, '0');

    const finPeriode = new Date(maintenant.getTime() + 60 * 60 * 1000); // +1h
    const hFin = String(finPeriode.getHours()).padStart(2, '0');
    const minFin = String(finPeriode.getMinutes()).padStart(2, '0');

    return `Le ${jj}.${mm}.${aaaa} de ${hDebut}:${minDebut} à ${hFin}:${minFin}`;
}

// ===============================
// GÉNÉRATION DU MESSAGE
// ===============================

function genererMeme() {
    if (!imageChargee) {
        alert("Attends que l'image soit chargée !");
        return;
    }

    // Redessiner l'image de base
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Texte du Nom (Liste 1)
    if (selectNom.value !== '') {
        const nomChoisi = noms[selectNom.value];
        appliquerStyle(ctx, zones.nom.style);
        ctx.fillText(nomChoisi.label, zones.nom.x, zones.nom.y);
    }

    // Textes du Numéro (Liste 2) → NUMXXX + XXX
    if (selectNumero.value !== '') {
        const numero = selectNumero.value; // ex: "002"
        appliquerStyle(ctx, zones.numeroFull.style, 'center');
        ctx.fillText('BUS' + numero, zones.numeroFull.x, zones.numeroFull.y);

        appliquerStyle(ctx, zones.numeroShort.style, 'left');
        ctx.fillText(numero, zones.numeroShort.x, zones.numeroShort.y);
    }

    // Date / heure automatique
    const texteDate = genererDateHeure();
    appliquerStyle(ctx, zones.dateHeure.style);
    ctx.fillText(texteDate, zones.dateHeure.x, zones.dateHeure.y);
}

// ===============================
// TÉLÉCHARGEMENT
// ===============================

function telecharger() {
    const link = document.createElement('a');
    link.download = 'meme-sms.png';
    link.href = canvas.toDataURL();
    link.click();
}
