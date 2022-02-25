const express = require("express");
const router = express.Router();
const splashscreen = require("../models/SplashScreen");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadFile } = require("../middleware/s3");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/splashscreen/");
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
    if (req.file) {
      req.body.image = req.file ? req.file.filename : "";
      await uploadFile(req.file);
      const Splashscreen = new splashscreen(req.body);
      Splashscreen.save().then((item) => {
        res.status(200).send({
          message: "Data save into Database",
          data: item,
          success: true,
        });
      });
    } else {
      res.status(200).json({ message: "first input image", success: false });
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
      splashscreen.findOne({ _id: id }, req.body, async(err, result) => {
        if (!result) {
          res.status(200).send({ message: "No Data Exist", success: false });
        } else {
          req.body.image = req.file ? req.file.filename : "";
      await uploadFile(req.file);
          splashscreen.updateOne({ _id: id }, req.body,  (err, result) => {
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
    console.log(id);
    if (!id) {
      res.status(200).send({ message: "id is not specify", success: false });
    } else {
      splashscreen.findOne({ _id: id }, (err, result) => {
        if (result.image) {
          fs.unlink(result.image, () => {});
        }
        splashscreen.deleteOne({ _id: id }, (err, result) => {
          if (!result) {
            res.status(200).send({ message: err.message, success: false });
          } else {
            res.status(200).send({
              message: "Data deleted Successfully",
              success: true,
              data: result,
            });
          }
        });
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.get("/", async (req, res) => {
  try {
    splashscreen.find({}, (err, result) => {
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
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
module.exports = router;
