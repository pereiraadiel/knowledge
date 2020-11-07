module.exports = app => {
  function existOrError(value, msg) {
    if(!value) throw msg;
    if(Array.isArray(value) && value.length === 0) throw msg;
    if(typeof value === 'string' && !value.trim()) throw msg;
  }
  
  function notExistOrError(value, msg) {
    try {
      existOrError(value, msg)
    }catch(msg){ // se der erro é pq n existe
      return;
    }
    throw msg; // se chegar aqui é pq existe
  }
  
  function equalsOrError (valueA, valueB, msg){
    if(valueA !== valueB) throw msg;
  }
  
  return {
    existOrError,
    notExistOrError,
    equalsOrError
  };
}