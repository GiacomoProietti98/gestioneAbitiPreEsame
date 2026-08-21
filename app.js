const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

//MIDDLEWARE
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());

//ROUTES
app.use("/api", routes);

//HELLO WORLD
app.get("/hello", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "Hello World!", timestamp: new Date() });
});

//404 — rotta inesistente (senza questo Express risponde in HTML)
app.use((req, res) => {
  res.status(404).json({
    status: "errore",
    message: `Rotta non trovata: ${req.originalUrl}`,
  });
});

//ERROR — rete di sicurezza per gli errori non gestiti dai controller
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status < 500) {
    return res.status(status).json({ status: "errore", message: err.message });
  }

  console.error(err);
  res
    .status(500)
    .json({ status: "errore", message: "Errore interno del server" });
});

module.exports = app;
