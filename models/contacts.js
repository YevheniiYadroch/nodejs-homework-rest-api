const fs = require("fs").promises
const path = require("path")
const {nanoid} = require("nanoid")

const contactsPath = path.join("models", "contacts.json")

async function listContacts() {
    const result = await fs.readFile(contactsPath, "utf-8")
    return JSON.parse(result)
}
const getContactById = async (contactId) => {
    const list = await listContacts()
    const queryItem = list.find(item => item.id === contactId)
    return queryItem || null
}

const removeContact = async (contactId) => {
  const list = await listContacts()
    const index = list.findIndex(item => item.id === contactId)
    
    if (index === -1) {
        return null
    }
    
    list.splice(index, 1)

    await fs.writeFile(contactsPath, JSON.stringify(list, null, 2))

    return {"message": "contact deleted"}
}

const updateContact = async (contactId, body) => {
  const list = await listContacts()
    const index = list.findIndex(item => item.id === contactId)
    
    if (index === -1) {
        return null
    }
    
    list[index] = {...list[index], ...body}

    await fs.writeFile(contactsPath, JSON.stringify(list, null, 2))

    return list[index]
}

const addContact = async ({name, email, phone}) => {
    const list = await listContacts()
    const id = nanoid()
    const newContact = { id, name, email, phone }
    list.push(newContact)

    await fs.writeFile(contactsPath, JSON.stringify(list, null, 2))
    return newContact
}


module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
