import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import nodemailer from "nodemailer";
import QRcode from "qrcode";

const primary_mail = process.env.MAIL_USER;
const primary_mail_pass = process.env.MAIL_PASSWORD;

const port = 3000;
const app = express();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true});

app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  register: {
    type: String,
    required: true,
    unique: true,
  },
}, { collection: 'users' });

const faSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  register: {
    type: String,
    required: true,
    unique: true,
  },
  form: {
    name: {
      type: String,
      required: true,
    },
    register: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    room: {
      type: Number,
      required: true,
    },
    dateIn: {
      type: Date,
      required: true,
    },
    dateOut: {
      type: String,
      required: true,
    },
    personalPhone: {
      type: Number,
      required: true,
    },
    parentPhone: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
},{ collection: 'fas' });

const hcoordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  register: {
    type: String,
    required: true,
    unique: true,
  },
  form: {
    name: {
      type: String,
      required: true,
    },
    register: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    room: {
      type: Number,
      required: true,
    },
    dateIn: {
      type: Date,
      required: true,
    },
    dateOut: {
      type: String,
      required: true,
    },
    personalPhone: {
      type: Number,
      required: true,
    },
    parentPhone: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
},{ collection: 'hods' });

const hodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  register: {
    type: String,
    required: true,
    unique: true,
  },
  form: {
    name: {
      type: String,
      required: true,
    },
    register: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    room: {
      type: Number,
      required: true,
    },
    dateIn: {
      type: Date,
      required: true,
    },
    dateOut: {
      type: String,
      required: true,
    },
    personalPhone: {
      type: Number,
      required: true,
    },
    parentPhone: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
},{ collection: 'hcoords' });

const User = mongoose.model("User", userSchema);
const Fa = mongoose.model("Fa", faSchema);
const Hod = mongoose.model("Hod", hodSchema);
const Hcoord = mongoose.model("Hcoord", hcoordSchema);

app.get("/", async (req, res) => {
  const users = await Hcoord.find({});
  res.json(users);
});

app.delete("/del", async (req, res) => {
  await User.deleteMany({});
  await Fa.deleteMany({});
  await Hod.deleteMany({});
  res.json({ msg: "done" });
});

app.get("/getfa", async (req, res) => {
  const data = await Fa.find({});
  res.json({ msg: data });
});
app.get("/formdata", async (req, res) => {
  const data = await Fa.find({});
  res.json(data);
});

app.delete("/delete", async (req, res) => {
  await Hcoord.deleteMany({});
  await User.deleteMany({});
  await Fa.deleteMany({});
  await Hod.deleteMany({});
  res.json({ message: "Deleted" });
});

app.post("/user/login", async (req, res) => {
  try {
    const { email, register } = req.body;

    const duplicateUser = await User.findOne({ email, register });
    const duplicateFaUser = await User.findOne({ email, register });
    const duplicateHodUser = await User.findOne({ email, register });

    if (duplicateUser || duplicateHodUser || duplicateFaUser) {
      res.status(400).json({ message: "error found" });
    } 
    else if (duplicateUser && (!duplicateFaUser || !duplicateHodUser)) {
      await User.deleteOne({ email });
      await User.create({
        email: email,
        register: register,
      });
     

      res.status(200).json({ message: newUser });
    } else {
      await User.create({
        email: email,
        register: register,
      });
    }
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "error found" });
  }
});

// Hostel Co-ordinator Login //

app.post("/hostel_coordinator/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(401).json({ message: "Repeated values found." });
  } else {
    if (email === primary_mail && password === process.env.MAIL_USER_PASS) {
      const data = await Hcoord.find({});
      if (data) {
        res.status(200).json({ message: " success", data });
      } else {
        res.status(401).json({ message: "error" });
      }
    } else {
      res.status(400).json({ message: "error" });
    }
  }

});

// Hostel Coordinator Email Setup // 

