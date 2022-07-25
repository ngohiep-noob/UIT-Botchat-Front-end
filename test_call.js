var axios = require('axios');
var md5 = require('md5')

var key = "IL@_};uE7<hdJ!";
var magv = '80375'
var date = Date.now()
let hashStr = md5(magv + date + key)

var data = JSON.stringify({
  "time": date, 
  "hash": hashStr,
  "magv": magv
});

var config = {
  method: 'post',
  url: 'https://apiservice.uit.edu.vn/iot/att/ttgv',
  headers: { 
    'Content-Type': 'application/json', 
    'Cookie': 'SSESSbb01d9a0f90d4363b1d5ca1a35c4c20b=cCrJFEqz3MXpdE7IRn66AtXBT_w82wkdLLbIqwsyLiA'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(response.data);
})
.catch(function (error) {
  console.log(error);
});