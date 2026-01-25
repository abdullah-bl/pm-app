/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3825328000")

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1155631669",
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3825328000")

  // remove field
  collection.fields.removeById("relation3616002756")

  return app.save(collection)
})
