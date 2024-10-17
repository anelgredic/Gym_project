const express = require("express");
const userRouter = require("./routers/user");
const gymRouter = require("./routers/gym");
const planRouter = require("./routers/plan");

const { sequelize } = require("./database/models");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(gymRouter);
app.use(planRouter);

const port = process.env.PORT;

async function main() {
  await sequelize
    .sync({ alter: true })
    .then(() => {
      app.listen(port, () => {
        console.log(`Server sluša na portu ${port}`);
      });
    })
    .catch((err) => {
      console.error("Greška prilikom sinhronizacije sa bazom podataka:", err);
    });
}

main();
