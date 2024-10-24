/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "lj8fyprew502yru",
    "created": "2024-10-24 08:40:39.030Z",
    "updated": "2024-10-24 08:40:39.030Z",
    "name": "store",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "mgdymqge",
        "name": "item",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("lj8fyprew502yru");

  return dao.deleteCollection(collection);
})
