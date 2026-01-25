/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3825328000")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_Ky1rmvRHip` ON `transfers` (\n  `from`,\n  `to`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3825328000")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_Ky1rmvRHip` ON `transfers` (`from`)"
    ]
  }, collection)

  return app.save(collection)
})
