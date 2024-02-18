const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_FILE = 'Videojocs_DB.txt';

app.use(bodyParser.json());

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Función para leer la base de datos de videojuegos
function leerDB(callback) {
    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            callback(err);
            return;
        }
        try {
            const videojocs = JSON.parse(data);
            callback(null, videojocs);
        } catch (err) {
            console.error(err);
            callback(err);
        }
    });
}


// Función para escribir en la base de datos de videojuegos
function escribirDB(data, callback) {
    fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8', err => {
        if (err) {
            console.error(err);
            callback(err);
            return;
        }
        callback(null);
    });
}
// Ruta para listar todos los videojuegos
app.get('/videojocs', (req, res) => {
    leerDB((err, videojocs) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(videojocs);
    });
});

// Ruta para obtener un videojuego específico por su ID
app.get('/videojocs/:id', (req, res) => {
    const id = parseInt(req.params.id);
    leerDB((err, videojocs) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        const videojoc = videojocs.find(v => v.ID === id);
        if (!videojoc) {
            res.status(404).send('Videojoc not found');
            return;
        }
        res.json(videojoc);
    });
});

// Ruta para listar todos los videojuegos de una empresa específica
app.get('/videojocs/empresa/:empresa', (req, res) => {
    const empresa = req.params.empresa;
    leerDB((err, videojocs) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        const videojocsEmpresa = videojocs.filter(v => v.EMPRESA === empresa);
        if (videojocsEmpresa.length === 0) {
            res.status(404).send('No videojocs found for the specified company');
            return;
        }
        res.json(videojocsEmpresa);
    });
});

// Ruta para crear un nuevo videojuego
app.post('/videojocs', (req, res) => {
    const nuevoVideojoc = req.body;
    leerDB((err, videojocs) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        // Generar un nuevo ID automáticamente
        nuevoVideojoc.ID = videojocs.length + 1; // Asigna un nuevo ID
        videojocs.push(nuevoVideojoc);
        escribirDB(videojocs, err => {
            if (err) {
                res.status(500).send('Internal Server Error');
                return;
            }
            res.status(201).json(nuevoVideojoc);
        });
    });
});

// Ruta para actualizar los campos de un videojuego dado su ID
app.put('/videojocs/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const newData = req.body;
    leerDB((err, videojocs) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        const index = videojocs.findIndex(v => v.ID === id);
        if (index === -1) {
            res.status(404).send('Videojoc not found');
            return;
        }
        videojocs[index] = { ...videojocs[index], ...newData };
        escribirDB(videojocs, err => {
            if (err) {
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(videojocs[index]);
        });
    });
});

// Ruta para eliminar un videojuego dado su ID
app.delete('/videojocs/:id', (req, res) => {
    const id = parseInt(req.params.id);
    leerDB((err, videojocs) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        const index = videojocs.findIndex(v => v.ID === id);
        if (index === -1) {
            res.status(404).send('Videojoc not found');
            return;
        }
        videojocs.splice(index, 1);
        escribirDB(videojocs, err => {
            if (err) {
                res.status(500).send('Internal Server Error');
                return;
            }
            res.status(204).send(); // No Content
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
