const bcrypt = require('bcrypt-nodejs');
const { use } = require('passport');

module.exports = app => {
  const { existOrError, notExistOrError, equalsOrError } = app.utils.validator;

  const encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  const save = async (req, res) =>{
    const user = {... req.body};
    if(req.params.id) user.id = req.params.id;

    try {
      existOrError(user.name, "Nome não informado!");
      existOrError(user.email, "E-mail não informado!");
      existOrError(user.password, "Senha não informada!");
      existOrError(user.confirmPassword, "Confirmação de senha não informada!");
      equalsOrError(user.password, user.confirmPassword, 
        "A senha e sua confirmação precisam ser iguais!");
      const userFromDB = await app.db('users')
        .where({email: user.email})
        .first();

      if(!user.id){
        notExistOrError(userFromDB, "E-mail já registrado para outro usuário!");
      }

    }catch(msg){
      console.log(msg)
      return res.status(400).json({
        error: msg
      });
    }

    user.password = encryptPassword(user.password);
    delete user.confirmPassword;

    if(user.id){
      app.db('users')
        .update(user)
        .where({id: user.id})
        .then(_ => res.status(204).send())
        .catch(err => res.status(500).send({
          error: "serviço indisponivel, tente novamente mais tarde"
        }));
    }else {
      app.db('users')
        .insert(user)
        .then(_ => res.status(201).json(user))
        .catch(err => res.status(500).send({
          error: "serviço indisponivel, tente novamente mais tarde"
        }));
    }
  }

  const index = (req, res) => {
    app.db('users')
      .select('id', 'name', 'email', 'admin')
      .then(users => res.status(200).json(users))
      .catch(err => res.status(500).send({
        error: "serviço indisponivel, tente novamente mais tarde"
      }));
  }

  const show = (req, res) => {
    app.db('users')
      .select('id', 'name', 'email', 'admin')
      .where({ id: req.params.id})
      .first()
      .then(users => res.status(200).json(users))
      .catch(err => res.status(500).send({
        error: "serviço indisponivel, tente novamente mais tarde: "
      }));
  }

  return {
    save,
    index,
    show
  }
}