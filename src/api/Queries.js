const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const { verifyadmintoken, verifytoken } = require("../middleware/auth");

router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, mobile, email, way_to_use, message } =
      req.body;
    
    if (
      !(first_name && last_name && mobile && email && way_to_use && message)
    ) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else {
      req.body.mobile = parseInt(req.body.mobile);
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
        subject: "Contact ", // Subject line
        html: `<html>
        <p>
        first_name: ${first_name}</p>
        <p>last_name: ${last_name}</p>
        <p>mobile: ${mobile}</p>
        <p>email: ${email}</p>
        <p>way_to_use: ${way_to_use}</p>
        <p>message: ${message}</p>
        </html>`
      };

      await transporter.sendMail(mailOption, async (err, info) => {
        if (err) {
          res.send(err);
        } else {
          const mailOption = {
            from: process.env.email,
            to: process.env.email, // sender address
            subject: "Contact ", // Subject line
            html: `<html>
            <p>
            first_name: ${first_name}</p>
            <p>last_name: ${last_name}</p>
            <p>mobile: ${mobile}</p>
            <p>email: ${email}</p>
            <p>way_to_use: ${way_to_use}</p>
            <p>message: ${message}</p>
            </html>`
          };
          await transporter.sendMail(mailOption, (err, info) => {
            if (err) {
              res.send(err);
            } else {
    
          res
            .status(200)
            .send({ message: "Email send Successfully", success: true });        }
          });
        }
    
        
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
});
// router.put("/:id", verifytoken, async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id) {
//       res.status(200).send({ message: "id is not specify", success: false });
//     } else {
//       queries.findone({ _id: id }, (err, result) => {
//         if (!result) {
//           res.status(200).send({ message: "Data not exist", success: false });
//         } else {
//           queries.updateOne({ _id: id }, req.body, (err, result) => {
//             if (err) {
//               res.status(200).send({ message: err.message, success: false });
//             } else {
//               res.status(200).send({
//                 message: "Data updated Successfully",
//                 success: true,
//                 data: result,
//               });
//             }
//           });
//         }
//       });
//     }
//   } catch (err) {
//     res.status(400).json({ message: err.message, success: false });
//   }
// });
// router.delete("/", async (req, res) => {
//   try {
//     const { id } = req.query;
//     if (!id) {
//       res.status(200).send({ message: "id is not specify", success: false });
//     } else {
//       queries.find({ _id: id }, (err, result) => {
//         if (!result) {
//           res.status(200).send({ message: "Data not exist", success: false });
//         } else {
//           queries.deleteOne({ _id: id }, (err, result) => {
//             if (!result) {
//               res.status(200).send({ message: err.message, success: false });
//             } else {
//               res.status(200).send({
//                 message: "Data deleted Successfully",
//                 success: true,
//                 data: result,
//               });
//             }
//           });
//         }
//       });
//     }
//   } catch (err) {
//     res.status(400).json({ message: err.message, success: false });
//   }
// });
// router.get("/", async (req, res) => {
//   try {
//     if (req.query) {
//       queries.find(req.query, (err, result) => {
//         if (!result) {
//           res.status(200).send({ message: err.message, success: false });
//         } else {
//           res.status(200).send({
//             message: "Data get Successfully",
//             success: true,
//             data: result,
//           });
//         }
//       });
//     } else {
//       queries.find({}, (err, result) => {
//         if (!result) {
//           res.status(200).send({ message: err.message, success: false });
//         } else {
//           res.status(200).send({
//             message: "Data get Successfully",
//             success: true,
//             data: result,
//           });
//         }
//       });
//     }
//   } catch (err) {
//     res.status(400).json({ message: err.message, success: false });
//   }
// });

module.exports = router;
