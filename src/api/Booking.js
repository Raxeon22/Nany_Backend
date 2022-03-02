const express = require("express");
const router = express.Router();
const booking = require("../models/Booking");
const { verifytoken } = require("../middleware/auth");
const nodemailer = require("nodemailer");
const service = require("../models/Service");
const authentication = require("../models/Auth");


router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobile,
      address,
      city,
      serviceid,
      userid,
      startdate,
      enddate,
      starttime,
      endtime,
      country,
      postalCode,
      comment,
    } = req.body;

    if (
      !(
        firstName &&
        lastName&&
        email &&
        mobile &&
        address &&
        city &&
        country &&
        serviceid &&
        postalCode &&
        startdate &&
        enddate &&
        starttime &&
        endtime&&
        userid
      )
    ) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else {

      service.findOne({ _id: serviceid }, async (err, result) => {
      

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
          to: email, // sender address
          subject: "Your Booking is booked wait for futher process", // Subject line
          html: "<p>Your order for " + `${result.heading}` + " from " + `${startdate}` + " to " + `${enddate}` + " at " + `${starttime}` + " - " + `${endtime}` + " is sucessfully booked"         
        };


        await transporter.sendMail(mailOption, async (err, info) => {
          if (err) {
            res.send(err);
          } else {
            req.body.status = "Pending";
            req.body.start = false;
            req.body.userstart = false;
            req.body.employeestart = false;
            booking.find({},async (err,result)=>{              
            let invoiceid =
                (await result[result.length - 1]?result[result.length - 1].invoiceid:-1) > 0
                ?( result[result.length - 1].invoiceid + 1)
                : 200;
              req.body.invoiceid=invoiceid;
              
              const Booking = new booking(req.body);
              Booking.save().then((item) => {
                res.status(200).send({
                  message: "Data save into Database",
                  data: item,
                  success: true,
                });
              });
            })

          }
        
      })})

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
      booking.findOne({ _id: id }, (err, result) => {
        if (!result) {
          res.status(200).send({ message: "Data not exist", success: false });
        } else {
          booking.updateOne({ _id: id }, req.body, (err, result) => {
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
      booking.findOne({ _id: id }, (err, result) => {
        
        if (!result) {
          res.status(200).send({ message: "Data not exist", success: false });
        } else {
          booking.deleteOne({ _id: id }, (err, result) => {
            if (!result) {
              res.status(200).send({ message: err.message, success: false });
            } else {
              res.status(200).send({
                message: "Data deleted Successfully",
                success: true,

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
router.get("/", async (req, res) => {
  try {
    const {page, limit}= req.query;
    const offset= (page-1) * limit;
    
    let data = await booking.find(req.query).populate("serviceid").populate('userid').populate('employeeid');

      if (!data) {
        res.status(200).send({ message: "Data Not Exist", success: false });
      } else {
        res.status(200).send({
          message: "Data get Successfully",
          success: true,
          data: data
        });
      }    
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});

router.put("/acceptbooking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    booking.findOne({ _id: id, status: "Pending" }, (err, result) => {
      if (!result) {
        res.status(200).send({ message: "Data Not Exist", success: false });
      } else {
        booking.updateOne({ _id: id }, { status: "Accepted" }, (err, value) => {
          if (err) {
            res.status(200).json({ message: err.message, success: false });
          } else {
            res.status(200).json({
              message: "booking accepted Successfully",
              success: false,
            });
          }
        });
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.put("/rejectbooking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    booking.findOne({ _id: id }, (err, result) => {
      if (!result) {
        res.status(200).send({ message: "Data Not Exist", success: false });
      } else {
        booking.updateOne({ _id: id }, { status: "Rejected" }, (err, value) => {
          if (err) {
            res.status(200).json({ message: err.message, success: false });
          } else {
            res
              .status(200)
              .json({ message: "booking Rejected", success: false });
          }
        });
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.put("/assignbooking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeid } = req.body;
    if (!employeeid) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });

    } else {

      booking.findOne({ _id: id, status: "Accepted" }, (err, result) => {
        if (!result) {
          res.status(200).send({ message: "Data Not Exist", success: false });
        } else {
          booking.updateOne({ _id: id }, { status: "Assigned", employeeid: employeeid }, (err, value) => {
            if (err) {
              res.status(200).json({ message: err.message, success: false });
            } else {
              res
                .status(200)
                .json({ message: "booking Assign Successfully", success: false });
            }
          });
        }
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.put("/cancelbooking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    booking.findOne({ _id: id }, (err, result) => {
      if (!result) {
        res.status(200).send({ message: "Data Not Exist", success: false });
      } else {
        if (result.status == "Accepted" || result.status == "Pending" || result.status == "Assigned") {

          booking.updateOne(
            { _id: id },
            { status: "Cancelled" },
            (err, value) => {
              if (err) {
                res.status(200).json({ message: err.message, success: false });
              } else {
                res
                  .status(200)
                  .json({ message: "booking Cancelled", success: false });
              }
            }
          );
        } else {
          res
            .status(200)
            .json({ message: "Booking cannot be Cancelled", success: false });
        }
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.put("/completebooking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    booking.findOne({ _id: id, status: "Assigned" }, (err, result) => {
      if (!result) {
        res.status(200).send({ message: "Data Not Exist", success: false });
      } else {
        booking.updateOne(
          { _id: id },
          { status: "Completed" },
          (err, value) => {
            if (err) {
              res.status(200).json({ message: err.message, success: false });
            } else {
              res.status(200).json({
                message: "booking Completed Successfully",
                success: false,
              });
            }
          }
        );
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
router.put('/start/:user/:id', (req, res) => {
  try {
    const { user, id } = req.params

    if (user == "user") {
      booking.findOne({ _id: id }, (err, result) => {
        if (!result) {
          res.status(200).send({ message: "Data Not Exist", success: false });
        } else {

          if (result.employeestart == true) {
            booking.updateOne(
              {
                "_id": id
                , "start": true,
                "userstart":true

              },
              (err, value) => {
                if (err) {
                  res.status(200).json({ message: err.message, success: false });
                } else {
                  res.status(200).json({
                    message: "Service start Successfully",
                    success: false,
                  });
                }
              }
            );
          } else {
            booking.updateOne(
              {
                "_id": id
                , "userstart": true
              },
              (err, value) => {
                if (err) {
                  res.status(200).json({ message: err.message, success: false });
                } else {
                  res.status(200).json({
                    message: "Service start Successfully",
                    success: false,
                  });
                }
              }
            );
          }
          

        }
      });
    } else if (user == "employee") {

      booking.findOne({ _id: id }, (err, result) => {
        if (!result) {
          res.status(200).send({ message: "Data Not Exist", success: false });
        } else {
          if (result.userstart == true) {
            booking.updateOne(
              {
                "_id": id
                , "start": true,
                "employeestart": true
              },
              (err, value) => {
                if (err) {
                  res.status(200).json({ message: err.message, success: false });
                } else {
                  res.status(200).json({
                    message: "Service start Successfully",
                    success: false,
                  });
                }
              }
            );
          } else {
            booking.updateOne(
              {
                "_id": id
                , "employeestart": true
              },
              (err, value) => {
                if (err) {
                  res.status(200).json({ message: err.message, success: false });
                } else {
                  res.status(200).json({
                    message: "Service start Successfully",
                    success: false,
                  });
                }
              }
            );
          }

        }
      });
    } else if (user == "admin") {
      booking.findOne({ _id: id }, (err, result) => {
        if (!result) {
          res.status(200).send({ message: "Data Not Exist", success: false });
        } else {
          booking.updateOne(
            { _id: id },
            { start: true },
            (err, value) => {
              if (err) {
                res.status(200).json({ message: err.message, success: false });
              } else {
                res.status(200).json({
                  message: "Service start Successfully",
                  success: false,
                });
              }
            }
          );
        }
      });
    }

  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
})
module.exports = router;
