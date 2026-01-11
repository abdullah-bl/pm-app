/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3202395908")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_qnG03NGnVp` ON `projects` (`name`)"
    ],
    "name": "projects"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3202395908")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_qnG03NGnVp` ON `project` (`name`)"
    ],
    "name": "project"
  }, collection)

  return app.save(collection)
})