function sendHcoordapprovalmail(email, userName) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: primary_mail,
      pass: primary_mail_pass,
    },
  });

  var mailOptions = {
    from: primary_mail,
    to: email,
    subject: "Application Forwarded",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f5f5f5;
                  margin: 0;
                  padding: 0;
              }
      
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border: 1px solid #ccc;
                  border-radius: 5px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
      
              h2 {
                  color: #333;
                  margin-bottom: 20px;
              }
      
              p {
                  color: #555;
                  line-height: 1.6;
              }
      
              a {
                  color: #007bff;
                  text-decoration: none;
              }
      
              a:hover {
                  text-decoration: underline;
              }
      
              .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #777;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Your Application has been forwarded by the Hostel Co-ordinator to the Faculty Advisor</h2>
              <p>Dear ${userName},</p>
              <p>We are pleased to inform you that your leave application has been forwarded by the Hostel Co-ordinator to the Faculty Advisor (FA) for further processing.</p>
              <p>If you have any questions or need additional information, please feel free to <a href="mailto:support@example.com">contact our support team</a>.</p>
              <p>Best regards,<br> Team LeaveEase</p>
          </div>
          <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
          </div>
      </body>
      </html>
      
      `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

// Hostel Coordinator Approve // 

app.post("/hostel_coordinator/approve", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(404).json({ message: "please enter a valid email" });
  }
  const approvedUser = await Hcoord.findOne({ email: email });
  const deleteUser = await Hcoord.deleteOne({ email: email });

  const newUser = await Fa.create({
    name: approvedUser.name,
    email: approvedUser.email,
    register: approvedUser.register,
    form: approvedUser.form,
  });

  const newData = await Hcoord.find({});

  if (!newUser || !approvedUser || !deleteUser) {
    res.status(404).json({ messaage: "error" });
  }
  else {
    sendHcoordapprovalmail(approvedUser.email, approvedUser.name);
    res.status(200).json({ newData });
    console.log("email sent!! ");
  }

});

// Hostel Coordinator Reject //

app.post("/hostel_coordinator/reject", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(404).json({ message: "error" });
  }
  const user = await Hcoord.findOne({ email: email });
  const deleteUser = await Hcoord.deleteOne({ email: email });

  const newData = await Hcoord.find({});

  if (user && deleteUser) {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: primary_mail,
        pass: primary_mail_pass,
      },
    });

    var mailOptions = {
      from: primary_mail,
      to: `${email}`,
      subject: "Application Rejected - Notification",
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f5f5f5;
                  margin: 0;
                  padding: 0;
              }
      
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border: 1px solid #ccc;
                  border-radius: 5px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
      
              h2 {
                  color: #333;
                  margin-bottom: 20px;
              }
      
              p {
                  color: #555;
                  line-height: 1.6;
              }
      
              a {
                  color: #007bff;
                  text-decoration: none;
              }
      
              a:hover {
                  text-decoration: underline;
              }
      
              .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #777;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Your Application has been Rejected</h2>
              <p>Dear ${user.name},</p>
              <p>We regret to inform you that your leave application has been rejected due to some reasons, as communicated by the Hostel Co-ordinator.</p>
              <p>If you have any questions or need further clarification, please feel free to <a href="mailto:support@example.com">contact our support team</a>.</p>
              <p>Best regards,<br> Team LeaveEase</p>
          </div>
          <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
          </div>
      </body>
      </html>
              `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({ newData });
  }
});

app.post("/form", async (req, res) => {
  try {
    const { name, email, register, form } = req.body;

    const duplicateValue = await Hcoord.findOne({ email });

    if (duplicateValue) {
      res.status(400).json({ message: "duplicate values found" });
    } else {
      const newUser = await Hcoord.create({
        name: name,
        email: email,
        register: register,
        form: form,
      });
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: primary_mail,
          pass: primary_mail_pass,
        },
      });

      const mailOptions = {
        from: primary_mail,
        to: `${email}`,
        subject: "Application Submitted",
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }
        
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
        
                h2 {
                    color: #333;
                    margin-bottom: 20px;
                }
        
                p {
                    color: #555;
                    line-height: 1.6;
                }
        
                a {
                    color: #007bff;
                    text-decoration: none;
                }
        
                a:hover {
                    text-decoration: underline;
                }
        
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #777;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Your Application has been Submitted</h2>
                <p>Dear ${name}},</p>
                <p>Thank you for submitting your application. Our team will carefully review it, and we will inform you of the outcome as soon as possible.</p>
                <p>In the meantime, if you have any questions or need further assistance, please feel free to <a href="mailto:">contact our support team</a>.</p>
                <p>Best regards,<br> Team LeaveEase</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>
        `,
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log("mail sent " + info);
        }
      });
      res.status(200).json({ message: newUser });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/fa/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(401).json({ message: "Repeated values found." });
  } else {
    if (email === primary_mail && password === process.env.MAIL_USER_PASS) {
      const data = await Fa.find({});
      if (data) {
        res.status(200).json({ message: " success", data });
      } else {
        res.status(401).json({ message: "error" });
      }
    } else {
      res.status(400).json({ message: "error" });
    }
  }
});

app.post("/fa/reject", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(401).json({ message: "error" });
  } else {
    const user = await Fa.findOne({ email });

    const faDelete = await Fa.deleteOne({ email });

    const newData = await Fa.find({}).lean();

    if (faDelete && user) {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: primary_mail,
          pass: primary_mail_pass,
        },
      });

      var mailOptions = {
        from: primary_mail,
        to: `${email}`,
        subject: "Application Submitted - Notification",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }
        
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
        
                h2 {
                    color: #333;
                    margin-bottom: 20px;
                }
        
                p {
                    color: #555;
                    line-height: 1.6;
                }
        
                a {
                    color: #007bff;
                    text-decoration: none;
                }
        
                a:hover {
                    text-decoration: underline;
                }
        
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #777;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Your Application has been Rejected</h2>
                <p>Dear ${user.name},</p>
                <p>We regret to inform you that your leave application has been rejected due to some reasons, as communicated by the Faculty Advisor.</p>
                <p>If you have any questions or need further clarification, please feel free to <a href="mailto:support@example.com">contact our support team</a>.</p>
                <p>Best regards,<br> Team LeaveEase</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>
                `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.status(200).json({ newData });
    } else {
      res.status(404).json({ message: "Error" });
    }
  }
});

