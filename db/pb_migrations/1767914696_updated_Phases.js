/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_666243485")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_EyF7tDV9x3` ON `phase` (`name`)"
    ],
    "name": "phase"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_666243485")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_EyF7tDV9x3` ON `Phases` (`name`)"
    ],
    "name": "Phases"
  }, collection)

  return app.save(collection)
})
