/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1317492651")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_0DRwPi5vSb` ON `obligations` (\n  `budget`,\n  `project`\n)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("relation445387509")

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1579384326",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1317492651")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_0DRwPi5vSb` ON `obligations` (\n  `budget`,\n  `project`,\n  `bill`\n)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(8, new Field({
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
  collection.fields.removeById("text1579384326")

  return app.save(collection)
})
