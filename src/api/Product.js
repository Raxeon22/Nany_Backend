const express = require("express");
const router = express.Router();
const product = require("../models/product");
const fs = require("fs");

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
const { uploadFile } = require("../middleware/s3");
const { log } = require("console");
router.post("/", upload.array("file"), async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    req.body.image = [];

    req.files.map(async (item, index) => {
      req.body.image[index] = item.filename;
      await uploadFile(item);
    });

    req.body.color = JSON.parse(req.body.color);
    req.body.size = JSON.parse(req.body.size);
console.log(req.body.size);
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
router.put("/:id", upload.array("file"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(200).send({ message: "id is not specify", success: false });
    } else {
      product.findOne({ _id: id }, (err, result) => {
        if (!result) {
          res.status(200).send({ message: "No Data Exist", success: false });
        } else {
          if (req.files) {
            result.image ? fs.unlink(result.image[0], () => {}) : null;
            req.body.image = req.files[0].filename;
          }
          console.log(req.body);
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
          if (result.image) {
            fs.unlink(result.image, () => {});
          }
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
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});

router.get("/", async (req, res) => {
  try {
    if (req.query) {
      product.find(req.query, (err, result) => {
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
    } else {
      // product
      //   .findOne({ _id: "62028dbab9f74a907b3b6215" })
      //   .populate("color")
      //   .exec((err, result) => {
      //     if (!result) {
      //       res.status(200).send({ message: err.message, success: false });
      //     } else {
      //       res.status(200).send({
      //         message: "Data get Successfully",
      //         success: true,
      //         data: result,
      //       });
      //     }
      //   });
      product.find({}, (err, result) => {
        if (!result) {
          res.status(200).send({ message: "Data Not Exist", success: false });
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
