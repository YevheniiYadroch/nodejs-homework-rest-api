const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const gravatar = require('gravatar')

const { RequestError } = require("../../helpers")
const authenticate = require('../../middlewares/authenticate')
const { User, signupSchema } = require("../../models/users")
const {SECRET_KEY} = process.env

const router = express.Router()

router.get('/current', authenticate, async (req, res) => {
  const { email, subscription } = req.user
  res.json({
    email,
    subscription
  })
})

router.get('/logout', authenticate, async (req, res) => {
  const { _id } = req.user
  await User.findByIdAndUpdate(_id, { token: null })
  res.status(204).send()
})

router.post('/signup', async (req, res, next) => {
  try {
    const { error } = signupSchema.validate(req.body)
    if (error) {
      throw RequestError(400, error.message)
      }
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user) {
      throw RequestError(409, 'Email in use')
      }
    const hashPass = await bcrypt.hash(password, 10)
    const avatarUrl = gravatar.url(email)
    console.log(avatarUrl)
    const result = await User.create({ email, password: hashPass, avatarUrl})
    res.status(201).json({
        "user": {
        "email": result.email,
        "subscription": result.subscription
        }
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
    try {
    const { error } = signupSchema.validate(req.body)
    if (error) {
      throw RequestError(400, error.message)
      }
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      throw RequestError(401, 'Email or password is wrong')
      }
    const passCompare = await bcrypt.compare(password, user.password)
    if (!passCompare) {
      throw RequestError(401, 'Email or password is wrong')
        }
    const payload = {
        id: user._id
    }
    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: '1h'})
    const result = await User.findByIdAndUpdate(user._id, {"token": token}, {new: true})
    res.status(200).json({
        "token": result.token,
        "user": {
        "email": result.email,
        "subscription": result.subscription
        },
    })
  } catch (error) {
    next(error)
  }
})



module.exports = router