function sendFAapprovalmail(email, userName) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: primary_mail,
      pass: primary_mail_pass,
    },
  });

  var mailOptions = {
    from: primary_mail,
    to: email,
    subject: "Application Forwarded",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f5f5f5;
                  margin: 0;
                  padding: 0;
              }
      
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border: 1px solid #ccc;
                  border-radius: 5px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
      
              h2 {
                  color: #333;
                  margin-bottom: 20px;
              }
      
              p {
                  color: #555;
                  line-height: 1.6;
              }
      
              a {
                  color: #007bff;
                  text-decoration: none;
              }
      
              a:hover {
                  text-decoration: underline;
              }
      
              .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #777;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Your Application has been forwarded by the Faculty Advisor to the Head Of Department(H.O.D)</h2>
              <p>Dear ${userName},</p>
              <p>We are pleased to inform you that your leave application has been forwarded by the Faculty Advisor to the Head Of Department (H.O.D) for further processing.</p>
              <p>If you have any questions or need additional information, please feel free to <a href="mailto:support@example.com">contact our support team</a>.</p>
              <p>Best regards,<br> Team LeaveEase</p>
          </div>
          <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
          </div>
      </body>
      </html>
      
      `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}



app.post("/fa/approve", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(404).json({ message: "Error" });
  }

  const approvedUser = await Fa.findOne({ email: email });
  const faDelete = await Fa.deleteOne({ email: email });

  const newUser = await Hod.create({
    name: approvedUser.name,
    email: approvedUser.email,
    register: approvedUser.register,
    form: approvedUser.form,
  });

  const newData = await Fa.find({});
  if (!approvedUser || !faDelete || !newUser) {
    res.status(404).json({ message: "User not found" });
  } else {
    sendFAapprovalmail(approvedUser.email, approvedUser.name);
    res.status(200).json({ newData });
    console.log("sent NewData and mail successfully!.");
  }
});

app.post("/hod/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(404).json({ message: "error detected" });
  } else {
    if (email == primary_mail && password == process.env.MAIL_USER_PASS) {
      const data = await Hod.find({});
      if (data) {
        res.status(200).json({ message: "success", data });
      } else {
        res.status(401).json({ message: "error" });
      }
    }
  }
});

app.post("/hod/reject", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(404).json({ message: "error" });
  } else {
    const user = await Hod.findOne({ email: email });
    const hodDelete = await Hod.deleteOne({ email: email });
    const userDelete = await User.deleteOne({ email: email });

    const newData = await Hod.find({});

    if (hodDelete && userDelete) {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: primary_mail,
          pass: primary_mail_pass,
        },
      });

      const mailOptions = {
        from: primary_mail,
        to: `${email}`,
        subject: "Application Rejected",
        html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            background-color: #f5f5f5;
                            margin: 0;
                            padding: 0;
                        }
                
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            padding: 20px;
                            background-color: #ffffff;
                            border: 1px solid #ccc;
                            border-radius: 5px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                
                        h2 {
                            color: #333;
                            margin-bottom: 20px;
                        }
                
                        p {
                            color: #555;
                            line-height: 1.6;
                        }
                
                        a {
                            color: #007bff;
                            text-decoration: none;
                        }
                
                        a:hover {
                            text-decoration: underline;
                        }
                
                        .footer {
                            margin-top: 20px;
                            text-align: center;
                            color: #777;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Your Application has been Rejected</h2>
                        <p>Dear ${user.name},</p>
                        <p>We regret to inform you that your leave application has been rejected due to some reasons, as communicated by the Head of Department (H.O.D).</p>
                        <p>If you have any questions or need further clarification, please feel free to <a href="mailto:support@example.com">contact our support team</a>.</p>
                        <p>Best regards,<br> Team LeaveEase</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                    </div>
                </body>
                </html>
                
                `,
      };

      transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("email sent" + result.response);
        }
      });

      res.status(200).json({ newData });
    }
  }
});

