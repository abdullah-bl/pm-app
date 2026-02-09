/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1563197011")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_AqIjLya3jx` ON `bills` (`name`)",
      "CREATE INDEX `idx_j2jcrCNMF1` ON `bills` (`budget`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("relation19453029072")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1563197011")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_AqIjLya3jx` ON `bills` (`name`)",
      "CREATE INDEX `idx_j2jcrCNMF1` ON `bills` (`budget`)",
      "CREATE INDEX `idx_Wi0LdRRB0s` ON `bills` (`budget_new`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1155631669",
    "hidden": false,
    "id": "relation19453029072",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "budget_new",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
