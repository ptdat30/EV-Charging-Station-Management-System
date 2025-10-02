const express = require("express");
const app = express();

app.use(express.json());

// Fake data user
let users = [
    { id: 1, name: "Nguyễn Văn A" },
    { id: 2, name: "Trần Thị B" }
];

// Lấy danh sách user
app.get("/users", (req, res) => {
    res.json(users);
});

// Tạo user mới
app.post("/users", (req, res) => {
    const newUser = { id: users.length + 1, name: req.body.name };
    users.push(newUser);
    res.status(201).json(newUser);
});

app.listen(3001, () => {
    console.log("User Service chạy trên port 3001");
});
