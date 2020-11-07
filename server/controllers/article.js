module.exports = app => {
  const { existOrError, notExistOrError } = app.utils.validator;

  const save = async (req, res) => {
    const article = {... req.body};
    if(req.params.id) article.id = req.params.id;

    try {
      existOrError(article.name, "Titulo do artigo nao informado");
      existOrError(article.description, "Descrição do artigo nao informado");
      existOrError(article.categoryId, 
        "O artigo precisa estar associado a uma categoria");
      existOrError(article.userId, "O autor do artigo nao foi informado");
      existOrError(article.content, "Conteudo do artigo nao foi informado");
    }catch(msg){
      res.status(400).json({
        error: msg
      });
    }

    // temp
    article.imageUrl = "https://cdn.pixabay.com/photo/2018/02/28/01/01/willow-3186997_960_720.jpg"; 
    
    if(article.id){
      try {
      const articleSaved = await app.db('articles')
        .update(article)
        .where({id: article.id});
        try {
          existOrError(articleSaved, "Artigo não encontrado");
        }catch(msg){
          return res.status(400).json({
            error: msg
          });
        }
        res.status(204).send();
      }catch(err){ 
        res.status(500).json({
         error: "serviço indisponivel, tente novamente mais tarde"
        });
      }
    }
    else {
      app.db('articles')
        .insert(article)
        .then(_ => res.status(201).send(article))
        .catch(err => res.status(500).json({
          error: "serviço indisponivel, tente novamente mais tarde: "+err
        }));
    }
  }

  const remove = async (req, res) => {
    try {
      const rowsDeleted = await app.db('articles')
        .where({id: req.params.id})
        .del();
        try {
          existOrError(rowsDeleted, "Artigo nao encontrado");
        }
        catch(msg){
          return res.status(400).json({
            error: msg
          });
        }
        res.status(204).send();
    }catch(msg){
      res.status(500).json({
        error: "serviço indisponivel, tente novamente mais tarde"
      });
    } 
  }

  const articlesLimit = 10; // pagination

  const index = async (req, res) => {
    const page = req.query.page || 1;
    
    const result = await app.db('articles')
      .count('id')
      .first();
    const count = parseInt(result.count);

    app.db('articles')
      .select('id', 'name', 'description')
      .limit(articlesLimit)
      .offset(page * articlesLimit - articlesLimit)
      .then(articles => res.status(200).json({
        data: articles,
        count,
        limit: articlesLimit
      }))
      .catch(err => res.status(500).json({
        error: "serviço indisponivel, tente novamente mais tarde"
      }));
  }

  const show = async (req, res) => {
    try{
      const article = await app.db('articles')
        .where({id: req.params.id})
        .first();
      try {
        existOrError(article, "Artigo não encontrado");
      }
      catch(msg){
        return res.status(400).json({
          error: msg
        });
      }
      article.content = article.content.toString();
      res.status(200).json(article);
    }catch(err) {
      res.status(500).json({
        error: "serviço indisponivel, tente novamente mais tarde"
      });
    }
  }

  return { save, remove, index, show };
}