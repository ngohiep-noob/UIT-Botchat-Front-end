const axios = require("axios");
const md5 = require("md5");
const fs = require("fs");

module.exports = {
  GetTimeTable: async (id = "21520652", semester = 3, schYear = 2021) => {
    const key = "IL@_};uE7<hdJ!";
    //21520652
    const date = +new Date();
    let hashStr = md5(id + date + key);

    const data = JSON.stringify({
      time: date,
      hash: hashStr, //md5($uid . $time . $pkey)
      hocky: semester,
      namhoc: schYear,
      uid: id, // Mã Giảng viên hoặc Mã sinh viên
    });

    const config = {
      method: "post",
      url: "https://apiservice.uit.edu.vn/iot/att/tkb",
      headers: {
        "Content-Type": "application/json",
        Cookie:
          "SSESSbb01d9a0f90d4363b1d5ca1a35c4c20b=STF8Y9dg1pyopHOq6UjUoizcMpoWFt6BeaVRj8GPB6k",
      },
      data: data,
    };

    return await axios(config);  
  },
};
