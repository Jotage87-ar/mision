const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

let usersData = {};  // Almacena los datos de los usuarios

// Cargar usuarios desde el archivo JSON al iniciar
const loadUsers = () => {
  try {
    const data = fs.readFileSync('users.json', 'utf8');
    usersData = JSON.parse(data);
  } catch (err) {
    console.log('Error al leer el archivo users.json:', err);
  }
};

// Guardar datos de usuarios al archivo JSON
const saveUsers = () => {
  fs.writeFileSync('users.json', JSON.stringify(usersData, null, 2));
};

// Ruta para ver el saldo de monedas de un usuario
app.get('/monedas', (req, res) => {
  const user = req.query.user;

  if (usersData[user]) {
    res.send(`${user}, tienes ${usersData[user].monedas} monedas.`);
  } else {
    res.send(`Usuario no encontrado. Usa !mision para comenzar.`);
  }
});

// Ruta para solicitar un préstamo
app.get('/prestamo', (req, res) => {
  const user = req.query.user;

  if (usersData[user] && usersData[user].monedas <= 99) {
    // Otorgar un préstamo de 100 monedas
    usersData[user].monedas += 100;
    saveUsers();
    res.send(`${user}, se te ha otorgado un préstamo de 100 monedas. Ahora tienes ${usersData[user].monedas} monedas.`);
  } else if (usersData[user]) {
    res.send(`${user}, no necesitas un préstamo. Tienes más de 100 monedas.`);
  } else {
    res.send(`Usuario no encontrado. Usa !mision para comenzar.`);
  }
});

// Función para generar una misión aleatoria
const generarMision = (dificultad) => {
  const enemigosFaciles = [
    'Luchaste contra Hoja Inerte', 'Luchaste contra Rata Vagabunda', 'Luchaste contra Conejo Salvaje', 'Luchaste contra @TuSexiCosplayer', 'Luchaste contra Zombi Andante',
    'Luchaste contra Lombriz Gigante', 'Luchaste contra Murciélago Sombrío', 'Luchaste contra Pájaro Agazapado', 'Luchaste contra Lobo Cazador', 'Luchaste contra Hormiga Guerrera'
  ];

  const enemigosIntermedios = [
    'Luchaste contra Troll de Bosque', 'Luchaste contra Basilisco de Piedra', 'Luchaste contra Gigante de Hielo', 'Luchaste contra León del Desierto', 'Luchaste contra Gárgola Maldita',
    'Luchaste contra Tigre de Montaña', 'Luchaste contra Dragón de Fuego', 'Luchaste contra Hombre Lobo', 'Luchaste contra Hada Oscura', 'Luchaste contra Minotauro'
  ];

  const enemigosDificiles = [
    'Luchaste contra Demonio Destructor', 'Luchaste contra Dragón de Sombra', 'Luchaste contra Vampiro Eterno', 'Luchaste contra Golem de Lava', 'Luchaste contra Kobold Guerrero',
    'Luchaste contra Fénix Ardiente', 'Luchaste contra Espíritu Ancestral', 'Luchaste contra Guerrero Maldito', 'Luchaste contra Dios Oscuro', 'Luchaste contra @Monolito00'
  ];

  const enemigosEpicos = [
    'Luchaste contra @jotage87', 'Luchaste contra @karii_cba', 'Luchaste contra Dragón Celestial', 'Luchaste contra Troll Colosal',
    'Leviatán Marítimo', 'Luchaste contra Serpiente de Hierro', 'Luchaste contra Tormenta Abismal', 'Luchaste contra Coloso Eterno', 'Luchaste contra Reina de las Sombras',
    'Luchaste contra Rey de los Cielos'
  ];

  // Seleccionar el enemigo según la dificultad
  let enemigo;
  let recompensa;

  switch (dificultad) {
    case 100: // Misión fácil
      enemigo = enemigosFaciles[Math.floor(Math.random() * enemigosFaciles.length)];
      recompensa = 150; // Recompensa por misión fácil
      break;
    case 300: // Misión intermedia
      enemigo = enemigosIntermedios[Math.floor(Math.random() * enemigosIntermedios.length)];
      recompensa = 400; // Recompensa por misión intermedia
      break;
    case 500: // Misión difícil
      enemigo = enemigosDificiles[Math.floor(Math.random() * enemigosDificiles.length)];
      recompensa = 600; // Recompensa por misión difícil
      break;
    case 2000: // Misión épica
      enemigo = enemigosEpicos[Math.floor(Math.random() * enemigosEpicos.length)];
      recompensa = 4000; // Recompensa por misión épica
      break;
    default:
      return { mensaje: 'Dificultad no válida.', recompensa: 0 };
  }

  // Crear mensaje de misión
  let mensaje = `PELEASTE CONTRA ${enemigo}, GANASTE ${recompensa} monedas.`;

  return { mensaje, recompensa };
};

// Ruta para realizar una misión
app.get('/mision', (req, res) => {
  const user = req.query.user;
  const costo = parseInt(req.query.cost);

  if (!user || !costo) {
    return res.send('Por favor, usa el comando correctamente. Ejemplo: !mision 100');
  }

  if (!usersData[user]) {
    return res.send('Usuario no encontrado. Usa !registrar para comenzar.');
  }

  if (usersData[user].monedas < costo) {
    return res.send(`${user}, no tienes suficientes monedas para esta misión.`);
  }

  // Generar misión
  const mision = generarMision(costo);
  if (mision.recompensa > 0) {
    usersData[user].monedas -= costo;
    usersData[user].monedas += mision.recompensa;
    saveUsers();
    res.send(`${user}, ${mision.mensaje}`);
  } else {
    res.send('Misión no válida.');
  }
});

// Inicializar los usuarios cuando el servidor se inicia
loadUsers();

// Servir la aplicación en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
