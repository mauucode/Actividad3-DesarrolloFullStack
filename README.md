# 🚗 Tesla Copiloto OS - Full Stack Administrador de Tareas

![Status](https://img.shields.io/badge/Status-Terminado-success)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)
![Security](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-blue)

Bienvenido a **Tesla Copiloto OS**. Esta es una Aplicación Web Full Stack diseñada para la gestión operativa y asignación de tareas.

El proyecto ha evolucionado de una página estática a una **API RESTful** completa con autenticación, roles de usuario y persistencia de datos en el servidor.

---

## 📋 Características Principales

* **Arquitectura Cliente-Servidor:** Backend en Node.js y Frontend en Vanilla JS.
* **Autenticación Segura:** Login protegido con **JWT (JSON Web Tokens)** y contraseñas encriptadas con **Bcrypt**.
* **Roles de Usuario (RBAC):**
    * 👮‍♂️ **Admin:** Control total (Crear, Editar, Asignar, Borrar tareas y Crear Usuarios).
    * 👷 **User:** Acceso restringido (Solo ver sus tareas y actualizar estatus).
* **Persistencia JSON:** Base de datos documental ligera basada en archivos (`users.json` y `tareas.json`).
* **Automatización:** Registro automático de fechas de creación y finalización de tareas.
* **UX Avanzada:** Modales personalizados y sistema de notificaciones.
---

## 🛠️ Tecnologías Utilizadas

* **Backend:** Node.js, Express.js, File System (fs.promises).
* **Frontend:** HTML5, CSS3 (Diseño Tesla Dark Mode), JavaScript (ES6+).
* **Seguridad:** `jsonwebtoken`, `bcryptjs`, `cors`.
* **Utilidades:** `body-parser`.

---

## 🚀 Guía de Instalación y Ejecución

⚠️ **IMPORTANTE:** La carpeta `node_modules` **NO** ha sido incluida. Debes instalar las dependencias antes de iniciar.

### 1. Clonar o Descargar
Descarga este repositorio en tu computadora y abre la terminal en la carpeta raíz del proyecto.

### 2. Instalar Dependencias
Ejecuta el siguiente comando para descargar automáticamente las librerías necesarias (Express, Bcrypt, etc.) descritas en el `package.json`:

```bash
npm install
```

### 3. Iniciar el Servidor
Una vez instaladas las dependencias, enciende el servidor Backend:

```bash
node server.js
```

## 🕹️ Cómo Usar la Aplicación

1.  Abre tu navegador y ve a: **`http://localhost:3000`**
2.  Verás la **Landing Page**. Haz clic en el botón **"Acceso Copiloto OS"**.
3.  Inicia sesión con las siguientes credenciales de prueba:

| Rol | Usuario | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `123` | Control Total + Gestión de Usuarios |
| **Empleado** | `diego` | `diego` | Solo lectura y completar tareas |

> **Nota Importante:** Puedes crear nuevos usuarios desde el Dashboard entrando como Administrador.


