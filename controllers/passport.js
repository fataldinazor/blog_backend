const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const prisma = require('./prisma');
const bcrypt = require('bcryptjs');
const passportJWT = require('passport-jwt');
const JwtStrategy= passportJWT.Strategy;
const ExtractJwt= passportJWT.ExtractJwt;

//middleware authenticates via localStrategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      if (!user) {
        return done(null, false, { message: `Incorrect Username` });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: `Incorrect Password` });
      }
      return done(null, user, {message: 'Logged in Sucessfully'});
    } catch (err) {
      return done(err);
    }
  })
);

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

// middleware that checks whether the jwt token is valid or not 
passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    try{
        if(jwt_payload){
            return done(null, jwt_payload);
        }else{
            return done(null, false,{msg:"Token is Unauthorized"});
        };
    }catch(err){
        return done(err, false)
    }
  })
);