const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const connectDB = require("./config/db");
const { clerkMiddleware } = require("@clerk/express");
const { initSocket } = require("./config/socket");

const app = express();
const server = http.createServer(app);
connectDB();
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(clerkMiddleware());

app.use("/api/verify", require("./routes/verificationRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/transfers", require("./routes/transferRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/risk", require("./routes/riskRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/intelligence", require("./routes/intelligenceRoutes"));
app.use("/api/demo", require("./routes/demoRoutes"));
app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use((err, req, res, next) => {
  console.error("Unhandled API error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Unexpected server error",
  });
});

initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
