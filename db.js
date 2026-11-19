import mysql from "mysql12/promise";

export const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "tienda"
});