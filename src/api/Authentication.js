const express = require("express");
const router = express.Router();
const authentication = require("../models/Auth");
const multer = require("multer");
const path = require("path");
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const { tokengenerate, verifyadmintoken } = require("../middleware/auth");
const { uploadFile } = require("../middleware/s3");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile/");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: storage });

//signup for user
router.post("/register/user", upload.single("file"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!(name && email && password)) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else if (!re.test(email)) {
      res.status(422).send({ message: "invlaid Email", success: false });
    } else {
      authentication.findOne({ email: email }, async (err, data) => {
        if (data) {
          if (data.usertype != 3) {
            res.status(200).send({
              message: "User already exist with another role",
              success: false,
            });
          } else {
            res.status(200).send({
              message: "User already exist....",
              success: false,
            });
          }
        } else {
          if (req.file) {
            req.body.image = req.file.filename;
            await uploadFile(req.file);
          }
          var salt = bcrypt.genSaltSync(10);
          req.body.password = bcrypt.hashSync(req.body.password, salt);
          req.body.usertype = 3;

          const Authentication = new authentication(req.body);
          Authentication.save().then((item) => {
            res.status(200).send({
              message: "Data save into Database",
              data: item,
              token: tokengenerate({ user: item }),
              success: true,
            });
          });
        }
      });
    }
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});

//signup for manager
router.post(
  "/register/manager",
  verifyadmintoken,
  upload.array("file"),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      if (!(name && email && password)) {
        res
          .status(200)
          .send({ message: "All input is required", success: false });
      } else if (!re.test(email)) {
        res.status(422).send({ message: "invlaid Email", success: false });
      } else {
        authentication.findOne({ email: email }, async (err, data) => {
          if (data) {
            if (data.usertype != 2) {
              res.status(200).send({
                message: "User already exist with another role",
                success: false,
              });
            } else {
              res.status(200).send({
                message: "User already exist....",
                success: false,
              });
            }
          } else {
            if (req.file) {
              req.body.image = req.file.filename;
              await uploadFile(req.file);
            }
            var salt = bcrypt.genSaltSync(10);
            req.body.password = bcrypt.hashSync(req.body.password, salt);

            req.body.usertype = 2;

            const Authentication = new authentication(req.body);
            Authentication.save().then((item) => {
              res.status(200).send({
                message: "Data save into Database",
                data: item,
                token: tokengenerate({ user: item }),
                success: true,
              });
            });
          }
        });
      }
    } catch (err) {
      res.status(400).send({ message: err.message, success: false });
    }
  }
);

//signup for admin
router.post("/register/admin", upload.array("file"), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!(name && email && password)) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else if (!re.test(email)) {
      res.status(422).send({ message: "invlaid Email", success: false });
    } else {
      authentication.findOne({ email: email }, async (err, data) => {
        if (data) {
          if (data.usertype != 1) {
            res.status(200).send({
              message: "User already exist with another role",
              success: false,
            });
          } else {
            res.status(200).send({
              message: "User already exist....",
              success: false,
            });
          }
        } else {
          if (req.file) {
            req.body.image = req.file.filename;
            await uploadFile(req.file);
          }
          var salt = bcrypt.genSaltSync(10);
          req.body.password = bcrypt.hashSync(req.body.password, salt);

          req.body.usertype = 1;

          const Authentication = new authentication(req.body);
          Authentication.save().then((item) => {
            res.status(200).send({
              message: "Data save into Database",
              data: item,
              token: tokengenerate({ user: item }),
              success: true,
            });
          });
        }
      });
    }
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else {
      const user = await authentication.findOne({ email: email });

      if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).send({
          data: user,
          message: "Login Successfull",
          token: tokengenerate({ user: user }),
          success: true,
        });
      } else {
        res.status(200).send({
          message: "Invalid email or password",
          success: false,
        });
      }
    }
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});
router.get("/Dashboard/:id", (req, res) => {
  try {
    const { id } = req.params;
    authentication.findOne({ _id: id }, (err, result) => {
      if (err) {
        res.status(400).send({ message: err.message, success: false });
      } else {
        res.status(200).send({
          Data: result,
          message: "Data get Successfull",
          success: true,
        });
      }
    });
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});
//otpsend
router.post("/otpsend", async (req, res) => {
  try {
    const email = req.body.email || req.query.email;

    const user = await authentication.findOne({ email: email });

    if (!user) {
      res
        .status(200)
        .send({ message: "User not exist plz register first", success: false });
    } else {
      var digits = "0123456789";
      let OTP = "";
      for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }

      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secure: true,
        port: 465,
        auth: {
          user: process.env.email, // generated ethereal user
          pass: process.env.password, // generated ethereal password
        },
      });

      let info = await transporter.sendMail({
        from: process.env.email, // sender address
        to: email, // list of receivers
        subject: "OTP verification", // Subject line
        text: "Hello world", // plain text body
        html: "<h1> otp for verification is :" + OTP + "</h1>", // html body
      });

      authentication.updateOne(
        { email: email },
        { otp: OTP },
        (err, result) => {
          if (err) {
            res.status(200).send({ message: "OTP not send", success: false });
          } else {
            res
              .status(200)
              .send({ message: "OTP send successfully", success: true });
          }
        }
      );
    }
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});

//updateprofile
router.put("/updateprofile/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(200).send({ message: "id is not valid ", success: false });
    } else {
      authentication.findOne({ _id: id }, (err, result) => {
        if (err) {
          res.status(200).send({
            message: err.message,
            success: false,
          });
        } else {
          authentication.updateOne({ _id: id }, req.body, (err, result) => {
            if (err) {
              res
                .status(200)
                .send({ message: "Updation Error!", success: false });
            } else {
              res.status(200).send({
                message: "Updation Successfull",
                token: tokengenerate({ user: result }),
                success: true,
              });
            }
          });
        }
      });
    }
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});

//otpverify
router.post("/otpverify", async (req, res) => {
  try {
    const { email, otp } = req.query;
    if (!(email && otp)) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else {
      const user = await authentication.findOne({ email: email });

      if (!user) {
        res.status(200).send({
          message: "User not exist plz register first",
          success: false,
        });
      } else {
        authentication.findOne(
          { email: email, otp: otp },
          async (err, result) => {
            if (!result) {
              res
                .status(200)
                .send({ message: "OTP not verified", success: false });
            } else {
              await authentication.updateOne({ email: email }, { otp: 0 });
              res
                .status(200)
                .send({ message: "OTP verified successfully", success: true });
            }
          }
        );
      }
    }
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});

//resetpassword
router.post("/resetpassword", async (req, res) => {
  try {
    const { email, password, confirmpassword } = req.body;
    if (!(email && password && confirmpassword)) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else {
      const user = await authentication.findOne({ email: email });

      if (!user) {
        res.status(200).send({
          message: "User not exist plz register first",
          success: false,
        });
      } else {
        if (password != confirmpassword) {
          res.status(200).send({
            message: "Password should be matched",
            success: false,
          });
        } else {
          var salt = bcrypt.genSaltSync(10);
          authentication.updateOne(
            { email: email },
            { password: bcrypt.hashSync(password, salt) },
            async (err, result) => {
              if (err) {
                res
                  .status(200)
                  .send({ message: "Password not updated", success: false });
              } else {
                res.status(200).send({
                  message: "Password updated successfully",
                  success: true,
                  token: tokengenerate({ user: req.user }),
                });
              }
            }
          );
        }
      }
    }
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});

module.exports = router;
