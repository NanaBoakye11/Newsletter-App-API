require('dotenv').config({path:'public/.env'})
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const ejs = require("ejs");
const https = require("https");
const { json } = require("body-parser");
const { response } = require("express");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require("mongoose");
const logger = require('morgan');
const passport = require("passport");
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();
mongoose.set("strictQuery", false);
const _ = require("lodash");
const path = require('path');
const { getMaxListeners, off, nextTick } = require("process");
const { result, has } = require("lodash");
const crypto = require('crypto');
const findOrCreate = require('mongoose-findorcreate');
const app = express();
const Schema = mongoose.Schema;
const axios = require('axios');
const cookieParser = require("cookie-parser");
const { error } = require('console');
const { type } = require('os');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {google} = require('googleapis');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const { OAuth2Client } = require('google-auth-library');
const { redirect } = require('react-router-dom');
const flash = require('connect-flash');



                  //Use Middleware //
app.locals.pluralize = require('pluralize');
app.use(logger('dev'));                  
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('server', path.join(__dirname, 'server'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(csrfProtection);

const store = new MongoDBStore({
    uri: "mongodb://127.0.0.1:27017/ALVSHTech",
    collection: 'sessions'
});

app.use(session({
    secret: 'mysecret lock',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { 
        maxAge: 3600000,
        secure: false
    }
  }));

app.use(passport.initialize());
app.use(passport.session());

app.use(csrf({ cookie: true}));
app.use(passport.authenticate('session'));



app.use(function(req, res, next) {
    var msgs = req.session.messages || [];
    res.locals.messages = msgs;
    res.locals.hasMessages = !! msgs.length;
    req.session.messages = [];
    next();
  });
  app.use(function(req, res, next) {
    res.locals.user = req.user; // Make req.user available in templates

    next();
  });

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
  });


// Connect to Mongoose Server // 
mongoose.connect("mongodb://127.0.0.1:27017/ALVSHTech");




                 ///     User SCHEMAS      ///
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    password: {
        type: String
    },
    salt: {
        type: String
    },
    settings: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Settings'
    } 
});

const settingsSchema = new Schema({
    general: {
        type: Boolean
    },
    business: {
        type: Boolean
    },
    entertainment: {
        type: Boolean
    },
    health: {
        type: Boolean,
    },
    sports: {
        type: Boolean,
    },
    technology: {
        type: Boolean,
    }
});

                     // GOOGLE SCHEMA // 
const federatedCredentialSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    subject:  {
        type: String,
        required: true,
        unique: true
    }, 
    email: {
        type: String,
        unique: true
    }
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

                          /// Article Schema /// 
const articleSchema = new Schema({
    title: String,
    description: String,
    author: String,
    published: Date,
    source: String
    });

                     //// Constructor ////
const User = new mongoose.model("User", userSchema);
const FederatedCredential = new mongoose.model('FederatedCredential', federatedCredentialSchema);
const Article = new mongoose.model("Article", articleSchema);
const Settings = new mongoose.model("Settings", settingsSchema);



const state = crypto.randomBytes(16).toString('hex');



                          //  GOOGLE STRATEGY //

