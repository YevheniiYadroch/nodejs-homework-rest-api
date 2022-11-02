const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const gravatar = require('gravatar')
const fs = require('fs/promises')
const path = require('path')
const Jimp = require('jimp')
const nanoid = require('nanoid')

const { RequestError, sendMail } = require("../../helpers")
const authenticate = require('../../middlewares/authenticate')
const upload = require('../../middlewares/upload')
const { User, signupSchema, verifySchema } = require("../../models/users")
const { SECRET_KEY, BASE_URL } = process.env
const avatarsDir = path.join(__dirname, '../../', 'public', 'avatars')

const router = express.Router()

router.get('/current', authenticate, async (req, res) => {
  const { email, subscription } = req.user
  res.json({
    email,
    subscription
  })
})

router.get('/verify', async (req, res) => {
  const { error } = verifySchema.validate(req.body)
  if (error) {
    throw RequestError(400, {"message": "missing required field email"})
  }
  const { email } = req.body
  const user = User.findOne({ email })
  if (!user) {
    throw RequestError(400, 'Email not found')
  }
  if (user.verify) {
    throw RequestError(400, { message: "Verification has already been passed"})
  }
  const mail = {
      to: email,
      subject: 'Confirmation of registration',
      html: `<a target="_blamk" href="${BASE_URL}/users/verify/${user.verificationToken}">Press to confirm</a>`
  }
  await sendMail(mail)
  res.json({
      message: "Verification email sent"
  })
})

router.patch('/avatars', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const { _id } = req.user
    const { path: tempUpload, originalname } = req.file
    const extension = originalname.split('.').pop()
    const filename = `${_id}.${extension}`
    const resultUpload = path.join(avatarsDir, filename)
    await fs.rename(tempUpload, resultUpload)
    Jimp.read(resultUpload)
      .then(image => {
        image.resize(250, 250).write(resultUpload)
      })
      .catch(err => {
        throw err
      });
    const avatarURL = path.join('avatars', filename)
    await User.findByIdAndUpdate(_id, { avatarURL })
    res.json({
      avatarURL: avatarURL
    })
  } catch (error) {
     await fs.unlink(req.file.path)
  }
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
    const avatarURL = gravatar.url(email)
    const verificationToken = nanoid()
    const result = await User.create({ email, password: hashPass, avatarURL, verificationToken })
    const mail = {
      to: email,
      subject: 'Confirmation of registration',
      html: `<a target="_blamk" href="${BASE_URL}/users/verify/${verificationToken}">Press to confirm</a>`
    }
    await sendMail(mail)
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

router.get('/verify/:verificationToken', async (req, res, next) => {
  const { verificationToken } = req.params
  const user = User.findOne({ verificationToken })
  if (!user) {
    throw RequestError(404, 'User not found')
  }
  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" })
  res.json({
    message: 'Verification successful',
  })
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
    if (!user.verify) {
      throw RequestError(401, 'Email is not verified')
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