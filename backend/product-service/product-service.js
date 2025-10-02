const express = require("express");
const app = express();

app.use(express.json());

// Fake data product
let products = [
    { id: 1, name: "Sạc nhanh EV 22kW" },
    { id: 2, name: "Cáp sạc xe điện" }
];

// Lấy danh sách sản phẩm
app.get("/products", (req, res) => {
    res.json(products);
});

// Thêm sản phẩm mới
app.post("/products", (req, res) => {
    const newProduct = { id: products.length + 1, name: req.body.name };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.listen(3002, () => {
    console.log("Product Service chạy trên port 3002");
});
