/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_631030571")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_oLKFXOaPhg` ON `payments` (\n  `ref`,\n  `project`,\n  `status`,\n  `obligation`\n)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("relation917219000")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_631030571")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_oLKFXOaPhg` ON `payments` (\n  `ref`,\n  `budget`,\n  `obligation`,\n  `project`,\n  `status`\n)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1155631669",
    "hidden": false,
    "id": "relation917219000",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "budget",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
