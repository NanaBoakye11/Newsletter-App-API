
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const { json } = require("body-parser");
const { response } = require("express");
const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/signup.html")
})

app.post("/", function(req, res){

    const email = req.body.uEmail;
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    
    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);
    const url = "https://us12.api.mailchimp.com/3.0/lists/b29ad35c7a";
    const options = {
        method: "POST",
        auth: "alvsh11:69b2cc62a3c6ff3494bec0147bf2b06b-us12"
    }
    


    const request = https.request(url, options, function(response){
        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html");
            
        } else {
        res.sendFile(__dirname + "/failure.html");
        }
        response.on("data", function(data){
            const newsData = JSON.parse(data);
            console.log(newsData);
            
        });
    });

    
    console.log(response.statusCode);
    
    request.write(jsonData);
    request.end();
    console.log(email, firstName, lastName);    
});



app.post("/failure.html", function(req, res){
    res.redirect("/");
})

app.listen(process.env.PORT || 3000, function(){
    console.log("Server started 3000");
});




// url https://us12.api.mailchimp.com/3.0/ //
//  b29ad35c7a  // audience id
// 69b2cc62a3c6ff3494bec0147bf2b06b-us12 // Api keys