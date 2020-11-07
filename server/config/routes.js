module.exports = app => {
  app.route("/users")
    .post(app.controllers.user.save)
    .get(app.controllers.user.index);
    
  app.route("/users/:id")
    .put(app.controllers.user.save)
    .get(app.controllers.user.show);

  app.route("/categories")
    .post(app.controllers.category.save)
    .get(app.controllers.category.index);

  app.route("/categories/tree")
    .get(app.controllers.category.getTree);

  app.route("/categories/:id")
    .put(app.controllers.category.save)
    .get(app.controllers.category.show)
    .delete(app.controllers.category.remove);

  app.route("/articles")
    .post(app.controllers.article.save)
    .get(app.controllers.article.index);

  app.route("/articles/:id")
    .put(app.controllers.article.save)
    .get(app.controllers.article.show)
    .delete(app.controllers.article.remove);

}