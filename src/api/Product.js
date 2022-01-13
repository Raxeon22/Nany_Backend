const express = require("express");
const router = express.Router();
const product = require("../models/product");
const fs = require("fs");

const { getStorage  } = require('firebase-admin/storage');
const bucket = getStorage().bucket('gs://nany-ffb26.appspot.com/')
const path = require("path");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/product/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: storage });

router.post("/", upload.array("file"), async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (req.files) {
        
        req.body.image = req.files[0] ? req.files[0].path : ""; 
    }
    req.body.color = req.body.color.split(',')
    if (!(name && category && price)) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else {
      const Product = new product(req.body);
      Product.save().then((item) => {
        res.status(200).send({
          message: "Data save into Database",
          data: item,
          success: true,
        });
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(200).send({ message: "id is not specify", success: false });
    } else {
      product.updateOne({ _id: id }, req.body, (err, result) => {
        if (err) {
          res.status(200).send({ message: err.message, success: false });
        } else {
          res.status(200).send({
            message: "Data updated Successfully",
            success: true,
            data: result,
          });
        }
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.delete("/", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      res.status(200).send({ message: "id is not specify", success: false });
    } else {
      product.findOne({ _id: id }, (err, result) => {
        if (result) {
          fs.unlink(result.image, () => { });
          product.deleteOne({ _id: id }, (err, val) => {
            if (!val) {
              res.status(200).send({ message: err.message, success: false });
            } else {
              res.status(200).send({
                message: "Data deleted Successfully",
                success: true,

              });
            }
          });
        } else {
          res.status(200).send({ message: err.message, success: false });
        }
      })

    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.get("/", async (req, res) => {
  try {
    const { Search, category, id } = req.query;

    if (Search) {
      product.find(
        {
          name: {
            $regex: Search,
            $options: "i",
          },
        },
        (err, result) => {
          if (!result) {
            res.status(200).send({ message: err.message, success: false });
          } else {
            res.status(200).send({
              message: "Data get Successfully",
              success: true,
              data: result,
            });
          }
        }
      );
    } else if (id) {
      product.find(
        {
          _id: id
        },
        (err, result) => {
          if (!result) {
            res.status(200).send({ message: err.message, success: false });
          } else {



            res.status(200).send({
              message: "Data get Successfully",
              success: true,
              data: result,
            });
          }
        }
      );
    } else if (category) {
      product.find(
        {
          category: category
        },
        (err, result) => {
          if (!result) {
            res.status(200).send({ message: err.message, success: false });
          } else {
            res.status(200).send({
              message: "Data get Successfully",
              success: true,
              data: result,
            });
          }
        }
      );
    } else {
      product.find({}, (err, result) => {
        if (!result) {
          res.status(200).send({ message: err.message, success: false });
        } else {
          res.status(200).send({
            message: "Data get Successfully",
            success: true,
            data: result,
          });
        }
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
module.exports = router;
