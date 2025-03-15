/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lj8fyprew502yru")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lodpc9p9",
    "name": "count",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lj8fyprew502yru")

  // remove
  collection.schema.removeField("lodpc9p9")

  return dao.saveCollection(collection)
})
