const express = require("express");
const router = express.Router();
const banner = require("../models/Banner");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadFile } = require("../middleware/s3");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/banner/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: storage });

router.post("/web", upload.single("file"), async (req, res) => {
  try {
    if (req.file) {
      await uploadFile(req.file);
      req.body.image = req.file.filename;
      req.body.tag = "web";
      const Banner = new banner(req.body);
      Banner.save().then((item) => {
        res.status(200).send({
          message: "Data save into Database",
          data: item,
          success: true,
        });
      });
    } else {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.post("/mobile", upload.single("file"), async (req, res) => {
  try {
    if (req.file) {
      req.body.image = req.file.filename;
      await uploadFile(req.file);
      req.body.tag = "mobile";
      const Banner = new banner(req.body);
      Banner.save().then((item) => {
        res.status(200).send({
          message: "Data save into Database",
          data: item,
          success: true,
        });
      });
    } else {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.post("/app", upload.single("file"), async (req, res) => {
  try {
    
    if (req.file) {
      await uploadFile(req.file);
      req.body.image = req.file.filename;
      req.body.tag = "app";
      
      const Banner = new banner(req.body);
      Banner.save().then((item) => {
        res.status(200).send({
          message: "Data save into Database",
          data: item,
          success: true,
        });
      });
    } else {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.post("/market", upload.single("file"), async (req, res) => {
  try {
    banner.find({ tag: "market" }, async (err, result) => {
      if (result) {
        res
          .status(200)
          .send({ message: "No more markets can be added", success: false });
      } else {
        if (req.file) {
          await uploadFile(req.file);
          req.body.image = req.file.filename;
          req.body.tag = "market";
          const Banner = new banner(req.body);
          Banner.save().then((item) => {
            res.status(200).send({
              message: "Data save into Database",
              data: item,
              success: true,
            });
          });
        } else {
          res
            .status(200)
            .send({ message: "All input is required", success: false });
        }
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.post("/splash", upload.single("file"), async (req, res) => {
  try {
    if (req.file) {
      await uploadFile(req.file);
      req.body.image = req.file.filename;
      req.body.tag = "splash";
      const Banner = new banner(req.body);
      Banner.save().then((item) => {
        res.status(200).send({
          message: "Data save into Database",
          data: item,
          success: true,
        });
      });
    } else {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});

router.get("/web", async (req, res) => {
  try {
    req.query.tag = "web";
    banner.find(req.query, (err, result) => {
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
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});

router.get("/mobile", async (req, res) => {
  try {
    req.query.tag = "mobile";
    banner.find(req.query, (err, result) => {
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
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.get("/app", async (req, res) => {
  try {
    req.query.tag = "app";
    banner.find(req.query, (err, result) => {
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
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.get("/splash", async (req, res) => {
  try {
    req.query.tag = "splash";
    banner.find(req.query, (err, result) => {
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
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});

router.get("/market", async (req, res) => {
  try {
    req.query.tag = "market";
    banner.find(req.query, (err, result) => {
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
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});

router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    if (req.body.tag) {
      res
        .status(200)
        .send({ message: "Input data in invalid", success: false });
    }
    if (!id) {
      res.status(200).send({ message: "id is not specify", success: false });
    } else {
      banner.findById({ _id: id }, async (err, result) => {
        if (result) {
          if (req.file) {
            await uploadFile(req.file);
            req.body.image = req.file.filename;
          }

          banner.updateOne({ _id: id }, req.body, (err, result) => {
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
        } else {
          res.status(200).send({ message: "No Data Exist", success: false });
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
      banner.findOne({ _id: id }, (err, result) => {
        if (result) {
          banner.deleteOne({ _id: id }, (err, result) => {
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
        } else {
          res.status(200).send({ message: "Data not exist", success: false });
        }
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
module.exports = router;
