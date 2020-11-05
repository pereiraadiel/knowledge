module.exports = app => {
  app.route("/users")
    .post(app.controllers.user.save)
    .get(app.controllers.user.index);
}