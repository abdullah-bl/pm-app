/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1155631669")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_1Ppbmi3THm` ON `budgets` (\n  `ref`,\n  `name`\n)"
    ],
    "name": "budgets"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1155631669")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_1Ppbmi3THm` ON `budget` (\n  `ref`,\n  `name`\n)"
    ],
    "name": "budget"
  }, collection)

  return app.save(collection)
})
