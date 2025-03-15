/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "m6xsrfbsol9pq4y",
    "created": "2024-10-24 08:45:42.630Z",
    "updated": "2024-10-24 08:45:42.630Z",
    "name": "progress",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "aerdflnr",
        "name": "field",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "edyrxlgt",
        "name": "level",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 10,
          "noDecimal": true
        }
      },
      {
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
  const collection = dao.findCollectionByNameOrId("m6xsrfbsol9pq4y");

  return dao.deleteCollection(collection);
})
