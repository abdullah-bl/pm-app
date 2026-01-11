/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2502820922")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_J8IrEkaqza` ON `budget_items` (`budget`)"
    ],
    "name": "budget_items"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2502820922")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_J8IrEkaqza` ON `budget_item` (`budget`)"
    ],
    "name": "budget_item"
  }, collection)

  return app.save(collection)
})
