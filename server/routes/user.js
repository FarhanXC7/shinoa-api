const express = require("express")
const router = express.Router()
const User = require("../models/User")
const { registerValidation, loginValidation, isLoggedIn, isOwner } = require("../config/validation")
const path = require("path")
const passport = require("passport")
require("dotenv/config")

router.get("/", isOwner, async (req, res) => {
  try {
    const showUser = await User.find()
    res.json(showUser)
  } catch (e) {
    res.status(400).json({
      status: res.statusCode,
      message: e,
    })
  }
})

router.put("/:id", isLoggedIn, async (req, res) => {
  try {
    const updateUser = await User.updateOne(
      { _id: req.params.id },
      {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      }
    )

    res.json(updateUser)
  } catch (e) {
    res.status(400).json({
      status: res.statusCode,
      message: e,
    })
  }
})

router.delete("/:id", isLoggedIn, async (req, res) => {
  try {
    const deleteUser = await User.deleteOne({ _id: req.params.id })
    res.json(deleteUser)
  } catch (e) {
    res.status(400).json({
      status: res.statusCode,
      message: e,
    })
  }
})

router.get("/register", (req, res) => {
  res.render(path.join(__dirname + "/../../client/sc_code/template_sbadmin/register.ejs"), { url: process.env.BASE_URL, error: req.flash("rerror") })
})

router.post("/register", async (req, res, next) => {
  let { error } = registerValidation(req.body)
  if (error) {
    req.flash("rerror", error.details[0].message)
    return res.redirect("/user/register")
  }
  passport.authenticate("register-local", function (err, user, info) {
    if (err) {
      req.flash("rerror", err)
      return res.redirect("/user/register")
    }
    req.logIn(user, function (err) {
      if (err) {
        req.flash("rerror", err)
        return res.redirect("/user/register")
      }
      return res.redirect("/docs")
    })
  })(req, res, next)
})

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/docs")
  res.render(path.join(__dirname + "/../../client/sc_code/template_sbadmin/login.ejs"), { url: process.env.BASE_URL, error: req.flash("lerror") })
})

router.post("/login", (req, res, next) => {
  let { error } = loginValidation(req.body)
  if (error) {
    req.flash("lerror", error.details[0].message)
    return res.redirect("/user/login")
  }
  passport.authenticate("login-local", function (err, user, info) {
    if (err) {
      req.flash("lerror", err)
      return res.redirect("/user/login")
    }
    if (!user) {
      req.flash("lerror", "Email anda belum terdaftar!")
      return res.redirect("/user/login")
    }
    req.logIn(user, function (err) {
      if (err) {
        req.flash("lerror", err)
        return res.redirect("/user/login")
      }
      return res.redirect("/docs")
    })
  })(req, res, next)
})

router.get("/logout", (req, res) => {
  req.logout()
  res.redirect("/")
})

router.get("/forgot", (req, res) => {
  res.render(path.join(__dirname + "/../../client/sc_code/template_sbadmin/forgot-password.ejs"), { url: process.env.BASE_URL })
})

module.exports = router
