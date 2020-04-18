const express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const app = express();
const multer = require('multer');
fs = require('fs-extra')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))

var url = 'mongodb+srv://duc:duc123123@cluster0-l46rb.azure.mongodb.net/test?retryWrites=true&w=majority';


var MongoClient = require('mongodb').MongoClient;
ObjectId = require('mongodb').ObjectId;

//********** Display homepage of employee
router.get('/', async(req,res)=>
{
  if(!req.session.username)
    {
      return res.status(401).send();
    }
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  let results = await dbo.collection("Account").find({Username : usercookie}).toArray();

  res.render('employeepage',{account : results});
})


//********** Self-Account info
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
    
    res.render('employeeInfo',{account:result});
  }
})

router.post('/info', async(req,res) =>
{
  let id = req.body.id;
  let name = req.body.name;
  let email = req.body.email;
  let phone = req.body.phone;
  let username = req.body.username;
  let password = req.body.password;
  let newAccount = {$set:{Name: name, Email: email, Phone: phone, Username: username, Password: password, Permission: "Staff"}}
    
  var ObjectID = require('mongodb').ObjectID;
  let condition = {_id: ObjectID(id)};
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  await dbo.collection("Account").updateOne(condition,newAccount);

  res.redirect('/employeepage');
})



//////////////////////////////////////////////////Product

//********** Khai bao storage
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

//********** Hien thi array picture id
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

//********** Trang hien thi picture
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
})

//********** Trang hien thi san pham
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
      res.render('employeeProducts',{products:results, count:count});
    }
})

//********** Edit product page
router.get('/product/edit', async(req,res)=>
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
    let result = await dbo.collection("Product").findOne({"_id" : ObjectID(id)});
    res.render('empEditProduct',{products:result});
}})

//********** Edit product
router.post('/product/edit', upload.single('picture'), async(req,res)=>
{
  if(!req.session.username)
  {
    return res.status(401).send();
  }
  else
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

    res.redirect('/employeepage/product');
  }
})

//********** Delete product
router.get('/product/delete', async(req,res)=>
{
  if(!req.session.username)
  {
    return res.status(401).send();
  }
  else 
  {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {_id : ObjectID(id)};

    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNCompany");
    dbo.collection("Product").deleteOne(condition);

    let results = await dbo.collection("Product").find({}).toArray();
    res.redirect('/employeepage/product');
  }
})

//********** Add product
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

  res.redirect('/employeepage/product');
})

//********** Search product
router.post('/product', async(req,res)=>
{
  var key = req.body.key;
  let client= await MongoClient.connect(url);
  let dbo = client.db("ATNCompany");
  let results = await dbo.collection("Product").find({Name : key}).toArray();

  res.render("employeeProducts",{products:results})
})

module.exports = router;