const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Carga de datos inicial de usuarios
let users = [];
try {
    const data = fs.readFileSync('users.json', 'utf8');
    users = JSON.parse(data);
} catch (error) {
    console.error('No se pudo cargar el archivo users.json:', error);
}

// Guardar usuarios en el archivo JSON
function saveUsers() {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

// Configuración de misiones
const missionTiers = {
    100: { reward: 150, penalty: 100, successRate: 0.7, enemies: [
        'Luchaste contra Hoja Inerte', 'Luchaste contra Rata Vagabunda', 'Luchaste contra Conejo Salvaje', 'Luchaste contra @TuSexiCosplayer', 'Luchaste contra Zombi Andante',
        'Luchaste contra Lombriz Gigante', 'Luchaste contra Murciélago Sombrío', 'Luchaste contra Pájaro Agazapado', 'Luchaste contra Lobo Cazador', 'Luchaste contra Hormiga Guerrera'
    ]},
    300: { reward: 500, penalty: 300, successRate: 0.5, enemies: [
        'Luchaste contra Troll de Bosque', 'Luchaste contra Basilisco de Piedra', 'Luchaste contra Gigante de Hielo', 'Luchaste contra León del Desierto', 'Luchaste contra Gárgola Maldita',
        'Luchaste contra Tigre de Montaña', 'Luchaste contra Dragón de Fuego', 'Luchaste contra Hombre Lobo', 'Luchaste contra Hada Oscura', 'Luchaste contra Minotauro'
    ]},
    500: { reward: 900, penalty: 500, successRate: 0.4, enemies: [
        'Luchaste contra Demonio Destructor', 'Luchaste contra Dragón de Sombra', 'Luchaste contra Vampiro Eterno', 'Luchaste contra Golem de Lava', 'Luchaste contra Kobold Guerrero',
        'Luchaste contra Fénix Ardiente', 'Luchaste contra Espíritu Ancestral', 'Luchaste contra Guerrero Maldito', 'Luchaste contra Dios Oscuro', 'Luchaste contra @Monolito00'
    ]},
    2000: { reward: 4000, penalty: 2000, successRate: 0.25, enemies: [
        'Luchaste contra @jotage87', 'Luchaste contra @karii_cba', 'Luchaste contra Dragón Celestial', 'Luchaste contra Troll Colosal',
        'Leviatán Marítimo', 'Luchaste contra Serpiente de Hierro', 'Luchaste contra Tormenta Abismal', 'Luchaste contra Coloso Eterno', 'Luchaste contra Reina de las Sombras',
        'Luchaste contra Rey de los Cielos'
    ]},
};

// Ruta para ejecutar una misión
app.get('/mision', (req, res) => {
    const userName = req.query.user || 'Anónimo';
    const missionCost = parseInt(req.query.cost, 10);

    if (!missionTiers[missionCost]) {
        return res.send('Por favor selecciona un monto válido para la misión: 100, 300, 500 o 2000.');
    }

    const mission = missionTiers[missionCost];

    // Busca al usuario
    let user = users.find((u) => u.name === userName);

    // Si el usuario no existe, se crea con el saldo inicial
    if (!user) {
        user = { name: userName, coins: 200, loan: 0 };
        users.push(user);
    }

    // Verifica si el usuario tiene saldo suficiente o necesita un préstamo
    if (user.coins < missionCost) {
        const loanNeeded = missionCost - user.coins;
        user.loan += loanNeeded;
        user.coins = 0;
        res.send(`No tienes suficientes monedas. Se te ha otorgado un préstamo de ${loanNeeded} monedas.`);
    } else {
        user.coins -= missionCost; // Deduce el costo de la misión
    }

    // Determina el resultado de la misión
    const randomOutcome = Math.random();
    const enemy = mission.enemies[Math.floor(Math.random() * mission.enemies.length)];

    if (randomOutcome < mission.successRate) {
        user.coins += mission.reward;
        res.send(`¡${userName}, completaste la misión contra "${enemy}" y ganaste ${mission.reward} monedas! Ahora tienes ${user.coins} monedas.`);
    } else {
        user.coins -= mission.penalty;
        res.send(`¡${userName}, fallaste la misión contra "${enemy}"! Perdiste ${mission.penalty} monedas. Ahora tienes ${user.coins} monedas.`);
    }

    // Guardar usuarios y evitar duplicados
    users = users.filter((u, index, self) => self.findIndex(user => user.name === u.name) === index);
    saveUsers();
});

// Ruta para obtener saldo de monedas
app.get('/monedas', (req, res) => {
    const userName = req.query.user || 'Anónimo';
    const user = users.find(u => u.name === userName);

    if (user) {
        res.send(`${userName}, tienes ${user.coins} monedas.`);
    } else {
        res.send(`${userName}, no estás registrado.`);
    }
});

// Ruta para solicitar un préstamo
app.get('/prestamo', (req, res) => {
    const userName = req.query.user || 'Anónimo';
    const user = users.find(u => u.name === userName);

    if (user.coins <= 99) {
        const loan = 100 - user.coins;
        user.coins += loan;
        user.loan += loan;
        res.send(`${userName}, te hemos otorgado un préstamo de ${loan} monedas. Ahora tienes ${user.coins} monedas.`);
    } else {
        res.send(`${userName}, no puedes solicitar un préstamo ya que tienes más de 100 monedas.`);
    }

    saveUsers();
});

// Ruta por defecto para indicar uso correcto del comando
app.get('/mision', (req, res) => {
    res.send("Por favor usa !mision seguido de 100, 300, 500 o 2000 para empezar una misión.");
});

// Servidor en ejecución
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
