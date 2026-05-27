const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const { clerkMiddleware } = require("@clerk/express");

const app = express();
connectDB();
console.log(process.env.MONGO_URI);
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/verify", require("./routes/verificationRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/transfers", require("./routes/transferRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/risk", require("./routes/riskRoutes"));
app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});