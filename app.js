const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
app.use(express.json());
const AWS = require('aws-sdk');
const { getFileStream } = require("./src/middleware/s3");

// const ID = process.env.ID;
// const SECRET = process.env.SECRET;

// // The name of the bucket that you have created
// const BUCKET_NAME = process.env.BUCKET_NAME;
const s3 = new AWS.S3({
  accessKeyId: process.env.ID,
  secretAccessKey: process.env.SECRET
});
// const params = {
//   "Bucket": process.env.BUCKET_NAME,
//   "CreateBucketConfiguration": {
//       // Set your region here
//       LocationConstraint: "eu-west-1"
//   }
// };

// s3.createBucket(params, function(err, data) {
//   if (err) console.log(err, err.stack);
//   else console.log('Bucket Created Successfully', data.Location);
// });
//cors
const cors = require("cors");
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST","PUT","DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

const { verifyadmintoken } = require("./src/middleware/auth");

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization,authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

//Admin Api's
//routes

const topheader = require("./src/api/Topheader");
const authentication = require("./src/api/Authentication");
const banner = require("./src/api/Banner");
const about = require("./src/api/AboutSection");
const Service = require("./src/api/Service");
const price = require("./src/api/Pricing");
const Works = require("./src/api/Howitworks");
const faq = require("./src/api/Faq");
const contact = require("./src/api/Contact");
const category = require("./src/api/Category");
const product = require("./src/api/Product");
const order = require("./src/api/Order");
const setting = require("./src/api/setting");
const smtp = require("./src/api/smtp");
const booking = require("./src/api/Booking");
const query = require("./src/api/Queries");
// const splashscreen = require("./src/api/SplashScreen");
const attribute = require('./src/api/Attribute')
const color = require('./src/api/Colors')
const customer = require('./src/api/Customer')
const employer = require('./src/api/Employer')
//set path

app.use("/image/:image", (req,res)=>{
      //get image
    const readstream = getFileStream(req.params.image);
    readstream.pipe(res);
    
});
app.use("/topheader", topheader);
app.use("/auth", authentication);
app.use("/banner", banner);
app.use("/about", about);
app.use("/Service", Service);
app.use("/Price", price);
app.use("/Work", Works);
app.use("/customer", customer);
app.use("/employer", employer);
app.use("/faq", faq);
app.use("/contact", contact);
app.use("/category", category);
app.use("/product", product);
app.use("/order", order);
app.use("/setting", setting);
app.use("/smtp", smtp);
app.use("/booking", booking);
app.use("/query", query);
// app.use("/splashscreen", splashscreen);
app.use("/attribute", attribute)
app.use("/color", color)

///get image
// app.get('/:url', async (req, res) => {
//   const fileRef = admin.storage().bucket().file(req.params.url);
//   const hash = await fileRef.download()
//   res.contentType(fileRef.metadata.contentType);
//   res.end(hash[0], 'binary');
// });

//Data base connection
var url = process.env.MONGO_URL;
 
// var url = 'mongodb://localhost:27017/nanyproject'
mongoose.connect(
  url,
  { useUnifiedTopology: true, useNewUrlParser: true },
  function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("DataBase connected");
    }
  }
);

//Creating Server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is Running....`);
});
