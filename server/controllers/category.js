module.exports = app => {
  const { existOrError, notExistOrError } = app.utils.validator;
  
  const save = (req, res) => {
    const category = { ... req.body};

    if(req.params.id) category.id = req.params.id;
    
    try {
      existOrError(category.name, "Nome da categoria nao informado!")
    }catch(msg){
      return res.status(400).json({error: msg})
    }

    if(category.id) {
      app.db('categories')
        .update(category)
        .where({id: category.id})
        .then( _ => res.status(204).send())
        .catch(err => res.status(500).json({
          error: "serviço indisponivel, tente novamente mais tarde"
        }))
    }
    else {
      app.db('categories')
        .insert(category)
        .then( _ => res.status(201).json(category))
        .catch(err => res.status(500).json({
          error: "serviço indisponivel, tente novamente mais tarde"
        }))
    }
  };

  const remove = async (req, res) => {
    try {
      existOrError(req.params.id, "Identificador de categoria nao informado")

      const subcategories = await app.db('categories')
        .where({ parentId: req.params.id })
      notExistOrError(subcategories, 
        "Você precisa desassociar as subcategorias dessa categoria antes")

      const articles = await app.db('articles')
        .where({categoryId: req.params.id})
      notExistOrError(articles, 
        "Você precisa transferir os artigos dessa categoria para outra categoria")
      
      const rowsDeleted = await app.db('categories')
        .where({id: req.params.id})
        .del()
      existOrError(rowsDeleted, "Categoria não encontrada")

      res.status(204).send()
    }
    catch(msg){
      res.status(400).json({
        error: msg
      })
    }
  };

  const withPath = (categories) => {
    const getParent = (categories, parentId) => {
      let parents = categories.filter(parent => parent.id === parentId);
      return parents.length ? parents[0] : null;
    }

    const categoriesWithPath = categories.map(category => {
      let path = category.name;
      let parent = getParent(categories, category.parentId);
      
      while(parent){
        path = `${parent.name} > ${path}`;
        parent = getParent(categories, parent.parentId);
      }

      return { ...category, path };
    });

    categoriesWithPath.sort( (categoryA,categoryB) => {
      if(categoryA.path < categoryB.path) return -1;
      if(categoryA.path > categoryB.path) return 1;
      else return 0;
    });

    return categoriesWithPath;
  };

  const index = (req, res) => {
    app.db('categories')
      .then(categories => res.status(200).json(withPath(categories)))
      .catch(err => res.status(500).json({
        error: "serviço indisponivel, tente novamente mais tarde"
      }));
  };

  const show = (req, res) => {
    try {
      existOrError(req.params.id, "Identificador da categoria nao informado!")
    }catch(msg){
      res.status(400).json({
        error: msg
      });
    }
    app.db('categories')
      .where({id: req.params.id})
      .first()
      .then(category => res.status(200).json({category}))
      .catch(err => res.status(500).json({
        error: "serviço indisponivel, tente novamente mais tarde"
      }));
  };

  const toTree = (categories, tree) => {
    if(!tree) tree = categories.filter(category => !category.parentId);
    tree = tree.map(parentNode => {
      const isChild = node => node.parentId == parentNode.id;
      parentNode.children = toTree(categories, categories.filter(isChild));
      return parentNode;
    });
    return tree;
  };

  const getTree =  (req, res) => {
    app.db('categories')
      .then(categories => res.status(200).json( toTree( withPath(categories) ) ));
  }

  return { save, remove, index, show, getTree }
}