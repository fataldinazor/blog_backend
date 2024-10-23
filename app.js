const express = require("express");
require("dotenv").config({ pathFile: "./.env" });
const PORT = 3000 || process.env.PORT;
const routes = require("./routes");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", routes.authenticate);
app.use("/api/v1/posts", routes.posts);
app.use("/api/v1/users", routes.users);

app.listen(PORT, () => console.log(`The server is listening at ${PORT}`));
