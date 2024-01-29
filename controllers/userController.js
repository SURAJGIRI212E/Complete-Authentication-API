import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../config/emailconfig.js";
dotenv.config();

const userRegistration = async (req, res) => {
  const { name, email, password, password_confirmation, tc } = req.body;
  const user = await UserModel.findOne({ email: email });
  if (user) {
    res.send({ status: "failed", message: "email already exists" });
    return;
  }
  if (name && email && password && password_confirmation && tc) {
    if (password === password_confirmation) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const doc = new UserModel({
          name: name,
          email: email,
          password: hashPassword,
          tc: tc,
        });
        await doc.save();
        const user_saved = await UserModel.findOne({ email: email });
        //generating jwt token
        const token = jwt.sign(
          { userID: user_saved._id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" }
        );
        res.send({ status: "register sucess", token: token });
      } catch (error) {
        console.log(error);
        res.send({ status: "failed", message: "error" });
      }
    } else {
      res.send({
        status: "failed",
        message: "password and confirm password not macth",
      });
    }
  } else {
    res.status(201).send({ status: "failed", message: "all filled required " });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await UserModel.findOne({ email: email });
      if (user != null) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch && user.email === email) {
          //Generate jwt token
          const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
          );

          res.send({ status: "success", message: "user login", token: token });
        } else {
          res.send({
            status: "failed",
            message: "email or password not match",
          });
        }
      } else {
        res.send({ status: "failed", message: "user not register" });
      }
    } else {
      res.send({ status: "failed", message: "email and password required" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "failed", message: "unable to login" });
  }
};

export const changeUserPassword = async (req, res) => {
  const { password, password_confirmation } = req.body;
  if (password && password_confirmation) {
    if (password !== password_confirmation) {
      res.send({
        status: "failed",
        mssg: "new password and confirm not match",
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);
      // console.log(req.user._id);
      const doc = await UserModel.findOneAndUpdate(req.user._id,{
        password: newHashPassword});
      await doc.save();

      res.send({ status: "success", mssg: `password  changed for ${req.user.email}` });
    }
  } else {
    res.send({ status: "failed", mssg: "all field required" });
  }
};

export const loggedUser = async (req, res) => {
  res.send({ user: req.user });
};

export const sendUserPasswordResetEmail = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const user = await UserModel.findOne({ email: email });
    if (user) {
      const secret = user._id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: "10m",
      });
      const link=`http://localhost:8000/api/user/resetpassword/${user._id}/${token}`
      // const link = `http://127.0.0.1:3000/api/user/resetpassword/${user._id}/${token}`;
      // console.log(link);


      // Send Email
      let info = await transporter.sendMail({
        from: process.env.EMAIL_FROM, // sender address
        to: user.email, // list of receivers
        subject: "Password reset link", // Subject line
        text: "if forget your password", // plain text body
        html: `<a href=${link}>Click Here</a> to reset your password`, // html body
      });

      res.send({
        status: "success",
        mssg: `Password reset email sent to ${email} ...`,
        info:info
      });
    } else {
      res.send({ status: "failed", mssg: "email not register" });
    }
  } else {
    res.send({ status: "failed", mssg: "email is required" });
  }
};

export const userPasswordReset = async (req, res) => {
  const { password, password_confirmation } = req.body;
  const {id,token} =req.params
  const user = await UserModel.findById(id);
  const new_secret=user._id+process.env.JWT_SECRET_KEY
  try {
    jwt.verify(token,new_secret)
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          mssg: "new password and confirm not match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        // console.log(req.user._id);
        const doc = await UserModel.findOneAndUpdate(user._id,{
          password: newHashPassword
        });
        await doc.save();
  
        res.send({ status: "success", mssg: "password  reset successfully " });
      }
    } else {
      res.send({ status: "failed", mssg: "all field required" });
    }
  } catch (error) {
    console.log(error)
    res.send({ status: "failed", mssg: "invalid token" });
    
  }
};

export default userRegistration;
