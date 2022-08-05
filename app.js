const express = require("express")
const app = express()
const path = require('path')

app.use(express.static("app"))

app.get("/dev", function (req, res) {
  return res.sendFile(path.join(__dirname, '/app', 'home-page-dev.html'))
})

app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, '/app', 'home-page.html'))
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