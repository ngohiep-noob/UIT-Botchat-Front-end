var axios = require('axios');
var md5 = require('md5')
var fs = require('fs')

var key = "IL@_};uE7<hdJ!";
var uid = '21520652' //21520846
var date = Date.now()
let hashStr = md5(uid + date + key)

var data = JSON.stringify({
  "time": date,
  "hash": hashStr, //md5($uid . $time . $pkey)
  "hocky": 3,
  "namhoc": 2021,
  "uid": uid // Mã Giảng viên hoặc Mã sinh viên
});

var config = {
  method: 'post',
  url: 'https://apiservice.uit.edu.vn/iot/att/tkb',
  headers: { 
    'Content-Type': 'application/json', 
    'Cookie': 'SSESSbb01d9a0f90d4363b1d5ca1a35c4c20b=STF8Y9dg1pyopHOq6UjUoizcMpoWFt6BeaVRj8GPB6k'
  },
  data : data
};

axios(config)
.then(res => {
  console.log(res.data)
  fs.writeFileSync('./time-table/logs.json', JSON.stringify(res.data))
})
.catch(function (error) {
  console.log(error);
});