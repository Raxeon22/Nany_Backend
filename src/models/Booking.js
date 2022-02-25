const mongoose = require("mongoose");
const booking = mongoose.Schema(
  {
    name: String,
    email: String,
    mobile: Number,
    address: String,
    city: String,
    country: String,
    postalCode: Number,
    serviceid:String,
    employeeid:String,
    from: String,
    to: String,
    timein: String,
    timeout: String,
    employeeid: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auth",
      },
    ],
    serviceid:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "service",
      },
    ],
    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auth",
      },
    ],
    userstart:Boolean,
    employeestart:Boolean,
    start:Boolean,
    comment: String,
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("booking", booking);
