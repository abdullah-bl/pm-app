/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3825328000")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_Ky1rmvRHip` ON `transfers` (`from`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("relation3616002756")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3825328000")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_Ky1rmvRHip` ON `transfers` (\n  `from`,\n  `to`\n)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2502820922",
    "hidden": false,
    "id": "relation3616002756",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "to",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
