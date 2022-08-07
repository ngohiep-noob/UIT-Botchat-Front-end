const express = require("express")
const app = express()
const path = require('path')
const {GetTimeTable} = require('./BE-Service/GetTimeTable')
app.use(express.static("app"))
app.use(express.json())

app.get("/dev", function (req, res) {
  return res.sendFile(path.join(__dirname, '/app', 'home-page-dev.html'))
})

app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, '/app', 'home-page.html'))
})

app.post('/time-table', (req, res, next) => {
  const {id, hocky, namhoc} = req.body;
  
  if(!id || !hocky || !namhoc) return res.json({
    status: 'error',
    message: 'missing information!'
  })

  GetTimeTable(id, hocky, namhoc)
  .then(resp => {
    return res.json(resp.data);
  })
  .catch(err => {
    return res.json(err);
  })
})

app.use((err, req, res, next) => {
  return res.json({
    status: 'error',
    message: err.message
  })
})

app.listen(process.env.PORT || 3000, 
	() => {
    console.log('server in running on http://localhost:3000')
});