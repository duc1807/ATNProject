const express = require('express');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');

fs = require('fs-extra');
app.use(bodyParser.urlencoded({ extended: true }));
var router = express.Router();
var url = 'mongodb+srv://duc:duc123123@cluster0-l46rb.azure.mongodb.net/test?retryWrites=true&w=majority';
var MongoClient = require('mongodb').MongoClient;
ObjectId = require('mongodb').ObjectId;

global.usercookie = "";

//********** Display homepage
router.get('/', async(req,res)=>
{
  if(!req.session.username)
    {
      return res.status(401).send();
    }

  let client= await MongoClient.connect(url,{ useUnifiedTopology: true });
  let dbo = client.db("ATNCompany");
  let results = await dbo.collection("Account").find({Username : usercookie}).toArray();
  res.render('homepage', {account : results});
})


//********** Logout
router.get('/logout', function (req, res) 
{
  req.session.username = null;
  res.redirect('/');
});

//********** Display all employee account
router.get('/employee', async(req,res)=>
{
  if(!req.session.username)
  {
    return res.status(401).send();
  }
  else 
  {
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNCompany");
    let results = await dbo.collection("Account").find({Username : {$ne: usercookie}}).toArray();
    let count = await dbo.collection("Account").countDocuments();
    console.log(usercookie);
    let messages = await dbo.collection("Messages").find({}).toArray();
    res.render('allAccounts',{accounts:results, count:count, messages:messages});
  }
})

//********** Add new employee
router.post('/employee', async(req,res)=>
{
  let name = req.body.name;
  let email = req.body.email;
  let phone = req.body.phone;
  let username = req.body.username;
  let password = req.body.password;
  let permission = req.body.permission;
  let newAccount = {Name: name, Email: email, Phone: phone, Username: username, Password: password, Permission: permission};
    
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");

  dbo.collection("Account").insertOne(newAccount,(err,res)=>
    {
      if (err) throw err;
      console.log("Add successfully");
      client.close();
    })

  res.redirect('/homepage/employee');
})

//********** Edit employee page
router.get('/employee/edit', async(req,res)=>
{
  if(!req.session.username)
  {
    return res.status(401).send();
  }
  else 
  {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;

    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNCompany");
    let result = await dbo.collection("Account").findOne({"_id" : ObjectID(id)});
    res.render('editAccount',{accounts:result});
}})

//********** Edit and render to all employee page
router.post('/employee/edit', async(req,res)=>
{
  let id = req.body.id;
  let name = req.body.name;
  let email = req.body.email;
  let phone = req.body.phone;
  let username = req.body.username;
  let password = req.body.password;
  let permission = req.body.permission;
  let newAccount = {$set:{Name: name, Email: email, Phone: phone, Username: username, Password: password, Permission: permission}}
    
  var ObjectID = require('mongodb').ObjectID;
  let condition = {_id: ObjectID(id)};
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  await dbo.collection("Account").updateOne(condition,newAccount);

  res.redirect('/homepage/employee');
})

//********** Delete account
router.get('/employee/delete', async(req,res)=>
{
  if(!req.session.username)
  {
    return res.status(401).send();
  }
  else 
  {
    var ObjectID = require('mongodb').ObjectID;
    let id = req.query.id;
    let condition = {_id : ObjectID(id)};
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNCompany");
    dbo.collection("Account").deleteOne(condition);

    res.redirect('/homepage/employee');
}})

//********** Search account

router.post('/employee/search', async(req,res)=>
{
  var key = req.body.key;
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  let results = await dbo.collection("Account").find({Username : key}).toArray();
  let messages = await dbo.collection("Messages").find({}).toArray();
  res.render("searchAccounts",{accounts:results, messages:messages})
})

//********** Product part

