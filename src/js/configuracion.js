// Guarda el estado en localStorage y actualiza los botones de configuracion.html.

(function () {
  var KEYS = {
    musica: 'balatro-musica',
    efectos: 'balatro-efectos'
  };

  // Valor por defecto: activado
  function leer(clave) {
    return localStorage.getItem(clave) !== 'off';
  }

  function guardar(clave, activo) {
    localStorage.setItem(clave, activo ? 'on' : 'off');
  }

  // Actualiza el texto del botón según el estado
  function pintarBoton(btn, activo) {
    btn.dataset.estado = activo ? 'on' : 'off';
    btn.textContent = activo ? btn.dataset.on : btn.dataset.off;
    btn.setAttribute('aria-pressed', String(activo));
  }

  // Asocia un botón a una clave de configuración
  function enlazar(btn, clave) {
    pintarBoton(btn, leer(clave));

    btn.addEventListener('click', function () {
      var activo = btn.dataset.estado !== 'on';
      guardar(clave, activo);
      pintarBoton(btn, activo);
    });
  }

  // En configuracion.html, el primer botón data-toggle es música
  // y el segundo es efectos. Se identifican por el texto de la fila.
  document.querySelectorAll('.cfg-row').forEach(function (fila) {
    var btn = fila.querySelector('[data-toggle]');
    if (!btn) return;

    var etiqueta = fila.querySelector('span').textContent.trim();
    if (etiqueta === 'Música') {
      enlazar(btn, KEYS.musica);
    } else if (etiqueta === 'Efectos de sonido') {
      enlazar(btn, KEYS.efectos);
    }
  });

  // Expone la lectura para que otras páginas (cuando haya audio) la usen
  window.BalatroSettings = {
    musicaActiva: function () { return leer(KEYS.musica); },
    efectosActivos: function () { return leer(KEYS.efectos); }
  };
})();