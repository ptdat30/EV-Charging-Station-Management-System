const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Forward request đến User Service
app.use("/users", createProxyMiddleware({
    target: "http://localhost:3001", // User Service
    changeOrigin: true
}));

// Forward request đến Product Service
app.use("/products", createProxyMiddleware({
    target: "http://localhost:3002", // Product Service
    changeOrigin: true
}));

// Forward request đến Order Service
app.use("/orders", createProxyMiddleware({
    target: "http://localhost:3003", // Order Service
    changeOrigin: true
}));

// Forward request đến Notification Service
app.use("/notify", createProxyMiddleware({
    target: "http://localhost:3004", // Notification Service
    changeOrigin: true
}));

app.listen(3000, () => {
    console.log("API Gateway chạy trên port 3000");
});
