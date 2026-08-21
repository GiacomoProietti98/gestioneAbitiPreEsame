require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/db");

const PORT = Number(process.env.PORT) || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    // Crea le tabelle mancanti a partire dai modelli.
    // In alternativa si eseguono a mano gli script in sql/.
    await sequelize.sync();
    console.log("DB CONNESSO");

    app.listen(PORT, () => {
      console.log(`Server in ascolto sulla porta ${PORT}`);
    });
  } catch (err) {
    console.error("Errore di avvio:", err);
    process.exit(1);
  }
})();
