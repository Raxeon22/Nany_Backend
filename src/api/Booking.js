const express = require("express");
const router = express.Router();
const booking = require("../models/Booking");
const {  verifytoken } = require("../middleware/auth");
const nodemailer = require("nodemailer");
const service = require("../models/Service");


router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      address,
      city,      
      serviceid,
      from,
      to,
      timestart,
      timeend,
      country,
      postalCode,
      user,
      comment,
    } = req.body;

    if (
      !(
        name &&
        email &&
        mobile &&
        address &&
        city &&
        country &&
        serviceid&&
        postalCode &&
        from &&
        to &&
        timestart &&
        timeend &&
        user
      )
    ) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else {
      
      service.findOne({_id:serviceid},async (err,result)=>{
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
          html: "<p>Your order for " + `${result.heading}` +" from "+ `${from}`+" to "+`${to}`+" at "+`${timestart}`+" - "+`${timeend}`+" is sucessfully booked"
        };
        
        
        await transporter.sendMail(mailOption,async(err, info) => {
        if (err) {
          res.send(err);
        } else {
          req.body.status = "Pending";
          const Booking = new booking(req.body);
          Booking.save().then((item) => {
            res.status(200).send({
              message: "Data save into Database",
              data: item,
              success: true,
            });
          });
          
        }})
       })
        
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
    console.log(id);
    if (!id) {
      res.status(200).send({ message: "id is not specify", success: false });
    } else {
      booking.findOne({ _id: id }, (err, result) => {
        console.log(result);
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
    if (!req.query) {
      booking.find({}, (err, result) => {
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
      booking.find(req.query, (err, result) => {
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

router.put("/acceptbooking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    booking.findOne({ _id: id ,status:"Pending"}, (err, result) => {
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
    const {employeeid} = req.body;
    if(!employeeid){
      res
        .status(200)
        .send({ message: "All input is required", success: false });

    }else{

      booking.findOne({ _id: id, status: "Accepted" }, (err, result) => {
        if (!result) {
          res.status(200).send({ message: "Data Not Exist", success: false });
      } else {
        booking.updateOne({ _id: id }, { status: "Assigned",employeeid:employeeid }, (err, value) => {
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
        if(result.status== "Accepted" || result.status== "Pending" || result.status== "Assigned") {

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
          }else{
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
    booking.findOne({ _id: id ,status:"Assigned"}, (err, result) => {
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

module.exports = router;
