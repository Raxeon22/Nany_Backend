const mongoose = require("mongoose");
const booking = mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    mobile: Number,
    address: String,
    city: String,
    country: String,
    postalCode: Number,    
    startdate: String,
    enddate: String,
    starttime: String,
    endtime: String,
    invoiceid:Number,
    employeeid: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auth",
      },
    ],
    serviceid: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "service",
    },],
    userid: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auth",
      },
    ],
    userstart: Boolean,
    employeestart: Boolean,
    start: Boolean,
    comment: String,
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("booking", booking);
