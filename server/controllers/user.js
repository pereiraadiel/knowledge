module.exports = app => {
  const save =  (req, res) =>{
    res.json({
      message: "user save called"
    })
  }

  return {
    save
  }
}