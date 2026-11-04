// Tema: oscuro o claro. Se guarda en localStorage con la clave 'balatro-theme'.
// Se carga en el <head> para aplicar el tema antes de pintar la página.

(function () {
  var CLAVE = 'balatro-theme';
  var CLARO = 'light';
  var OSCURO = 'dark';

  // Devuelve el tema guardado; por defecto, oscuro
  function leerTema() {
    var guardado = localStorage.getItem(CLAVE);
    if (guardado === CLARO || guardado === OSCURO) return guardado;

    var prefiereClaro = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefiereClaro ? CLARO : OSCURO;
  }

  // Añade o quita la clase theme-light en <html>
  function aplicar(tema) {
    document.documentElement.classList.toggle('theme-light', tema === CLARO);
  }

  function guardar(tema) {
    localStorage.setItem(CLAVE, tema);
  }

  // Aplicar de inmediato, para evitar parpadeo
  aplicar(leerTema());

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () {
      if (!localStorage.getItem(CLAVE)) {
        aplicar(leerTema());
      }
    });
  }


  // Solo existe en configuracion.html
  function enlazarSelector() {
    var opciones = document.querySelectorAll('.cfg-theme-option');
    if (!opciones.length) return;

    // Marca visualmente la opción seleccionada
    function pintarSeleccion(tema) {
      opciones.forEach(function (opt) {
        var activo = opt.dataset.theme === tema;
        opt.classList.toggle('active', activo);
        opt.setAttribute('aria-pressed', String(activo));

        var pie = opt.querySelector('.cfg-theme-footer');
        pie.lastElementChild.outerHTML = activo
          ? '<span class="cfg-selected"><span class="cfg-dot"></span>Seleccionado</span>'
          : '<span class="cfg-radio"></span>';
      });
    }

    opciones.forEach(function (opt) {
      opt.addEventListener('click', function () {
        var tema = opt.dataset.theme;
        aplicar(tema);
        guardar(tema);
        pintarSeleccion(tema);
      });
    });

    pintarSeleccion(leerTema());
  }

  // Si el DOM aún no está listo, esperar; si ya está, ejecutar ya
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enlazarSelector);
  } else {
    enlazarSelector();
  }

  // Exponer para otros scripts si hace falta
  window.BalatroTheme = {
    actual: leerTema,
    aplicar: aplicar
  };
})();