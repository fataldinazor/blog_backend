const posts = require("./posts");
const authenticate= require("./authenticate");
const users = require("./users")
const homepage = require("./homepage");

module.exports={
    homepage,
    posts,
    authenticate,
    users,
}