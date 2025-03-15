/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("m6xsrfbsol9pq4y")

  collection.name = "runs"

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "5gtvhrn0",
    "name": "progress",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 100,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("m6xsrfbsol9pq4y")

  collection.name = "progress"

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "5gtvhrn0",
    "name": "completion",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 100,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
})
