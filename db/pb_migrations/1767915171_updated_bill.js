/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1563197011")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_AqIjLya3jx` ON `bills` (`name`)",
      "CREATE INDEX `idx_j2jcrCNMF1` ON `bills` (`budget`)"
    ],
    "name": "bills"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1563197011")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_AqIjLya3jx` ON `bill` (`name`)",
      "CREATE INDEX `idx_j2jcrCNMF1` ON `bill` (`budget`)"
    ],
    "name": "bill"
  }, collection)

  return app.save(collection)
})