//********** Khai bao storage cho image
var storage = multer.diskStorage({
  destination: function (req, file, cb) 
  {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) 
  {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
  
var upload = multer({ storage: storage })

//********** Hien thi array id cua cac image
router.get('/photos', async(req, res) => 
{
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  dbo.collection('Product').find().toArray((err, result) => 
  {
    const imgArray = result.map(element => element._id);
    console.log(imgArray);
    if (err) return console.log(err)
    res.send(imgArray)
  })
});

//********** Hien thi tung anh by id
router.get('/photo/:id', async(req, res) => 
{
  var filename = req.params.id;
  
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  dbo.collection('Product').findOne({'_id': ObjectId(filename)}, {Image : 1}, (err, result) => 
  {
    if (err) return console.log(err)
    res.contentType('image/jpeg'); 
    res.send(result.Image.image.buffer);
  })
});

router.get('/product/photo/:id', async(req, res) => 
{
  var filename = req.params.id;
  
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  dbo.collection('Product').findOne({'_id': ObjectId(filename)}, {Image : 1}, (err, result) => 
  {
    if (err) return console.log(err)
    res.contentType('image/jpeg'); 
    res.send(result.Image.image.buffer);
  })
});

//********** Hien thi all san pham
router.get('/product', async(req,res)=>
{
  if(!req.session.username)
  {
    return res.status(401).send();
  }
  else 
  {
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNCompany");
    let results = await dbo.collection("Product").find({}).toArray();
    let count = await dbo.collection("Product").countDocuments();
 
    res.render('allProducts',{products:results, count:count});
  }
});

//********** Add new product
router.post('/product/add', upload.single('picture'), async(req,res)=>
{
  let name = req.body.name;
  let price = req.body.price;
  let origin = req.body.origin;
  let description = req.body.description;

  var img = fs.readFileSync(req.file.path);
  var encode_image = img.toString('base64');
  var finalImg = 
  {
    contentType: req.file.mimetype,
    image: new Buffer(encode_image, 'base64')
  };

  let newProduct= {Name: name, Price: price, Origin: origin, Image:finalImg, Description: description};   
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  dbo.collection("Product").insertOne(newProduct);

  res.redirect('/homepage/product');
})

//********** Edit product
router.get('/product/edit', async(req,res)=>
{
  if(!req.session.username)
  {
    return res.status(401).send();
  }
  else 
  {
    var ObjectID = require('mongodb').ObjectID;

    let id = req.query.id;
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNCompany");
    let result = await dbo.collection("Product").findOne({"_id" : ObjectID(id)});
    res.render('editProduct',{products:result});
  }
});

//********** Confirm edit and render to all product page
router.post('/product/edit', upload.single('picture'), async(req,res)=>
{
  let id = req.body.id;
  let name = req.body.name;
  let price = req.body.price;
  let origin = req.body.origin;
  let description = req.body.description;

  var img = fs.readFileSync(req.file.path);
  var encode_image = img.toString('base64');
  var filename = req.params.id;
    
  var finalImg = 
  {
    contentType: req.file.mimetype,
    image: new Buffer(encode_image, 'base64')
  };

  var ObjectID = require('mongodb').ObjectID;
  let condition = {_id: ObjectID(id)};
  let newProduct= {$set:{Name: name, Price: price, Origin: origin, Image:finalImg, Description: description}};
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  await dbo.collection("Product").updateOne(condition,newProduct);

  res.redirect('/homepage/product');
})


//********** Delete product page
router.get('/product/delete', async(req,res)=>
{
  if(!req.session.username)
  {
    return res.status(401).send();
  }
  else 
  {
    var ObjectID = require('mongodb').ObjectID;

    let id = req.query.id;
    let condition = {_id : ObjectID(id)};
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNCompany");
    dbo.collection("Product").deleteOne(condition);

    let results = await dbo.collection("Product").find({}).toArray();
    res.redirect('/homepage/product');
  }
})

//********** Search product
router.post('/product/search', async(req,res)=>
{
  var key = req.body.key;
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  let results = await dbo.collection("Product").find({Name : key}).toArray();

  res.render("searchProducts",{products:results})
})

//********** Edit self-account page
router.get("/info", async(req,res)=>
{
  if(!req.session.username)
  {
    return res.status(401).send();
  }
  else 
  {
    var ObjectID = require('mongodb').ObjectID;

    let id = req.query.id;
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNCompany");
    let result = await dbo.collection("Account").findOne({"_id" : ObjectID(id)});
    usercookie = result.Username;
    
    res.render('adminInfo',{account:result});
  }
});

//********** Confirm edit account and render to homepage
router.post('/info', async(req,res) =>
{
  let id = req.body.id;
  let name = req.body.name;
  let email = req.body.email;
  let phone = req.body.phone;
  let username = req.body.username;
  let password = req.body.password;
  let permission = req.body.permission;
  let newAccount = {$set:{Name: name, Email: email, Phone: phone, Username: username, Password: password, Permission: permission}}
    
  var ObjectID = require('mongodb').ObjectID;
  let condition = {_id: ObjectID(id)};

  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  await dbo.collection("Account").updateOne(condition,newAccount);

  res.redirect('/homepage');
})

module.exports = router;