const generateQr = async (qrData, Student, timestamp) => {
  return new Promise((resolve, reject) => {
    const fileName = `../Frontend/public/${Student.name}_${timestamp}.png`;
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Months are zero-based, so we add 1
    const day = today.getDate();

    const formattedDay = day < 10 ? "0" + day : day;
    const formattedMonth = month < 10 ? "0" + month : month;

    const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;
    // Encode the HTML content as a string
    const htmlContent = `
          <div style="font-family: 'Arial', sans-serif; background-color: #f0f0f0; padding: 20px;">
              <div style="background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                  <h2>Issue Date: ${formattedDate}</h2>
                  <h2>Student Information</h2>
                  <div>
                      <label>Name:</label>
                      <div>${Student.name}</div>
                  </div>
                  <div>
                      <label>Regsiter Number:</label>
                      <div>${Student.register}</div>
                  </div>
                  <div>
                      <label>Email:</label>
                      <div>${Student.email}</div>
                  </div>
                  <div>
                      <label>Room Number:</label>
                      <div>${Student.form.room}</div>
                  </div>
                  <div>
                      <label>Personal Phone Number:</label>
                      <div>${Student.form.personalPhone}</div>
                  </div>
                  <div>
                      <label>Parent Phone Number:</label>
                      <div>${Student.form.parentPhone}</div>
                  </div>
                  <div>
                      <label>Reason:</label>
                      <div>${Student.form.reason}</div>
                  </div>
              
              </div>
          </div>
      `;

    // Create a new QR code with the encoded HTML string
    QRcode.toFile(
      fileName,
      htmlContent,
      { errorCorrectionLevel: "L" },
      function (err) {
        if (err) {
          reject(err);
        } else {
          // Read the updated QR code image and encode it as a Data URI
          const updatedDataUri = fs.readFileSync(fileName, {
            encoding: "base64",
          });
          const dataUriString = `data:image/png;base64,${updatedDataUri}`;
          resolve(dataUriString);
        }
      }
    );
  });
};

app.post("/hod/approve", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(404).json({ message: "Invalid" });
  }

  const Student = await Hod.findOne({ email: email });
  const timestamp = new Date().getTime();
  const qrData = JSON.stringify(Student.form);
  generateQr(qrData, Student, timestamp).then((dataUri) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: primary_mail,
        pass: primary_mail_pass,
      },
    });

    var mailOptions = {
      from: primary_mail,
      to: `${email}`,
      subject: "Application Confirmed",
      html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body {
                                font-family: 'Arial', sans-serif;
                                background-color: #f5f5f5;
                                margin: 0;
                                padding: 0;
                            }

                            .container {
                                max-width: 600px;
                                margin: 20px auto;
                                padding: 20px;
                                background-color: #ffffff;
                                border: 1px solid #ccc;
                                border-radius: 5px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }

                            h2 {
                                color: #333;
                                margin-bottom: 20px;
                            }

                            p {
                                color: #555;
                                line-height: 1.6;
                            }

                            a {
                                color: #007bff;
                                text-decoration: none;
                            }

                            a:hover {
                                text-decoration: underline;
                            }

                            .footer {
                                margin-top: 20px;
                                text-align: center;
                                color: #777;
                                font-size: 14px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Your Application has been Confirmed</h2>
                            <p>Dear ${Student.name},</p>
                            <p>We are pleased to inform you that your leave application has been reviewed and confirmed.</p>
                            <p>If you have any further questions or require additional assistance, please feel free to <a href="mailto:support@example.com">contact our support team</a>.</p>
                            <br>
                            <p style="color:blue;">We have attached a QR code for your outpass. Please present it to the warden for verification.</p>
                            <p>Best regards,<br> Team LeaveEase</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </body>
                    </html>

                `,
      attachments: [
        {
          filename: `${Student.name}.png`,
          path: `../Frontend/Public/${Student.name}_${timestamp}.png`,
          cid: "qrCodeImage123", // Provide a unique CID
        },
      ],
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  });
  const userDelete = await User.deleteOne({ email });
  const hodDelete = await Hod.deleteOne({ email });

  const newData = await Hod.find({});
  res.status(200).json({ newData });
});

app.listen(port, () => {
  console.log("working");
});
