/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2502820922")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number3145888567",
    "max": 2060,
    "min": 2025,
    "name": "year",
    "onlyInt": true,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2502820922")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number3145888567",
    "max": null,
    "min": 2025,
    "name": "year",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
