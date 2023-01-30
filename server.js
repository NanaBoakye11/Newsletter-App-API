
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const ejs = require("ejs");
const https = require("https");
const { json } = require("body-parser");
const { response } = require("express");
const mongoose = require("mongoose");
const router = express.Router();
require("mongoose-type-email");
mongoose.set("strictQuery", false);
const _ = require("lodash");
const app = express();
const bcrypt = require("bcrypt");
const { getMaxListeners, off, nextTick } = require("process");
const { result } = require("lodash");
const saltRounds = 10;

//Use Middleware //
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Connect to Mongoose Server // 
mongoose.connect("mongodb://127.0.0.1:27017/ALVSHTech");

                 ///      SCHEMAS      ///
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        reqired: true
    },
    password: {
        type: String,
        required: true,
        min: 5
    }
});
                          // Article Schema // 
const articleSchema = {
    title: String,
    content: String,
    };
                     // Constructor //
const User = mongoose.model("User", userSchema);
const Article = mongoose.model("Article", articleSchema);

                      // User Object Document // 
const newUser = new User({
    username: "jefflin",
    email: "jb@gmail.com",
    firstName: "jeff",
    lastName: "yiadom",
    password: "12345"
});

const newAdmin = new User({
    username: "admnb",
    email: "nb2@gmail.com",
    firstName: "Admin2",
    lastName: "ceo",
    password: "abcdef"
});

app.route("/")
.get(function(req,res){
    res.sendFile(__dirname + "/index.html");
});

////////////////////////// SIGNIN ROUTE PATH //////////////////////////////
app.route("/signin.html")
.get(function(req, res) {      // GET SIGN-IN // 
    res.sendFile(__dirname + "/signin.html");
})
.post((req,res)=>{           // POST SIGN-IN //
    const username = _.capitalize(req.body.username);
    const password = req.body.password;

        if(!username || !password) {
            console.log("Enter fields");
        } else {
            User.findOne({ username: username}, (err, user)=>{
                if(err) {
                    console.log(err);
                } if(user) {
                    if(user.password === password){
                        console.log("Login successful!")
                        res.sendFile(__dirname + "/blog.html");
                    } else {
                        console.log("Wrong Password Combination");
                        res.redirect("/signup.html");
                    }
                } else {
                    console.log("No User found");
                    res.sendFile(__dirname + "/failure.html");
                }
            });
        }   
});


/////////////////////////// SIGN-UP ROUTE PATHS /////////////////////////
app.route("/signup.html")
.get(function(req, res){     // GET SIGN-UP // 
    res.sendFile(__dirname + "/signup.html")
})
.post(async function(req,res){   //POST SIGN-UP // 
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser2 = new User({
            username: _.capitalize(req.body.username),
            email: _.capitalize(req.body.uEmail),
            firstName: _.capitalize(req.body.firstName),
            lastName: _.capitalize(req.body.lastName),
            password: hashedPassword
        });
            newUser2.save();
            console.log(newUser2.username);
            res.redirect("/");
        } catch(err){
            res.status(500).send(err);
            res.redirect("/signup")
        }
});

///////////////////////////// ALL ARTICLES ROUTE PATHS  ///////////////////////////
app.route("/articles")
.get(function(req,res){  // GET ARTICLES  // 
    Article.find(function(err, articlesFound){
        if(err) {
            res.send(err);
        } else {
            res.send(articlesFound);
        }
    });
})
.post(function(req,res) {  // POST ARTICLES // 
    const article1 = new Article({
        title: req.body.title,
        content: req.body.content
    });
    article1.save(function(err){
        if(err){
            console.log(err);
        } else {
            res.send(article1);
        }
    });
    console.log(article1.title, article1.content);
})
.delete(function(req, res){  // DELETE ARTICLES // 
    Article.deleteMany({title: req.body.title}, {content: req.body.content}, function(err, deletedUser){
        if(err) {
            console.log(err); 
        } else {
            console.log("Deleted user" + deletedUser);
            res.send("Deleted user");
        }
    });
});

////////////////////////  ReQUEST SPECIFIC ////////////////////////

app.route("/articles/:articleTitle")
.get(function(req, res){
    Article.findOne({title: req.params.articleTitle}, function(err, results){
        if(err) {
            console.log(err);
        } if(!results) {
            console.log("No article found");
        } else {
            console.log("Displaying requested articles");
            res.send(results);
        }
    });
})
.put(function(req,res){
    Article.updateOne(
        {title: req.params.articleTitle}, 
        {title: req.body.title, content: req.body.content}, 
        function(err, results){
        if(err){
            console.log(err);
        } else {
            console.log("Successfully updated articles");
            console.log(results);
            res.send("Updated! Thank you");
        }
    });
})
.patch(function(req,res){
    Article.updateOne(
        {title: req.params.articleTitle},
        {title: req.body.title, content: req.body.content}, function(err){
            if(!err){
                res.send("Successfully Patched!");
            } else {
                res.send(err);
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
app.post("/failure.html", function(req, res){
    res.redirect("/");
});
// Post request to Success page //
app.post("/success.html", (req, res)=>{
    res.redirect("/");
}
);
// Port config // 
app.listen(process.env.PORT || 4000, function(){
    console.log("Server started 4000");
});






















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
             



// url https://us12.api.mailchimp.com/3.0/ //
//  b29ad35c7a  // audience id
// 69b2cc62a3c6ff3494bec0147bf2b06b-us12 // Api keys