passport.use(new GoogleStrategy({
    clientID: '792950701295-qlikp7cirqc5n78tkag3pibtkloaru4q.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:4000/oauth2/redirect/google',
    responseType: 'code',
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },  async function verify (accessToken, refreshToken, profile, done) {
    console.log('\n\n\n\n\n\nPROFILE VALUE:')
    console.log(profile)
    console.log('\n\n :::::::ABOUT TO LOOK FOR CORRESPOINDING FEDCRED:::::')
    await FederatedCredential.findOne({provider: issuer, subject: profile.id}, 
        async (err, row) => {
        if (err){ 
            console.log('\n\n :::::::FRED CRED FIND ERR:::::', err);
            return done(err);
        } 
    console.log(profile.provider);

        if (!row) {
            const newGoogleUser = new User({
                username: profile.displayName,
                email: profile.emails[0].value, 
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                password: ""
            })
                                
            const user_id = newGoogleUser.toObject()._id;
            console.log("This is user ID" + user_id);
                                
            newGoogleUser.save(function(err) {
                if (err){ return done(err);}
                    const newCredential = new FederatedCredential({
                    user_id,
                    provider: profile.provider,
                    subject: profile.id,
                    email: profile.emails[0].value
                });
                newCredential.save(function(err){
                    if (err){
                        return done(err);
                    }
                    const userLog = {
                    id: user_id,
                    username: profile.displayName
                    };
                    console.log(userLog);
                    return done(null, userLog);
                    });            
            });              
        } else {
            const user = await User.findById(row.user_id).catch(err => done(err, null));
            if (!user) return done(null, false);
            return done(null, user);
        }
    }).clone();
}));

                            // LOCAL STRATEGY //

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},async function (email, password, done){
try {
   const user = await User.findOne({email: email}, (err, user) => {
        if(err){
            console.log("Incorrect username or password.");
            return done(err);
        } 
        if (!user) {
            return done(null, false, {message: 'Incorrect username or password.'});
        } 
        
        console.log("Checking for password");
        bcrypt.compare(password, user.password, function(err, isMatch){
            if(err){
                return done(err);
            } if (!isMatch) {
                console.log("Incorrect username or password!");
                
                return done(null, false, {successMessage: 'Incorrect username or password.'});
            } return done(null, user);
        }); 
    });
} 
catch (err) {
    return(err);
}
}));

passport.serializeUser(function(user, done) {
    process.nextTick(function(){
        done(null, { id: user._id, email: user.email, username: user.username, settings: user.settings}); 
    });
});

passport.deserializeUser(function(user, done) {
    process.nextTick(function(){
        return done(null, user);
    });
}); 







                                               /////    ROUTES    //////
app.route("/")
.get(function(req,res){
    const currentPage = req.url;
     
        console.log(req.user);
        res.render('index', {user: req.user, currentPage});
})
.post(function(req, res){
    res.render('index');
    
});


         ////////////////////////// SIGNIN ROUTE PATH //////////////////////////////
app.route("/login")
.get(async function(req, res) {  // GET SIGN-IN //
    const incomingRD = req.session.returnTo;  
    console.table({
        test: 'STRICT',
        user: req.user
    });
    if (incomingRD){
        console.log(incomingRD);
        res.redirect(incomingRD);
        delete incomingRD;
    } else {
        res.render('login');
    }
 
});

// {csrfToken}

app.post("/login/password", passport.authenticate('local', {
    successRedirect: '/blog',
    failureRedirect: '/login',
    failureMessage: true
}));      
app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
  });
app.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
  });


               /////            GOOGLE SIGN-IN ROUTE          /////////   
app.route("/login/federated/google")
.get(passport.authenticate("google", { scope: ['email', 'profile']}));
               
app.
get("/oauth2/redirect/google",
passport.authenticate('google', {
    failureRedirect: "/failure",
    successReturnToOrRedirect: '/blog'
     }));
               
