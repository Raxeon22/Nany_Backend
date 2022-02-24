const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const { verifyadmintoken, verifytoken } = require("../middleware/auth");

var easyinvoice = require("easyinvoice");

router.post("/", async (req, res) => {
  try {
    var date = Date().toLocaleString().split(" ");
    date = date[1] + " " + date[2] + " " + date[3];
    const { order, product } = req.body;
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!(order && product)) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else if (!re.test(order.email)) {
      res.status(422).send({ message: "invlaid Email", success: false });
    } else {
      var invoiceid = 1;
      Order.find({}, async (err, result) => {
        if (result[result.length - 1]) {
          invoiceid =
            (await result[result.length - 1].invoiceid) > 0
              ? result[result.length - 1].invoiceid + 1
              : 1;
        }
        var invoiceproduct = [];
        product.map((item, index) => {
          invoiceproduct[index] = {
            quantity: item.quantity,
            description: item.name,
            price: item.price,
            "tax-rate": item.tax ? item.tax : 0,
          };
        });

        //Data of pdf
        const data = {
          images: {
            logo: "https://firebasestorage.googleapis.com/v0/b/ssuetcorner-3803f.appspot.com/o/logo.png?alt=media&token=e7f3b8a9-4b21-4b12-8c76-e975bc94056c",
          },
          sender: {
            company: "Care Inc",
            address: "clineinfo@careinc.com",
            zip: "+237 697187304",
            country: "Samplecountry",
            city: "www.careinc.com",
          },
          // Your recipient
          client: {
            company: order.name,
            address: order.address,
            zip: order.postalCode,
            city: order.city,
            country: order.country,
          },
          information: {
            number: invoiceid,
            "due-date": Date().toLocaleString().split(" ")[0],
            date: date,
          },
          products: invoiceproduct,
          setting: {
            currency: "USD",
            "tax-notation": "Tax",
          },
          translate: {
            "due-date": "Day",
          },
        };

        fs.unlink("invoice.pdf", () => {});
        await easyinvoice.createInvoice(data, async function (result) {
          await fs.writeFileSync("invoice.pdf", result.pdf, "base64");
        });
        order.products = [];
        product.map((item, index) => {
          order.products[index] = {
            product: item._id,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
          };
        });
        req.body.order.invoiceid = invoiceid;
        order.status = "Pending";

        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: false,

          auth: {
            user: process.env.email, // generated ethereal user
            pass: process.env.password, // generated ethereal password
          },
        });
        const mailOption = {
          from: process.env.email,
          to: order.email, // sender address
          subject: "Invoice for your order", // Subject line
          attachments: [{ filename: "invoice.pdf", path: "./invoice.pdf" }],
        };

        await transporter.sendMail(mailOption,async(err, info) => {
          if (err) {
            res.send(err);
          } else {
            const mailOption = {
              from: process.env.email,
              to: process.env.email, // sender address
              subject: "Invoice for your order", // Subject line
              attachments: [{ filename: "invoice.pdf", path: "./invoice.pdf" }],
            };
            await transporter.sendMail(mailOption, (err, info) => {
              if (err) {
                res.send(err);
              } else {
                const Booking = new Order(order);
                Booking.save().then((item) => {
                  res.status(200).send({
                    message: "Data save into Database",
                    data: item,
                    success: true,
                  });
                });
              }
            });
          }
        });
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});

router.put("/:id", verifytoken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(200).send({ message: "id is not specify", success: false });
    } else {
      Order.updateOne({ _id: id }, req.body, (err, result) => {
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
      Order.deleteOne({ _id: id }, (err, result) => {
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
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.get("/", async (req, res) => {
  try {
    if (req.query) {
      Order.find(req.query, (err, result) => {
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
      Order.find({}, (err, result) => {
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
router.put("/acceptorder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    Order.findOne({ _id: id }, (err, result) => {
      if (!result) {
        res.status(200).send({ message: "Invalid selection", success: false });
      } else {
        Order.updateOne({ _id: id }, { status: "Accepted" }, (err, value) => {
          if (err) {
            res.status(200).json({ message: err.message, success: false });
          } else {
            res
              .status(200)
              .json({ message: "Order accepted Successfully", success: false });
          }
        });
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.put("/rejectorder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    Order.findOne({ _id: id }, (err, result) => {
      if (!result) {
        res.status(200).send({ message: "Invalid selection", success: false });
      } else {
        Order.updateOne({ _id: id }, { status: "Rejected" }, (err, value) => {
          if (err) {
            res.status(200).json({ message: err.message, success: false });
          } else {
            res.status(200).json({ message: "Order Rejected", success: false });
          }
        });
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.put("/assignorder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    Order.findOne({ _id: id }, (err, result) => {
      if (!result) {
        res.status(200).send({ message: "Invalid selection", success: false });
      } else {
        Order.updateOne({ _id: id }, { status: "Assigned" }, (err, value) => {
          if (err) {
            res.status(200).json({ message: err.message, success: false });
          } else {
            res
              .status(200)
              .json({ message: "Order Assign Successfully", success: false });
          }
        });
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.put("/cancelorder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    order.findOne({ _id: id }, (err, result) => {
      if (!result) {
        res.status(200).send({ message: "Invalid selection", success: false });
      } else {
        order.updateOne({ _id: id }, { status: "Cancelled" }, (err, value) => {
          if (err) {
            res.status(200).json({ message: err.message, success: false });
          } else {
            res
              .status(200)
              .json({ message: "Order Cancelled", success: false });
          }
        });
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.put("/completeorder/:id", verifytoken, async (req, res) => {
  try {
    const { id } = req.params;
    Order.findOne({ _id: id }, (err, result) => {
      if (!result) {
        res.status(200).send({ message: "Invalid selection", success: false });
      } else {
        Order.updateOne({ _id: id }, { status: "Completed" }, (err, value) => {
          if (err) {
            res.status(200).json({ message: err.message, success: false });
          } else {
            res
              .status(200)
              .json({ message: "Order accepted Successfully", success: false });
          }
        });
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});

module.exports = router;
