const mongoose = require("mongoose");
const banner = mongoose.Schema(
  {
    tag:String,
    image: String,
    lang: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("banner", banner);