app.get('/blog', passport.authenticate('session'), async function(req, res){
    const successMessage = req.session.successMessage;
    const incomingRoute = req.path;
    const currentPage = req.url;
    req.session.successMessage = null;
    console.log(req.user);
    console.log("INCOMING ROUTE ==> " + incomingRoute);
    if(req.isAuthenticated()){    
    try { 
        const username = req.user.username;
        const capUsername = username.charAt(0).toUpperCase() + username.slice(1);
        var getSettings = req.user.settings;
        const settings = await Settings.findById(getSettings);
        const category = settings 
        ? Object.entries(settings.toObject())
            .filter(([key, value]) => key !== '_id')
            .filter(([key, value]) => value == true)
            .map(([key, value]) => key)
            : ['general'];
       

        const apiKey = process.env.NEWS_API_KEY;
        const numberPage = req.query.page || 1;
        const params = {
            country: ['us'],
            apiKey: apiKey,
            category: category,
            pageSize: 21,
            page: numberPage
        }
        console.log('THIS IS COUNTRIES ' + params.country);
        const url = 'https://newsapi.org/v2/top-headlines?';
        const request = await axios.get(url, { params });
        const newsArticles = request.data.articles;
        const statusCode = request.data.status;
        const totalData = request.data.totalResults;
        const pageNumber = numberPage;
        const totalPages = Math.ceil(totalData / params.pageSize);
        console.log('THIS IS TOTAL AMOUT OF ARTICLES == ' + totalData);
        console.log('STATUS CODE == '+ statusCode);
        console.log('THIS IS SUCCESS '+ successMessage);
        console.log('THIS IS CATEGORY '+ category);
        
        res.render('blog', {user: req.user, username: capUsername, articles: newsArticles, successMessage, currentPage, statusCode, totalData, totalPages, pageNumber});

    } catch (err) {
        console.log('Failure to retrieve news: ', err);
        res.render('blog', {user: req.user, username: capUsername});
    }
} else {
    req.session.returnTo = '/blog';
    return res.redirect("/login");
}
});
 

app.post('/blog', function(req, res) {
    res.render('blog');
});


////   Settings Route //

app.get('/settings', function(req, res){
    const userProfile = req.user;
    const userSettings = req.user.settings;
    const currentPage = req.url;

    console.log(userProfile);
    console.log(userSettings);
res.render('settings', {user: userProfile, settings: userSettings, currentPage});
});

app.post('/settings', async (req, res) => {

try {
    const userId = req.user.id;
    const currentPage = req.url;
    console.log(userId + " This is user ID");
    console.log(req.user.username + " This is User");
    const { general, business, entertainment, health, sports, technology } = req.body;
    const userLoggedIn = await User.findById(userId).populate('settings');
    // await User.findById(userId).populate('settings');
    if(!userLoggedIn) {
        return res.status(404).send('User not found');
    }

    if(!userLoggedIn.settings){

    const newSettings = new Settings({
        general: !!general,
        business: !!business,
        entertainment:  !!entertainment,
        health: !!health,
        sports: !!sports,
        technology: !!technology
     });

    // Save settings // 
    const savedSettings = await newSettings.save();
    // Sync user with settings ID //
    userLoggedIn.settings = savedSettings._id;
    await userLoggedIn.save();
    

    } else {
        userLoggedIn.settings.general = !!general;
        userLoggedIn.settings.business = !!business;
        userLoggedIn.settings.entertainment = !!entertainment;
        userLoggedIn.settings.health = !!health;
        userLoggedIn.settings.sports = !!sports;
        userLoggedIn.settings.technology = !!technology;
        await userLoggedIn.settings.save();
        console.log(userLoggedIn);
    }

    req.session.successMessage = 'Saved settings successfully';
    res.redirect('/blog');
} catch (error) {
    console.error('Error saving settings: ', error);
    res.status(500).send('An error occurred');
}
});


app.get('/search', function(req, res) {
    res.render('search', {user: req.user, articles: articlesFound, searchStatus, searchResults, successMessage});
    
});


app.post('/search', async function(req, res) {
    const keyword = req.body.searchBar;
    const username = req.user.username;
    const currentPage = req.url;
    // const successMessage = req.session.successMessage;
    try {
        const apiKey = process.env.NEWS_API_KEY;
        const params = {
            q: keyword,
            apiKey: apiKey,
            searchIn: 'description',
            sortBy: 'popularity',
            pageSize: 21,
            language: 'en'
        }
        const url = 'https://newsapi.org/v2/everything?';
        const request = await axios.get(url, {params});
        const searchStatus = request.data.status;
        const searchResults = request.data.totalResults;
        const articlesFound = request.data.articles;
    
        console.log(searchStatus);
        console.log('THIS IS THE REQUEST ==' + request);
        console.log('THIS IS THE RESULTS ==' + searchResults);
        console.log('THIS IS THE MESSAGE ==' + articlesFound);
        successMessage = 'Here are your search results!';
        res.render('search', {user: req.user, username, articles: articlesFound, searchStatus, searchResults, successMessage, currentPage});
    } catch (err) {
        successMessage = 'No results found!';
        res.redirect("/failure");
    }
});



