const express = require('express');
const engines = require('consolidate');
const app = express();

var cookieParser = require('cookie-parser');
var session = require('express-session');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

app.use(cookieParser());
app.use(session
    ({
    secret: "ok",
    saveUninitialized:false, 
    resave: false
    }));

//npm i handlebars consolidate --save
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

var indexController = require("./index.js");
var homepageController = require("./homepage.js");
var employeeController = require("./employee.js");

app.use('/', indexController);
app.use('/homepage', homepageController);
app.use('/employeepage', employeeController);

app.listen(process.env.PORT || 3000, function() {
    console.log('Server listening on port 3000');
    });  

