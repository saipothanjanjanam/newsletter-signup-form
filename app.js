// Import express package for making web Application
const express = require("express");
// Import body parser package to parse post requests.
const bodyParser = require("body-parser");
// for making requests to external Server
const https = require("https");
// Loading config file for API key, audience key
require("dotenv").config();


// create a Web App
const app = express();


/*
All the static files like images, css stylesheets are kept in 'public' folder.
This public directory is sent to the user along with HTML when he visits web app.
                              AND
We are making our Web App to use these by express.static
*/
app.use(express.static("public"));

// use bodyparser in our web app
app.use(bodyParser.urlencoded({extended: true}));


// Send all the website files from the server when get request from the browser is invoked.
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/" + "public/" + "signup.html");
});

// post request from the browser to server -> adds the user data to Mail Chimp List
app.post("/", function(req, res) {
  // Data from HTML form
  const formUserData = req.body;
  const firstName = formUserData.firstName;
  const lastName = formUserData.lastName;
  const emailAddress = formUserData.emailAddress;


  // Data to Mailchip
  const subscribingUser = JSON.stringify({
    email_address: emailAddress,
    status: "subscribed",
    merge_fields: {
      FNAME: firstName,
      LNAME: lastName
    }
  });

  const apiKey = String(process.env.LOCAL_API_KEY);// || process.env.API_KEY);
  const audienceId = String(process.env.LOCAL_AUD_KEY);// || process.env.AUDKEY);
  const apiServer = String(process.env.LOCAL_MC_SERVER);// || process.env.MC_SERVER);
  const mailChimpUrl = "https://us" + apiServer + ".api.mailchimp.com/3.0/lists/" + audienceId + "/members/";

  const options = {
    method: "POST",
    auth: "key:"+apiKey
  };

  const request = https.request(mailChimpUrl, options, function (response) {
    const statusCode = response.statusCode;

    if (String(statusCode) === "200") {
      res.sendFile(__dirname + "/" + "public/" + "success.html");
    }
    else {
      res.sendFile(__dirname + "/" + "public/" + "failure.html");
    }

    response.on('data', function (data) {
      const parseDataOnResponse = JSON.parse(data);
    });
  });

  request.write(subscribingUser);
  request.end();
});

// If user fails to subscribe -> button redirects to root ('/')
app.post("/failure", function (req, res) {
  res.redirect("/");
});


// Start the server
const port = (process.env.PORT || 3000) ;
app.listen(port, function () {
  console.log("Server is running on port " + port);
});
