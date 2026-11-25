// Gestiona el equipo de hasta 5 Pokémon en localStorage y actualiza armario_pokemon.html.

(function () {
  var STORAGE_KEY = 'balatro-equipo-pokemon';
  var MAX_EQUIPO = 5;
  var EQUIPO_DEFECTO = ['pikachu'];

  function leerEquipo() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return EQUIPO_DEFECTO.slice();
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return EQUIPO_DEFECTO.slice();
      return parsed.slice(0, MAX_EQUIPO);
    } catch (e) {
      return EQUIPO_DEFECTO.slice();
    }
  }

  function guardarEquipo(equipo) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(equipo.slice(0, MAX_EQUIPO)));
    } catch (e) {
      // Ignorar si localStorage no está disponible
    }
  }

  function obtenerIdPokemon(tarjeta, indice) {
    if (tarjeta.dataset.pokemon) {
      return tarjeta.dataset.pokemon.toLowerCase();
    }
    var nombre = tarjeta.querySelector('.item-name');
    if (nombre && nombre.textContent.trim()) {
      return nombre.textContent.trim().toLowerCase();
    }
    return 'pokemon-' + indice;
  }

  function pintarContador(equipo) {
    var contador = document.getElementById('equipo-contador');
    if (contador) {
      contador.textContent = equipo.length + ' / ' + MAX_EQUIPO + ' equipados';
    }
  }

  function pintarTarjetas(tarjetas, equipo) {
    tarjetas.forEach(function (item) {
      var estaEquipado = equipo.indexOf(item.idPokemon) !== -1;
      var badge = item.el.querySelector('.item-badge');
      var boton = item.el.querySelector('button');

      item.el.classList.toggle('equipado', estaEquipado);
      item.el.style.borderColor = estaEquipado ? 'var(--accent-yellow)' : '';

      if (badge) {
        badge.textContent = estaEquipado ? '✓ En equipo' : 'En tu colección';
        badge.style.color = estaEquipado ? '#10b981' : '';
      }

      if (boton) {
        boton.textContent = estaEquipado ? 'Desequipar' : 'Equipar';
        boton.disabled = false;
      }
    });

    pintarContador(equipo);
  }

  function iniciar() {
    var contenedor = document.querySelector('.shop-grid');
    if (!contenedor) return;

    var tarjetas = Array.from(contenedor.querySelectorAll('.item-card')).map(function (el, idx) {
      return {
        el: el,
        idPokemon: obtenerIdPokemon(el, idx)
      };
    });

    if (!tarjetas.length) return;

    var equipoActual = leerEquipo();

    function alternarPokemon(idPokemon) {
      var indice = equipoActual.indexOf(idPokemon);

      // Si ya está equipado, se desequipa
      if (indice !== -1) {
        equipoActual.splice(indice, 1);
        guardarEquipo(equipoActual);
        pintarTarjetas(tarjetas, equipoActual);
        return true;
      }

      // Si no está equipado, comprobar límite de 5
      if (equipoActual.length >= MAX_EQUIPO) {
        alert('Solo puedes equipar hasta ' + MAX_EQUIPO + ' Pokémon. Desequipa uno antes de asignar otro.');
        return false;
      }

      equipoActual.push(idPokemon);
      guardarEquipo(equipoActual);
      pintarTarjetas(tarjetas, equipoActual);
      return true;
    }

    tarjetas.forEach(function (item) {
      item.el.addEventListener('click', function () {
        alternarPokemon(item.idPokemon);
      });
    });

    pintarTarjetas(tarjetas, equipoActual);

    window.BalatroArmarioPokemon = {
      equipo: function () { return equipoActual.slice(); },
      alternar: alternarPokemon,
      maximo: MAX_EQUIPO
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();