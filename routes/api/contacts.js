const express = require('express')
const Joi = require('joi')

const Book = require("../../models/contacts")
const {RequestError} = require("../../helpers")
const router = express.Router()

const addSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string(),
  phone: Joi.string(),
  favorite: Joi.boolean().default(false)
})

// const updateSchema = Joi.object({
//   name: Joi.string(),
//   email: Joi.string(),
//   phone: Joi.string(),
// })

// router.get('/', async (req, res, next) => {
//   try {
//     const result = await contacts.listContacts()
//     res.json(result)
//   } catch (error) {
//     next(error)
//   }
  
// })

// router.get('/:contactId', async (req, res, next) => {
//   try {
//     const {contactId} = req.params
//     const result = await contacts.getContactById(contactId)
//     if (!result) {
//       throw RequestError(404, "Not found")
//     }
//     res.json(result)
//   } catch (error) {
//     next(error)
//   }
// })

router.post('/', async (req, res, next) => {
  try {
    const { error } = addSchema.validate(req.body)
    if (error) {
      throw RequestError(400, error.message)
    }
    const result = await Book.create(req.body)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

// router.delete('/:contactId', async (req, res, next) => {
//   try {
//     const {contactId} = req.params
//     const result = await contacts.removeContact(contactId)
//     if (!result) {
//       throw RequestError(404, "Not found")
//     }
//     res.json(result)
//   } catch (error) {
//     next(error)
//   }
// })

// router.put('/:contactId', async (req, res, next) => {
//   try {
//     const {contactId} = req.params
//     const { error } = updateSchema.validate(req.body)
//     if (error) {
//       throw RequestError(400, error.message)
//     }
//     const result = await contacts.updateContact(contactId, req.body)
//     if (!result) {
//       throw RequestError(404, "Not found")
//     }
//     res.json(result)
//   } catch (error) {
//     next(error)
//   }
// })

module.exports = router
