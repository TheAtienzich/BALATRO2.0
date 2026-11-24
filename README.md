# BALATRO 2.0



# Inicio de partida y turnos

Inicio de la partida

1\. Se levanta la tienda de comodines y cada jugador empieza con **2$,** suficiente para comprar su primer comodín común.

2\. Un randomizador decide qué jugador abre la partida y después los turnos se alternan por orden.

Estructura de un turno

1\. El jugador recibe **7 cartas** aleatorias de su baraja de 52. Cada jugador recibe sus cartas al empezar su propio turno.

2\. Puede **descartar hasta 5 cartas, un máximo de 2 veces,** para robar otras en su lugar.

3\. Forma la mejor combinación de póker que pueda con sus cartas (ver la sección de manos).

4\. El jugador elige un Pokémon atacante y un objetivo, que puede ser cualquier Pokémon de los 3 rivales. Si tiene un comodín que lo permite, puede atacar a todos los Pokémon de un rival a la vez.

5\. Se calcula el daño y se aplica al objetivo, teniendo en cuenta el tipo, la habilidad del atacante y los comodines.

6\. El jugador cobra el dinero de la mano y termina su turno.

Una **ronda** son los 4 turnos, uno por cada jugador. Cuando la baraja se agota, las cartas descartadas y jugadas se barajan para formar una nueva.



#  Guía de ejecución



### 1. Instalar las dependencias

Desde la raíz del proyecto:

```powershell
npm install express mongoose bcryptjs jsonwebtoken
```

> `node_modules` no se sube a GitHub, por lo que es necesario instalar las dependencias en cada equipo.



### 2. Crear la cuenta de prueba

```powershell
node server\seed.js
```

- Si aparece `Usuario de prueba creado`, la cuenta se ha creado correctamente.
- Si aparece `El usuario de prueba ya existe`, la cuenta ya estaba en la base de datos.

### 3. Iniciar el servidor

```powershell
node server\app.js
```

Debe mostrarse:

```
MongoDB conectado
Servidor en http://localhost:3000
```

### 4. Iniciar sesión


| Campo      | Valor                |
|------------|----------------------|
| Correo     | `admin@balatro.com`  |
| Contraseña | `12345678`           |

Tras iniciar sesión correctamente, se redirige a `/menu.html`.

---

> **Nota:** en macOS o Linux, usar `/` en lugar de `\` en las rutas de los comandos (por ejemplo, `node server/seed.js`).