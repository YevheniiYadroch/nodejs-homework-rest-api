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
})

const signupSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const User = model('user', userSchema)

module.exports = {
    User,
    signupSchema
}