// create an express app
const express = require("express")
const app = express()
const path = require('path')

// use the express-static middleware
app.use(express.static("app"))

// define the first route
app.get("/", function (req, res) {
  return res.sendFile(path.join(__dirname, '/app', 'home-page.html'))
})


app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));