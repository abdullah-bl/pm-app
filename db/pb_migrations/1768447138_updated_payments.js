/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_631030571")

  // update field
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

  // update field
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

  // update field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1317492651",
    "hidden": false,
    "id": "relation3752200791",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "obligation",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3202395908",
    "hidden": false,
    "id": "relation376250268",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "project",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_631030571")

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1155631669",
    "hidden": false,
    "id": "relation917219000",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "budget_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1563197011",
    "hidden": false,
    "id": "relation445387509",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "bill_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1317492651",
    "hidden": false,
    "id": "relation3752200791",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "obligation_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3202395908",
    "hidden": false,
    "id": "relation376250268",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "project_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
