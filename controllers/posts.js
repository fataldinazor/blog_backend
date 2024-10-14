const primsa = require("./prisma");
const passport = require("passport");
require("./passport");

const allPosts = [
    passport.authenticate("jwt", {session: false}),
    async (req, res)=>{
        return res.json({msg:"The User is authenticated"})
    }
]

module.exports={
    allPosts,

}