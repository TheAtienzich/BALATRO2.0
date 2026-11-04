// Perfil: avatar, nombre de usuario y biografía.
// Los datos se guardan en localStorage con la clave 'balatro-perfil'.

var PERFIL_KEY = 'balatro-perfil';

// Foto preestablecida (carta de as de picas dibujada en SVG)
var FOTO_PRESET = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="58" fill="#1e3a6e" stroke="#3b5fb0" stroke-width="3"/>' +
    '<circle cx="60" cy="60" r="50" fill="none" stroke="#2e4a8a" stroke-width="1" stroke-dasharray="2 3"/>' +
    '<rect x="36" y="32" width="48" height="66" rx="5" fill="#f5f1e6" stroke="#2a2a2a" stroke-width="1.5"/>' +
    '<path d="M46 26 L50 16 L56 23 L60 13 L64 23 L70 16 L74 26 Z" fill="#c8272d"/>' +
    '<text x="41" y="46" font-size="10" font-weight="700" fill="#1b1b1b" font-family="Georgia, serif">A</text>' +
    '<path d="M60 52 C52 60 42 64 44 72 C46 79 54 78 58 74 L56 86 L64 86 L62 74 C66 78 74 79 76 72 C78 64 68 60 60 52 Z" fill="#1b1b1b"/>' +
    '<text x="79" y="92" font-size="10" font-weight="700" fill="#1b1b1b" font-family="Georgia, serif" transform="rotate(180 79 88)">A</text>' +
    '</svg>';

var PRESET_SRC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(FOTO_PRESET);
var MAX_BYTES = 5 * 1024 * 1024;
var TAMANO_AVATAR = 120;

var fotoImg = document.getElementById('pf-avatar-img');
var fotoBtn = document.getElementById('pf-btn-foto');
var fotoInput = document.getElementById('pf-file');
var nombreInput = document.getElementById('pf-nombre');
var bio = document.getElementById('pf-bio');
var contador = document.getElementById('pf-contador');
var aviso = document.getElementById('pf-aviso');
var editar = document.getElementById('pf-editar');

// ---------- Almacenamiento ----------

function cargarPerfil() {
    try {
        return JSON.parse(localStorage.getItem(PERFIL_KEY));
    } catch (e) {
        return null;
    }
}

function guardarPerfil(datos) {
    try {
        localStorage.setItem(PERFIL_KEY, JSON.stringify(datos));
        return true;
    } catch (e) {
        // Puede fallar si se supera el límite de localStorage
        alert('No se pudo guardar el perfil. Prueba con una imagen más pequeña.');
        return false;
    }
}

// ---------- Foto ----------

// Reduce la imagen a 120x120 y la devuelve en base64 (JPEG, para ocupar poco)
function comprimirImagen(src, callback) {
    var img = new Image();
    img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = TAMANO_AVATAR;
        canvas.height = TAMANO_AVATAR;
        var ctx = canvas.getContext('2d');

        // Recorte centrado en cuadrado
        var lado = Math.min(img.width, img.height);
        var sx = (img.width - lado) / 2;
        var sy = (img.height - lado) / 2;
        ctx.drawImage(img, sx, sy, lado, lado, 0, 0, TAMANO_AVATAR, TAMANO_AVATAR);

        callback(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = src;
}

// Foto inicial: la guardada o la preestablecida
var perfilGuardado = cargarPerfil() || {};
fotoImg.src = perfilGuardado.foto || PRESET_SRC;

fotoBtn.addEventListener('click', function () {
    fotoInput.click();
});

fotoInput.addEventListener('change', function () {
    var archivo = fotoInput.files[0];
    if (!archivo) return;

    if (archivo.type !== 'image/jpeg' && archivo.type !== 'image/png') {
        alert('Solo se permiten imágenes JPG o PNG.');
        fotoInput.value = '';
        return;
    }
    if (archivo.size > MAX_BYTES) {
        alert('La imagen supera el máximo de 5 MB.');
        fotoInput.value = '';
        return;
    }

    var lector = new FileReader();
    lector.onload = function (e) {

        comprimirImagen(e.target.result, function (miniatura) {
            fotoImg.src = miniatura;
            perfilGuardado.foto = miniatura;
            // Guarda la foto de inmediato, junto con los textos ya guardados
            guardarPerfil({
                nombre: guardado.nombre,
                bio: guardado.bio,
                foto: miniatura
            });
        });


    };


    lector.readAsDataURL(archivo);

    fotoInput.value = '';
});

// Nombre

// Carga de datos guardados (o valores por defecto del HTML)
if (perfilGuardado.nombre !== undefined) nombreInput.value = perfilGuardado.nombre;
if (perfilGuardado.bio !== undefined) bio.value = perfilGuardado.bio;

// Estado guardado actual, para detectar cambios y para Cancelar
var guardado = { nombre: nombreInput.value, bio: bio.value };

function actualizarContador() {
    contador.textContent = bio.value.length + ' / ' + bio.maxLength;
}

function hayCambios() {
    return nombreInput.value !== guardado.nombre || bio.value !== guardado.bio;
}

function actualizarAviso() {
    aviso.hidden = !hayCambios();
}

editar.addEventListener('click', function () {
    if (nombreInput.hasAttribute('readonly')) {
        nombreInput.removeAttribute('readonly');
        nombreInput.focus();
        editar.textContent = 'Listo';
    } else {
        nombreInput.setAttribute('readonly', '');
        editar.textContent = 'Editar';
    }
});

bio.addEventListener('input', function () {
    actualizarContador();
    actualizarAviso();
});

nombreInput.addEventListener('input', actualizarAviso);

document.getElementById('pf-cancelar').addEventListener('click', function () {
    nombreInput.value = guardado.nombre;
    bio.value = guardado.bio;
    nombreInput.setAttribute('readonly', '');
    editar.textContent = 'Editar';
    actualizarContador();
    actualizarAviso();
});

// Se llama desde el onsubmit del formulario en perfil.html
function guardar() {
    guardado = { nombre: nombreInput.value, bio: bio.value };
    var ok = guardarPerfil({
        nombre: guardado.nombre,
        bio: guardado.bio,
        foto: perfilGuardado.foto || null
    });
    if (!ok) return;
    nombreInput.setAttribute('readonly', '');
    editar.textContent = 'Editar';
    actualizarAviso();
}

actualizarContador();