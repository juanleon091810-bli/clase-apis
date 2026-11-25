import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db.js";

const router = Router();

function datosValidos(email, password){
    return(
        typeof email === "string" &&
        typeof password === "string" &&
        email.includes("@") &&
        email.length >= 5 && email.length <= 50 &&
        password.length >= 6

    )
}

// POST /registro: guarda el usuario con la clave convertida en hash
    router.post("/registro", async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!datosValidos(email, password)) {
                return res.status(400).json({
                    error: "Datos inválidos: email válido y password de mínimo 6 caracteres"
                });
            }
 
            const hash = await bcrypt.hash(password, 10);
            await db.query(
                "INSERT INTO usuarios (email, password) VALUES (?, ?)",
                [email, hash]
            );
 
            res.status(201).json({ mensaje: "Usuario creado" });
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ error: "El email ya ha sido registrado anteriormente" });
            }
            console.error(error);
            res.status(500).json({ error: "Error en la base de datos" });
        }
    });
 
    // POST /login: compara la clave y entrega el token
    router.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body;
            if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
                return res.status(400).json({ error: "El email y la contraseña son obligatorios" });
            }
 
            const [filas] = await db.query(
                "SELECT id, email, password, rol FROM usuarios WHERE email = ?",
                [email]
            );
            const usuario = filas[0];
 
            const ok = usuario && await bcrypt.compare(password, usuario.password);
            if (!ok) {
                return res.status(401).json({ error: "Email o clave incorrectos" });
            }
 
            const token = jwt.sign(
                { id: usuario.id, rol: usuario.rol },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            res.status(200).json({ token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error en el servidor" });
        }
    });
 
    export default router;