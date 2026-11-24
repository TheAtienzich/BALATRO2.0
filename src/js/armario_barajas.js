// Guarda la baraja equipada en localStorage y actualiza su estado en armario_barajas.html.

(function () {
  var STORAGE_KEY = 'balatro-baraja-equipada';
  var BARAJA_DEFECTO = 'roja';

  function leerBaraja() {
    return localStorage.getItem(STORAGE_KEY) || BARAJA_DEFECTO;
  }

  function guardarBaraja(nombre) {
    localStorage.setItem(STORAGE_KEY, nombre);
  }

  function obtenerIdentificador(tarjeta, indice) {
    if (tarjeta.dataset.baraja) {
      return tarjeta.dataset.baraja;
    }
    var titulo = tarjeta.querySelector('.item-name');
    if (titulo) {
      return titulo.textContent.trim().toLowerCase().replace(/^baraja\s+/, '');
    }
    return 'baraja-' + indice;
  }

  function pintarTarjetas(tarjetas, activa) {
    tarjetas.forEach(function (item) {
      var esActiva = item.idBaraja === activa;
      var badge = item.el.querySelector('.item-badge');
      var boton = item.el.querySelector('button');

      item.el.style.borderColor = esActiva ? 'var(--accent-yellow)' : '';

      if (badge) {
        badge.textContent = esActiva ? '✓ Equipada' : 'En tu colección';
        badge.style.color = esActiva ? '#10b981' : '';
      }

      if (boton) {
        boton.textContent = esActiva ? 'En uso' : 'Equipar';
        boton.disabled = esActiva;
      }
    });
  }

  function iniciar() {
    var contenedor = document.querySelector('.shop-grid');
    if (!contenedor) return;

    var tarjetas = Array.from(contenedor.querySelectorAll('.item-card')).map(function (el, idx) {
      return {
        el: el,
        idBaraja: obtenerIdentificador(el, idx)
      };
    });

    if (!tarjetas.length) return;

    function equipar(nombre) {
      guardarBaraja(nombre);
      pintarTarjetas(tarjetas, nombre);
    }

    tarjetas.forEach(function (item) {
      item.el.addEventListener('click', function () {
        var boton = item.el.querySelector('button');
        if (boton && boton.disabled) return;
        equipar(item.idBaraja);
      });
    });

    pintarTarjetas(tarjetas, leerBaraja());

    window.BalatroArmarioBarajas = {
      equipada: leerBaraja,
      equipar: equipar
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();