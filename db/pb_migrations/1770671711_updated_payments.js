/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_631030571")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_oLKFXOaPhg` ON `payments` (\n  `ref`,\n  `budget`,\n  `obligation`,\n  `project`,\n  `status`\n)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("relation445387509")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "planned",
      "pending",
      "paid"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_631030571")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1563197011",
    "hidden": false,
    "id": "relation445387509",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "bill",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("select2063623452")

  return app.save(collection)
})
