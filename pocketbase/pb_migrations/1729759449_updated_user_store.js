/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qfsafgimls3rsc4")

  collection.name = "user_items"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qfsafgimls3rsc4")

  collection.name = "user_store"

  return dao.saveCollection(collection)
})
