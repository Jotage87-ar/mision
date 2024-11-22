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
    100: { reward: 150, penalty: 100, successRate: 0.8 },
    300: { reward: 500, penalty: 300, successRate: 0.6 },
    500: { reward: 900, penalty: 500, successRate: 0.4 },
    2000: { reward: 4000, penalty: 2000, successRate: 0.5 }, // Épica
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
    if (randomOutcome < mission.successRate) {
        user.coins += mission.reward;
        res.send(`¡${userName}, completaste la misión y ganaste ${mission.reward} monedas! Ahora tienes ${user.coins} monedas.`);
    } else {
        user.coins -= mission.penalty;
        res.send(`¡${userName}, fallaste la misión! Perdiste ${mission.penalty} monedas. Ahora tienes ${user.coins} monedas.`);
    }

    // Guardar usuarios y evitar duplicados
    users = users.filter((u, index, self) => self.findIndex(user => user.name === u.name) === index);
    saveUsers();
});

// Servidor en ejecución
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