/////////////////////////// SIGN-UP ROUTE PATHS /////////////////////////

app.route("/signup")
.get(function(req, res, next){ // GET SIGN-UP // 
    // const csrfToken = req.csrfToken();
    res.render('signup');
    // console.log("HERE IS THE SignUp TOKEN " + csrfToken)
    // serveHTMLFile(req, res, '/signup');    
    // return res.render("/signup", {csrfToken});
})
.post(async function(req, res, next){
    const currentPage = req.url;
    try{
        var email = req.body.email;
        var username = req.body.username;
        User.findOne({email: email}, function(err, emailExist, next){
            if(emailExist){
                console.log("User already Exists. Please login")
                res.send('/login');
            } else {
                return next;
            }
        });
        bcrypt.hash(req.body.password, saltRounds, function(err, hash){
            const newUser = new User({
                username: _.capitalize(req.body.username),
                email: _.capitalize(req.body.email),
                firstName: _.capitalize(req.body.firstName),
                lastName: _.capitalize(req.body.lastName),
                password: hash
            });
            newUser.save(function(err, savedUser){
                if (err) {
                    return(err);
                }
                var user = {
                    id: savedUser._id,
                    email: savedUser.email
                };
                console.log(user);
            });
            console.log(newUser.username);
            res.redirect('/login');
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

///////////////////////////// ALL ARTICLES ROUTE PATHS  ///////////////////////////
app.route("/articles")
.get(function(req,res){  // GET ARTICLES  // 
    Article.find(function(err, articlesFound){
        if(err) return res.send(err);
        
        return res.send(articlesFound);
        
    });
})
.post(function(req,res) {  // POST ARTICLES // 
    const article1 = new Article({
        title: req.body.title,
        content: req.body.content
    });
    article1.save(function(err){
        if(err) return console.log(err);
        return res.send(article1);
    });
    console.log(article1.title, article1.content);
})
.delete(function(req, res){  // DELETE ARTICLES // 
    Article.deleteMany({title: req.body.title}, {content: req.body.content}, function(err, deletedUser){
        if(err) {
            return console.log(err); 
        } else {
            console.log("Deleted user" + deletedUser);
            return res.send("Deleted user");
        }
    });
});

////////////////////////  ReQUEST SPECIFIC ////////////////////////


app.route("/articles/:articleTitle")
.get(function(req, res){
    Article.findOne({title: req.params.articleTitle}, function(err, results){
        if(err) {
            return console.log(err);
        } if(!results) {
            return console.log("No article found");
        } else {
            console.log("Displaying requested articles");
            return res.send(results);
        }
    });
})
.put(function(req,res){
    Article.updateOne(
        {title: req.params.articleTitle}, 
        {title: req.body.title, content: req.body.content}, 
        function(err, results){
        if(err){
            return console.log(err);
        } else {
            console.log("Successfully updated articles");
            console.log(results);
            return res.send("Updated! Thank you");
        }
    });
})
.patch(function(req,res){
    Article.updateOne(
        {title: req.params.articleTitle},
        {title: req.body.title, content: req.body.content}, function(err){
            if(!err){
                return res.send("Successfully Patched!");
            } else {
                return res.send(err);
            }
        });
})
.delete(function(req,res){
    Article.deleteOne(
        {title: req.params.articleTitle}, 
        {title: req.body.title, content: req.body.content}, function(err){
            if(!err){
                res.send("Deleted article");
            } else {
                console.log(err);
            }
        });
})
.post();




// POST request to Faliure page //
app.get('/failure', function(req,res,next){
    res.render('failure', setTimeout(function () {
        redirect("/blog");
    }, 2000));
});

app.post('/failure', function(req, res){
    res.redirect('/');
});
// Post request to Success page //
app.get('/success', function(req,res,next){
    res.render('success');
});
app.post('/success', (req, res)=>{
    res.redirect('/blog');
});

// Port config // 
app.listen(process.env.PORT || 4000, function(){
    console.log("Server started 4000");
});













//     async function(req,res){   //POST SIGN-UP // 
//     try{
//          bcrypt.hash(req.body.password, saltRounds, function(err, hash){
//             const newUser2 = new User({
//                 username: _.capitalize(req.body.username),
//                 email: _.capitalize(req.body.uEmail),
//                 firstName: _.capitalize(req.body.firstName),
//                 lastName: _.capitalize(req.body.lastName),
//                 password: hash
//             });
//             newUser2.save();
//             console.log(newUser2.username);
//             res.redirect("/");
//         });
//         } catch(err){
//             res.status(500).send(err);
//             res.redirect("/signup")
//         }
// }




// app.post("/", function(req, res){

//     const email = req.body.uEmail;
//     const firstName = req.body.fName;
//     const lastName = req.body.lName;
    
//     const data = {
//         members: [
//             {
//                 email_address: email,
//                 status: "subscribed",
//                 merge_fields: {
//                     FNAME: firstName,
//                     LNAME: lastName,
//                 }
//             }
//         ]
//     };

//     const jsonData = JSON.stringify(data);
//     const url = "https://us12.api.mailchimp.com/3.0/lists/b29ad35c7a";
//     const options = {
//         method: "POST",
//         auth: "alvsh11:69b2cc62a3c6ff3494bec0147bf2b06b-us12"
//     }
    


//     const request = https.request(url, options, function(response){
//         if (response.statusCode === 200) {
//             res.sendFile(__dirname + "/success.html");
            
//         } else {
//         res.sendFile(__dirname + "/failure.html");
//         }
//         response.on("data", function(data){
//             const newsData = JSON.parse(data);
//             console.log(newsData);
            
//         });
//     });

    
//     console.log(response.statusCode);
    
//     request.write(jsonData);
//     request.end();
//     console.log(email, firstName, lastName);    
// });
             

// 678f4861c7a54a3983a0b85d026c4831 APINew

// 70ad6c6590cb4b2686194d13b14facda Newest

// url https://us12.api.mailchimp.com/3.0/ //
//  b29ad35c7a  // audience id
// 69b2cc62a3c6ff3494bec0147bf2b06b-us12 // Api keys


            // POST SIGNUP CRYPTO /// 


    // const salt = crypto.randomBytes(16).toString('hex');
    // crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword){
    //     if(err){
    //         return next(err);
    //     } else {
    //         const newUser = new User({
    //             username: _.capitalize(req.body.username),
    //             email: _.capitalize(req.body.email),
    //             firstName: _.capitalize(req.body.firstName),
    //             lastName: _.capitalize(req.body.lastName),
    //             password: hashedPassword.toString('hex'),
    //             salt: salt
    //         });
    //         newUser.save(function(err, savedUser) {   
    //             if(err){
    //                 return next(err);
    //             }  
    //             var user = {
    //                 id: savedUser._id,
    //                 email: savedUser.email
    //             };
    //             console.log(user);
    //             req.login(user, function(err){
    //                 if(err){
    //                     return next(err);
    //                 }
    //                  res.redirect('/blog');

    //             });
    //             // else {
    //             //     console.log(newUser);
    //             //     return res.redirect("/");
    //             // }
    //         });
    //     }   
    // });




          // else {
        //     if(!user) {
        //         console.log("No user found");
        //     } else {
        //         crypto.pbkdf2(username.password, salt, 310000, 32, "sha256", function(err, hashedPassword){
        //             if(err){
        //                 console.log(err);
        //                 console.log("Logging successful!");
        //                 return done(err, user);
        //             } else {
        //                 if(!crypto.timingSafeEqual(user.password, hashedPassword)){
        //                     console.log("Incorrect username or password");
        //                 } else {
        //                     console.log("Login successful!");
        //                     console.log(response);
        //                 }
        //             }
        //         });
        //     } 
        // }