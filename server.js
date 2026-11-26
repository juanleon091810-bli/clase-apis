import { db } from "./db.js";
import express from "express";
import authRouter from "./auth.js";

const app = express();
app.use(express.json());
app.use(authRouter);
app.set("json spaces", 2);

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

//ruta get
app.get("/articulos", async (req, res) => {
    try {
        const { nombre } = req.query;
        if (nombre) {
            const [filas] = await db.query("SELECT * FROM productos WHERE nombre LIKE ?", [`%${nombre}%`]);
            return res.status(200).json(filas);
        }
        const [filas] = await db.query("SELECT * FROM productos");
        res.status(200).json(filas);
    } catch(error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

//ruta get por id
app.get("/articulos/:id", async (req, res) => {
    try {
        const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
        if (filas.length === 0) {
            return res.status(404).json({ error: "Artículo no encontrado" });
        }
        res.status(200).json(filas[0]);
    } catch (error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

//ruta post
app.post("/articulos", async (req, res) => {
    try {
        const { nombre, precio, existencia } = req.body;
        if (!nombre || precio === undefined) {
            return res.status(400).json({ error: "Datos incompletos: nombre y precio son requeridos" });
        }
        const stock = existencia !== undefined ? existencia : 0;
        
        const [resultado] = await db.query(
            "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)",
            [nombre, precio, stock]
        );
        
        res.status(201).json({ id: resultado.insertId, nombre: nombre, precio: precio, stock: stock });
    } catch (error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

//ruta post para crear el login y registro
//ruta put
app.put("/articulos/:id", async (req, res) => {
    try {
        const { nombre, precio, stock } = req.body;
        if (!nombre || precio === undefined || stock === undefined) {
            return res.status(400).json({ error: "Datos incompletos: nombre, precio y stock son requeridos" });
        }

        const [resultado] = await db.query(
            "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
            [nombre, precio, stock, req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Artículo no encontrado" });
        }

        res.status(200).json({ id: Number(req.params.id), nombre: nombre, precio: precio, stock: stock });
    } catch (error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

//ruta patch
app.patch("/articulos/:id", async (req, res) => {
    try {
        const { nombre, precio, stock } = req.body;
        
        const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
        if (filas.length === 0) {
            return res.status(404).json({ error: "Artículo no encontrado" });
        }

        const actual = filas[0];
        const nuevonombre = nombre !== undefined ? nombre : actual.nombre;
        const nuevoprecio = precio !== undefined ? precio : actual.precio;
        const nuevastock = stock !== undefined ? stock : actual.stock;

        await db.query(
            "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
            [nuevonombre, nuevoprecio, nuevastock, req.params.id]
        );

        res.status(200).json({ id: Number(req.params.id), nombre: nuevonombre, precio: nuevoprecio, stock: nuevastock });
    } catch (error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

//ruta delete
app.delete("/articulos/:id", async (req, res) => {
    try {
        const [resultado] = await db.query("DELETE FROM productos WHERE id = ?", [req.params.id]);
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Artículo no encontrado" });
        }
        
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));