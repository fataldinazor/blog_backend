const express = require('express');
require('dotenv').config({pathFile: "./.env"});
const PORT = 3000 || process.env.PORT;
const {PrismaClient} = require('@prisma/client');
const routes = require("./routes");
const app= express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users",routes.users)


app.listen(PORT, ()=>console.log(`The server is listening at ${PORT}`));