const passport= require("passport");

// verfies the jwt token sent by the user when accessing a route
const verifyToken=(req, res, next)=>{
    passport.authenticate("jwt", {session:false}, (err, user, info)=>{
        req.user=user;
        if(err || !user){
            return res.status(403).json({msg: "Unauthorized Access"});
        }
        next()
    })(req, res, next);
}

//authorizes the user for a particular route
const authorizeRole=(requiredRoles)=>{
    return (req, res, next)=>{
        const {role} = req.user
        if(requiredRoles.includes(role)){
            return next();
        }
        return res.status(401).json({msg:"Forbidden: Insufficient Role"});
    }
}

// const authorizeById= (req, res, next)=>{
//         const {id}=req.user;
//         const {authorId} = req
//         if(requiredId===id){
//             return next();
//         }
//         return res.status(401).json({msg:"Forbidden: Insufficient Id"})

//     }
// }

module.exports={
    verifyToken,
    authorizeRole,
    // authorizeById
}