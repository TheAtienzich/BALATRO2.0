-- Borrado para reconstruir desde cero (solo en desarrollo)
DROP TABLE IF EXISTS
    compra_detalle, compra, carrito_item, carrito,
    elemento_coleccion, paquete_divisas, pokemon, carta, producto,
    partida_jugador, partida, servidor,
    configuracion, jugador, usuario_sin_conexion, admin, usuario,
    baraja, efectividad, tipo_pokemon
CASCADE;


-- ============================================
-- 1. TABLAS BASE (sin claves foráneas)
-- ============================================

CREATE TABLE usuario (
    id              SERIAL PRIMARY KEY,
    correo          VARCHAR(255) NOT NULL UNIQUE,
    contrasenya      VARCHAR(255) NOT NULL,          -- guardar hash, nunca texto plano
    estado_conexion BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE servidor (
    id_servidor       SERIAL PRIMARY KEY,
    ip                VARCHAR(45) NOT NULL UNIQUE,
    num_jugadores_max INTEGER NOT NULL DEFAULT 4,
    estado            VARCHAR(20) NOT NULL
);

CREATE TABLE baraja (
    id_baraja SERIAL PRIMARY KEY,
    valor     INTEGER NOT NULL,
    color     VARCHAR(20) NOT NULL
);


CREATE TABLE tipo_pokemon (
    nombre VARCHAR(20) PRIMARY KEY
);

CREATE TABLE efectividad (
    tipo_atacante VARCHAR(20) REFERENCES tipo_pokemon(nombre),
    tipo_defensor VARCHAR(20) REFERENCES tipo_pokemon(nombre),
    multiplicador NUMERIC(3,2) NOT NULL CHECK (multiplicador IN (0, 0.5, 1, 2)),
    PRIMARY KEY (tipo_atacante, tipo_defensor)
);

-- ============================================
-- 2. HERENCIA DE USUARIO (Admin, UsuarioSinConexion, Jugador)
-- ============================================

CREATE TABLE admin (
    usuario_id INTEGER PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE usuario_sin_conexion (
    usuario_id  INTEGER PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    id_temporal VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE jugador (
    usuario_id   INTEGER PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    nombre       VARCHAR(100) NOT NULL,
    descripcion  TEXT,
    foto         VARCHAR(255),
    saldo_fichas INTEGER NOT NULL DEFAULT 0 CHECK (saldo_fichas >= 0)
);

-- 1:1 Usuario - Configuracion
CREATE TABLE configuracion (
    id_config      SERIAL PRIMARY KEY,
    usuario_id     INTEGER NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
    apariencia     VARCHAR(20) NOT NULL DEFAULT 'claro',
    idioma         VARCHAR(10) NOT NULL DEFAULT 'es',
    musica         BOOLEAN NOT NULL DEFAULT TRUE,
    efectos_sonido BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================
-- 3. PARTIDAS
-- ============================================

-- N:1 Partida - Servidor (aloja)
CREATE TABLE partida (
    id_partida   SERIAL PRIMARY KEY,
    servidor_id  INTEGER NOT NULL REFERENCES servidor(id_servidor),
    fecha        TIMESTAMP NOT NULL DEFAULT NOW(),
    estado       VARCHAR(20) NOT NULL,
    ronda_actual INTEGER NOT NULL DEFAULT 1
);

-- N:M Jugador - Partida (participa), con atributos de la relación
CREATE TABLE partida_jugador (
    partida_id INTEGER REFERENCES partida(id_partida) ON DELETE CASCADE,
    jugador_id INTEGER REFERENCES jugador(usuario_id),
    puntos     INTEGER NOT NULL DEFAULT 0,
    posicion   INTEGER,
    ganador    BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (partida_id, jugador_id)
);

-- ============================================
-- 4. PRODUCTOS (Carta, Pokemon, PaqueteDivisas)
-- ============================================

CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    precio      NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    tipo        VARCHAR(20) NOT NULL CHECK (tipo IN ('CARTA', 'POKEMON', 'PAQUETE')),
    UNIQUE (nombre, tipo)
);

-- Subtipo: la PK es también FK a producto (id_carta del diagrama no hace falta)
CREATE TABLE carta (
    producto_id INTEGER PRIMARY KEY REFERENCES producto(id_producto) ON DELETE CASCADE,
    baraja_id   INTEGER NOT NULL REFERENCES baraja(id_baraja),   -- 1:N Baraja - Carta
    puntuacion  INTEGER NOT NULL
);

CREATE TABLE pokemon (
    producto_id INTEGER PRIMARY KEY REFERENCES producto(id_producto) ON DELETE CASCADE,
    pokeapi_id  INTEGER NOT NULL UNIQUE,
    valor       INTEGER NOT NULL,
    tipo        VARCHAR(20) NOT NULL REFERENCES tipo_pokemon(nombre),
    fortaleza   VARCHAR(50),
    debilidad   VARCHAR(50)
);

CREATE TABLE paquete_divisas (
    producto_id     INTEGER PRIMARY KEY REFERENCES producto(id_producto) ON DELETE CASCADE,
    cantidad_fichas INTEGER NOT NULL CHECK (cantidad_fichas > 0)
);

-- ============================================
-- 5. COLECCIÓN (Jugador guarda ElementoColeccion)
-- ============================================

CREATE TABLE elemento_coleccion (
    id_elemento     SERIAL PRIMARY KEY,
    jugador_id      INTEGER NOT NULL REFERENCES jugador(usuario_id) ON DELETE CASCADE,
    producto_id     INTEGER NOT NULL REFERENCES producto(id_producto),
    equipado        BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_obtencion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. CARRITO Y COMPRAS
-- ============================================

-- 1:1 Jugador - Carrito (posee)
CREATE TABLE carrito (
    id_carrito     SERIAL PRIMARY KEY,
    jugador_id     INTEGER NOT NULL UNIQUE REFERENCES jugador(usuario_id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- N:M Carrito - Producto (contiene), con cantidad
CREATE TABLE carrito_item (
    carrito_id  INTEGER REFERENCES carrito(id_carrito) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES producto(id_producto),
    cantidad    INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    PRIMARY KEY (carrito_id, producto_id)
);

-- 1:N Jugador - Compra (realiza)
CREATE TABLE compra (
    id_compra    SERIAL PRIMARY KEY,
    jugador_id   INTEGER NOT NULL REFERENCES jugador(usuario_id),
    fecha_compra TIMESTAMP NOT NULL DEFAULT NOW(),
    metodo_pago  VARCHAR(30) NOT NULL,
    precio_total NUMERIC(10,2) NOT NULL CHECK (precio_total >= 0)
);

-- N:M Compra - Producto (incluye), con cantidad y precio pagado
CREATE TABLE compra_detalle (
    compra_id       INTEGER REFERENCES compra(id_compra) ON DELETE CASCADE,
    producto_id     INTEGER REFERENCES producto(id_producto),
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (compra_id, producto_id)
);