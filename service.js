async function UploadImage(file, imgName) {
  // get parent folder id from localstorage
  const parentFolder = localStorage.getItem("parent_folder");

  // set file metadata
  var metadata = {
    name: imgName,
    mimeType: file.type,
    parents: [parentFolder],
  };
  var fd = new FormData();
  fd.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  fd.append("file", file);

  let res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + ACCESS_TOKEN,
      }),
      body: fd,
    }
  );
  return await res.json();
}

async function RefreshToken(ClientID, ClientSecret, refresh_token) {
  const body = {
    client_id: ClientID,
    client_secret: ClientSecret,
    refresh_token: refresh_token,
    grant_type: "refresh_token",
  };

  let formBody = [];
  for (const property in body) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(body[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");

  try {
    const resp = await fetch("https://www.googleapis.com/oauth2/v4/token", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      }),
      body: formBody,
    });
    let result = await resp.json();
    return result.access_token;
  } catch (error) {
    console.error("refresh token failed: ", error);
    return undefined;
  }
}

async function FindParentFolder() {
  let response;
  try {
    // console.log(gapi.client.drive)
    response = await gapi.client.drive.files.list({
      q: 'name = "BotChat Image"',
    });
  } catch (err) {
    console.error(err);
    return;
  }
  const files = response.result.files;
  if (!files || files.length == 0) {
    alert("No folder found.");
    return;
  }
  console.log(files);
  localStorage.setItem("parent_folder", files[0].id);
}

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

async function HandleRegister(id, images) {
    let formData = new FormData();
    formData.append("id", id);

    // upload images to google drive
    for(let i in images) {
      const res = await UploadImage(images[i], id + "_" + images[i].name)
      if(res) {
        formData.append('img_link', 'https://drive.google.com/uc?id=' + res.id)
      }
      console.log(res)
    }

    // store student id and image urls
    const upload_resp = await axios.post(
      "http://localhost:5000/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      }
    );

    return upload_resp.data
}