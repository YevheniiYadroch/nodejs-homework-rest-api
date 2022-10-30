const express = require('express')

const { RequestError } = require("../../helpers")
const {User, signupSchema} = require("../../models/users")

const router = express.Router()

router.post('/signup', async (req, res, next) => {
  try {
    const { error } = signupSchema.validate(req.body)
    if (error) {
      throw RequestError(400, error.message)
      }
    const { email } = req.body
    const user = await User.findOne({ email })
     if (user) {
      throw RequestError(409, 'Email in use')
      }  
    const result = await User.create(req.body)
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

module.exports = router