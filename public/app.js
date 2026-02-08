// --- UN MOLDE PARA CADA TAREA INDIVIDUAL ---
class Tarea {
    constructor(nombre) {
        this.id = Date.now(); // La fecha actual como ID unico
        this.nombre = nombre;
        this.completada = false; // La taera esta incompleta por deafult
    }

    // Metodo para marcar como completada/pendiente las tareas
    toggleEstado() {
        this.completada = !this.completada;
    }

    // Metodo para editar el nombre de la tarea
    editarNombre(nuevoNombre) {
        this.nombre = nuevoNombre;
    }
}

// --- GESTOR DE TAREAS ---
class GestorDeTareas {
    constructor() {
        // Cuando inicializamos, cargamos las tareas guardadas en el localStorage si no hay nada se crea un arreglo vacio
        this.tareas = JSON.parse(localStorage.getItem('teslaTasks')) || [];
        this.tareaEditandoId = null; 
    }

    agregarTarea(nombre) {
        if (nombre.trim() === '') return;
        const nuevaTarea = new Tarea(nombre);
        this.tareas.push(nuevaTarea);
        this.guardarYRenderizar();
    }
    

    eliminarTarea(id) {
        // Filtrar: se dejan pasar todas las tareas que no coincidan con el ID
        this.tareas = this.tareas.filter(tarea => tarea.id !== id);
        this.guardarYRenderizar();
    }


    toggleTarea(id) {
        //Se busca la tarea por ID y se cambia su estado
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.completada = !tarea.completada;
            this.guardarYRenderizar();
        }
    }


    // 1. Abrir el Modal
    iniciarEdicion(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            this.tareaEditandoId = id; // Se guarda el ID temporalmente
            
            // Referencias al DOM
            const modal = document.getElementById('modal-overlay');
            const input = document.getElementById('input-editar');
            
            // Se llenara el input con el nombre actual
            input.value = tarea.nombre;
            
            // Se muestra el modal (quitamos la clase hidden)
            modal.classList.remove('hidden');
            input.focus(); 
        }
    }

    // 2. Guardar lo que escribió el usuario
    guardarEdicion() {
        if (this.tareaEditandoId) {
            const nuevoNombre = document.getElementById('input-editar').value;
            
            if (nuevoNombre.trim() !== "") {
                const tarea = this.tareas.find(t => t.id === this.tareaEditandoId);
                if (tarea) {
                    tarea.nombre = nuevoNombre;
                    this.guardarYRenderizar();
                }
            }
            this.cerrarModal();
        }
    }

    cerrarModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
        this.tareaEditandoId = null; // Limpiamos el ID
    }

    guardarYRenderizar() {
        localStorage.setItem('teslaTasks', JSON.stringify(this.tareas));
        this.render();
    }

    render() {
        const lista = document.getElementById('lista-tareas');
        lista.innerHTML = ''; 

        this.tareas.forEach(tarea => {
            const itemHTML = `
                <li class="task-item ${tarea.completada ? 'completada' : ''}">
                    <span>${tarea.nombre}</span>
                    <div class="actions">
                        <button class="btn-check" onclick="app.completar(${tarea.id})">✔</button>
                        <button class="btn-edit" onclick="app.abrirModal(${tarea.id})">Editar</button>
                        <button class="btn-delete" onclick="app.eliminar(${tarea.id})">X</button>
                    </div>
                </li>
            `;
            lista.innerHTML += itemHTML;
        });
    }
}

// --- INICIALIZACION-
const gestor = new GestorDeTareas();
gestor.render();

// Eventos para agregar tarea nueva
document.getElementById('btn-agregar').addEventListener('click', () => {
    const input = document.getElementById('nueva-tarea');
    gestor.agregarTarea(input.value);
    input.value = '';
});

// Eventos para el modal de edicion
document.getElementById('btn-guardar-cambios').addEventListener('click', () => {
    gestor.guardarEdicion();
});

document.getElementById('btn-cancelar').addEventListener('click', () => {
    gestor.cerrarModal();
});

// Objetos globales para el HTML
const app = {
    eliminar: (id) => gestor.eliminarTarea(id),
    abrirModal: (id) => gestor.iniciarEdicion(id), 
    completar: (id) => gestor.toggleTarea(id)
};