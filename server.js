const express = require('express');
const fs = require('fs').promises; 
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET_KEY = "tesla_secret_key_super_segura"; 

// --- MIDDLEWARE ---
app.use(bodyParser.json());
app.use(express.static('public')); // (Frontend)

// Middleware de Autenticación 
const verificarToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) return res.status(403).json({ message: "Token requerido" });

    const token = header.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token inválido" });
        req.user = decoded; // Guardara los datos del usuario en la petición
        next();
    });
};

// --- RUTAS DE AUTENTICACIÓN ---

// 1. Registro (Para poder crear a mis usuarios nuevos)
app.post('/api/register', async (req, res, next) => {
    try {
        const { username, password, name, role } = req.body;
        const usersData = await fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8');
        const users = JSON.parse(usersData || '[]');

        if (users.find(u => u.username === username)) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: Date.now(), username, password: hashedPassword, name, role: role || 'user' };
        
        users.push(newUser);
        await fs.writeFile(path.join(__dirname, 'data', 'users.json'), JSON.stringify(users, null, 2));
        
        res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
        next(error);
    }
});

// 2. Login
app.post('/api/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const usersData = await fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8');
        const users = JSON.parse(usersData || '[]');
        
        const user = users.find(u => u.username === username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, role: user.role, name: user.name });
    } catch (error) {
        next(error);
    }
});


// --- RUTA: OBTENER LISTA DE USUARIOS  ---
app.get('/api/users', verificarToken, async (req, res, next) => {
    try {
        // Solo permitimos que el admin vea la lista completa para asignar las tareas y a que usuarios
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Acceso denegado" });

        const usersData = await fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8');
        const users = JSON.parse(usersData || '[]');

        // Mapeamos para devolver solo lo necesario (Nombre y Username)
        const listaUsuarios = users.map(u => ({
            name: u.name,       // El nombre real (Diego)
            username: u.username // El usuario de login (diego)
        }));

        res.json(listaUsuarios);
    } catch (error) {
        next(error);
    }
});

// --- RUTAS DE TAREAS (CRUD) ---

const TAREAS_FILE = path.join(__dirname, 'data', 'tareas.json');

// GET: Obtener tareas
app.get('/api/tareas', verificarToken, async (req, res, next) => {
    try {
        const data = await fs.readFile(TAREAS_FILE, 'utf8');
        let tareas = JSON.parse(data || '[]');

        // Roles:
        // Admin ve todo. Usuario solo ve las asignadas a él.
        if (req.user.role !== 'admin') {
            tareas = tareas.filter(t => t.assignedTo === req.user.name);
        }
        res.json(tareas);
    } catch (error) {
        next(error);
    }
});

// POST: Crear tarea (Solo Admin)
app.post('/api/tareas', verificarToken, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Acceso denegado" });

        const { title, assignedTo, assignmentArea } = req.body;
        const data = await fs.readFile(TAREAS_FILE, 'utf8');
        const tareas = JSON.parse(data || '[]');

        const nuevaTarea = {
            id: Date.now(),
            title,
            createdAt: new Date().toLocaleDateString(),
            assignedTo, // Nombre del empleado
            createdBy: req.user.name, // El admin que la creó
            status: "Pendiente",
            assignmentArea, // Ej: Mantenimiento Modelo Y
        };

        tareas.push(nuevaTarea);
        await fs.writeFile(TAREAS_FILE, JSON.stringify(tareas, null, 2));
        res.status(201).json(nuevaTarea);
    } catch (error) {
        next(error);
    }
});

// PUT: Actualizar tarea
// PUT: Actualizar tarea (Estatus y Datos + Fecha en que se completo)
app.put('/api/tareas/:id', verificarToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, title, assignedTo } = req.body;
        
        const data = await fs.readFile(TAREAS_FILE, 'utf8');
        let tareas = JSON.parse(data || '[]');

        const index = tareas.findIndex(t => t.id == id);
        if (index === -1) return res.status(404).json({ message: "Tarea no encontrada" });

        // LOGICA DE PERMISOS 
        if (req.user.role !== 'admin') {
            if (tareas[index].assignedTo !== req.user.name) {
                return res.status(403).json({ message: "No puedes editar esta tarea" });
            }
        } else {
            // Si es Admin, actualiza título y asignado 
            tareas[index].title = title || tareas[index].title;
            tareas[index].assignedTo = assignedTo || tareas[index].assignedTo;
        }

        // --- LÓGICA DE FECHA AUTOMÁTICA ---
        if (status) {
            tareas[index].status = status;
            
            // Si marcan como Completada, guardamos la fecha de hoy
            if (status === 'Completada') {
                tareas[index].completedAt = new Date().toLocaleDateString();
            } 
            // Si la regresan a Pendiente o Proceso, borramos la fecha de fin que ya tenia
            else {
                tareas[index].completedAt = null; 
            }
        }

        await fs.writeFile(TAREAS_FILE, JSON.stringify(tareas, null, 2));
        res.json(tareas[index]);
    } catch (error) {
        next(error);
    }
});




// DELETE: Eliminar tarea (Solo Admin)
app.delete('/api/tareas/:id', verificarToken, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Solo admin puede borrar" });

        const { id } = req.params;
        const data = await fs.readFile(TAREAS_FILE, 'utf8');
        let tareas = JSON.parse(data || '[]');

        tareas = tareas.filter(t => t.id != id);
        
        await fs.writeFile(TAREAS_FILE, JSON.stringify(tareas, null, 2));
        res.json({ message: "Tarea eliminada" });
    } catch (error) {
        next(error);
    }
});

// --- MIDDLEWARE DE MANEJO DE ERRORES ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ocurrió un error en el servidor Tesla OS.' });
});

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Tesla Server corriendo en http://localhost:${PORT}`);
});