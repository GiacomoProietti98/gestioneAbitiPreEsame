// Punto unico di traduzione errore -> risposta HTTP.
// I service lanciano Error con una proprieta' `status`; qui viene rispettata,
// gli errori Sequelize prevedibili diventano 400 e tutto il resto 500.
function gestisciErrore(res, err) {
  if (err.name === "SequelizeUniqueConstraintError") {
    const campo = err.errors?.[0]?.path ?? "campo";
    return res.status(400).json({
      status: "errore",
      message: `Esiste già una risorsa con questo ${campo}`,
    });
  }

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      status: "errore",
      message: err.errors.map((e) => e.message).join("; "),
    });
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res
      .status(400)
      .json({ status: "errore", message: "Riferimento non valido" });
  }

  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "errore", message: "Errore interno del server" });
  }

  return res.status(status).json({ status: "errore", message: err.message });
}

// Gli id arrivano sempre come stringa dai path param.
function idValido(id) {
  return /^[1-9]\d*$/.test(String(id));
}

// Da usare nei service: throw erroreHttp('Non trovato', 404).
// Il controller non deve decidere lo status, lo propaga a gestisciErrore.
function erroreHttp(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = { gestisciErrore, idValido, erroreHttp };
