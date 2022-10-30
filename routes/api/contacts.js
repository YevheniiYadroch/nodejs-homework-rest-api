const express = require('express')
const Joi = require('joi')

const Book = require("../../models/contacts")
const { RequestError } = require("../../helpers")
const isValidId = require("../../middlewares/isValidId")
const authenticate = require("../../middlewares/authenticate")
const router = express.Router()

const addSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string(),
  phone: Joi.string(),
  favorite: Joi.boolean().default(false)
});

const updateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
  favorite: Joi.boolean()
})

const updateFavorireSchema = Joi.object({
  favorite: Joi.boolean().required()
})

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { _id: owner } = req.user
    const result = await Book.find({owner})
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/:contactId', authenticate, isValidId, async (req, res, next) => {
  try {
    const {contactId} = req.params
    const result = await Book.findById(contactId)
    if (!result) {
      throw RequestError(404, "Not found")
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { error } = addSchema.validate(req.body)
    if (error) {
      throw RequestError(400, error.message)
    }
    const { _id: owner } = req.user
    const result = await Book.create({...req.body, owner})
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

router.delete('/:contactId', authenticate, isValidId, async (req, res, next) => {
  try {
    const {contactId} = req.params
    const result = await Book.findByIdAndRemove(contactId)
    if (!result) {
      throw RequestError(404, "Not found")
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.put('/:contactId', authenticate, isValidId, async (req, res, next) => {
  try {
    const {contactId} = req.params
    const { error } = updateSchema.validate(req.body)
    if (error) {
      throw RequestError(400, error.message)
    }
    const result = await Book.findByIdAndUpdate(contactId, req.body, {new: true})
    if (!result) {
      throw RequestError(404, "Not found")
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.patch('/:contactId/favorite', authenticate, isValidId, async (req, res, next) => {
  try {
    const {contactId} = req.params
    const { error } = updateFavorireSchema.validate(req.body)
    if (error) {
      throw RequestError(400, error.message)
    }
    const result = await Book.findByIdAndUpdate(contactId, req.body, {new: true})
    if (!result) {
      throw RequestError(404, "Not found")
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
})

module.exports = router
