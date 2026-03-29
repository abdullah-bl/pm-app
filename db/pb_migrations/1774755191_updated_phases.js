/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_666243485")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select3605264550",
    "maxSelect": 1,
    "name": "track",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "workflow",
      "outcome"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_666243485")

  // remove field
  collection.fields.removeById("select3605264550")

  return app.save(collection)
})
