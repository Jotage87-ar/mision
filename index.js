const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(express.json());

// Ruta para obtener los datos de los usuarios (monedas)
app.get("/users", (req, res) => {
    fs.readFile("users.json", "utf8", (err, data) => {
        if (err) {
            return res.status(500).send("Error al leer los datos de los usuarios.");
        }
        res.json(JSON.parse(data));
    });
});

// Ruta para realizar una misión
app.post("/mission", (req, res) => {
    const { user, action } = req.body;

    fs.readFile("users.json", "utf8", (err, data) => {
        if (err) {
            return res.status(500).send("Error al leer los datos de los usuarios.");
        }

        const users = JSON.parse(data);

        if (!users[user]) {
            return res.status(404).send("Usuario no encontrado.");
        }

        const userData = users[user];
        let reward = 0;
        let errorMessage = "";

        // Simulando el porcentaje de falla de la misión
        const successChance = Math.random() > 0.3; // 70% de éxito

        if (successChance) {
            reward = 10; // Recompensa si tiene éxito
            userData.coins += reward;
            res.send(`${user} completó la misión y ganó ${reward} monedas.`);
        } else {
            errorMessage = "Fallaste en la misión.";
            // Si no tiene suficientes monedas, puede pedir un préstamo
            if (userData.coins < 10) {
                errorMessage += " No tienes suficientes monedas, pero puedes pedir un préstamo.";
                userData.coins += 10; // Se le presta 10 monedas
            }
            res.send(errorMessage);
        }

        // Guardar los cambios en el archivo users.json
        fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send("Error al guardar los datos de los usuarios.");
            }
        });
    });
});

// Configurar el servidor
app.listen(port, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${port}`);
});
