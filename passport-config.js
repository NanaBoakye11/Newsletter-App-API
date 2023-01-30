const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport){
    //function to authenticate users //
    const authenticateUsers = async function(username, password, done){
        //Get users by username //
        const user = getUserByUsername(username) 
            if(user == null){
                return done(null, false, {message: "No user found with that username"})
            }
            try {
                if(await bcrypt.compare(password, user.password)){
                    return done(null, user)
                }
            } catch(err){
                console.log(err);
                return done(err);
            }
    }

    passport.use(new localStrategy({usernameField: "username"}));
    passport.serializeUser(function(user, done){})
    passport.deserializeUser(function(_id, done){})
}
module.exports = initialize;