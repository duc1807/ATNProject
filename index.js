const express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://duc:duc123123@cluster0-l46rb.azure.mongodb.net/test?retryWrites=true&w=majority';

global.usercookie = "";

//********** Show index page
router.get('/',(req,res)=>{
    req.session.username = null;
    res.render('index');
})

//********** Send forgot messages
router.post('/', async(req,res)=>
{
    var phone = req.body.phone;
    var username = req.body.username;
    
    var d = new Date();
    var date = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var time = date + '/' + month + '/' + year;

    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNCompany");
    let check = await dbo.collection("Account").find({Username:username, Phone : phone}).toArray();
    if(check != 0)
    {
        let newMessage = {Username:username, Phone:phone, Time : time};
        dbo.collection("Messages").insertOne(newMessage);
        res.render('index');
    }
    else 
    {
        res.render('index');
    }
})

//********** Render to homepage if login valid
router.post('/homepage', async(req,res)=>
{
    var username = req.body.username;
    var password = req.body.password;

    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNCompany");
    let results = await dbo.collection("Account").find({"Username":username, "Password":password}).toArray();
    let results2 = await dbo.collection("Account").find({"Permission": "Administrator","Username":username, "Password":password}).toArray();
    if(results == 0)
        {
            res.redirect("/");          
        }
    else
        {
        if(results2 != 0)
            {                    
                usercookie = username;
                req.session.username = username; 
                res.redirect("/homepage");               
            }
        else
            {
                usercookie = username;
                req.session.username = username; 
                res.redirect("/employeepage");
            }
        }
})

module.exports = router;