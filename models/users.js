const { model, Schema } = require('mongoose')
const Joi = require('joi')

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: String,
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
})

const signupSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const verifySchema = Joi.object({
  email: Joi.string().required(),
});

const User = model('user', userSchema)

module.exports = {
    User,
    signupSchema,
    verifySchema,
}