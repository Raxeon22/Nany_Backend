const express = require("express");
const router = express.Router();
const path = require("path");
const category = require("../models/Category");
const fs = require("fs");

const multer = require("multer");
const { uploadFile } = require("../middleware/s3");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/category/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { text} = req.body;
    const heading = req.body.heading.toLowerCase()

    if (!(text && heading)) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else {
      category.findOne({ heading: heading }, async (err, result) => {
        if (err) {
          res.status(200).send({
            message: "Category already exist",

            success: false,
          });
        } else {
          if (req.file) {
            await uploadFile(req.file);
            req.body.image = req.file.filename;
          }

          const Category = new category(req.body);
          Category.save().then((item) => {
            res.status(200).send({
              message: "Data save into Database",
              data: item,
              success: true,
            });
          });
        }
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(200).send({ message: "id is not specify", success: false });
    } else {
      category.findOne({ _id: id }, async (err, result) => {
        if (!result) {
          res.status(200).send({ message: "No Data Exist", success: false });
        } else {
          if (req.file) {
            await uploadFile(req.file);
            req.body.image = req.file.filename;
          }

          category.updateOne({ _id: id }, req.body, (err, result) => {
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
      category.find({ _id: id }, (err, result) => {
        if (result) {
          category.deleteOne({ _id: id }, (err, val) => {
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
      category.find(req.query, (err, result) => {
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
    } else {
      category.find({}, (err, result) => {
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
