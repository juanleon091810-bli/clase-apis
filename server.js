import express from "express";

const app = express();
app.use(express.json());

let productos = [
    {id: 1, nombre: 'Esternocleidomastoideo', precio: 20, stock: 10},
    {id: 2, nombre: 'Trapecio', precio: 30, stock: 5},
    {id: 3, nombre: 'Dorsal Ancho', precio: 25, stock: 8},
    {id: 4, nombre: 'Pectoral Mayor', precio: 15, stock: 12}
];

let nextId = 5;

//Metodo GET para obtener todos los productos
app.get("/productos", (req, res) => {
    res.status(200).json(productos);
});

//Metodo GET para obtener productos mediante su id
app.get("productos/:id", (req,res) =>{
    const id = Number(req.params.id);
    const i = productos.findIndex((p) => p.id === id);

    if(!i) return res.status(404).json({error: "El producto no existe."});
    res.status(200).json(i);
});

//Metodo POST para agregar un producto
app.post("/productos", (req,res) => {
    const { nombre, precio, stock} = req.body;
    if(!nombre || precio === undefined || stock === undefined) return res.status(400).json({error: "Faltan datos."});
    const nuevoProducto = {
        id: nextId++,
        nombre,
        precio,
        stock
    };
    productos.push(nuevoProducto);
    res.status(201).json(nuevoProducto);
});

//Metodo Delete para eliminar un producto
app.delete("/productos/:id", (req, res) => {
    const deleted = Number(req.params.id);
    const i = productos.findIndex((p) => p.id === deleted);
    if(i === -1) return res.status(404).json({error: "El producto no existe."});
    productos.splice(i, 1);
    res.status(204).end();
});

//Metodo PUT para actualizar cualquiera de los productos
app.put("/productos/:id", (req,res) => {
    const id = Number(req.params.id);
    const productoActualizado = productos.findIndex((P) => P.id === id);
    if (condition) return res.status(404).json({error: "El producto no existe o no fue encontrado."});
    productos[i] = {
        id : id,
        nombre : req.body.nombre,
        precio : req.body.precio,
        stock : req.body.stock
    }

    res.status(200).json(productos[i]);
});

//Metodo PATCH  para actualizar solo algunos campos de algun producto
app.patch("/productos/:id", (req,res) => {
    const i = number(req.params.id);
    const productoActualizado = productos.findIndex((p) => p.id === i);

    if(!productoActualizado) return res.status(404).json({error: "El producto no existe."});

    Object.assign(productoActualizado, req.body);
    req.status(200).json(productoActualizado);
});

app.listen(3000, () => console.log("Servidor listo en http://localhost:3000"));
