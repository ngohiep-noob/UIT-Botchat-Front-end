async function UploadImageToGGDrive(file, filename) {
  // get parent folder id from localstorage
  const parentFolder = localStorage.getItem("parent_folder");

  // set file metadata
  var metadata = {
    name: filename,
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

async function AddSubjectExample(files, subjectName) {
  let formData = new FormData();
  
  for(let i in files) {
    formData.append('file', files[i])
  }
  
  let requestOptions = {
    headers: {
      "Content-Type": "multipart/form-data",
      "x-api-key": "fef094a9-c36a-42d8-85f5-eb26f340d756",
    },
  };

  const res = await axios.post(
    `${HOST_NAME}/api/v1/recognition/faces?subject=${subjectName}`,
    formData,
    requestOptions
  );
  
  if(res.data.subject === subjectName) {
    return {
      status: 'success',
      message: 'Add subject successfully!'
    }
  }else {
    return {
      status: 'error',
      message: res.data.message
    }
  }
}

async function HandleRegister(userInfo, images) {
  let { id, name } = userInfo;

  // let formData = new FormData();
  // formData.append("id", id);
  // formData.append('username', name)

  // // upload images to google drive
  // for (let i in images) {
  //   const res = await UploadImageToGGDrive(images[i], name + "_" + id + '.jpeg');
  //   if (res) {
  //     formData.append("img_link", "https://drive.google.com/uc?id=" + res.id);
  //   }
  //   console.log(res);
  // }

  // store student id and image urls
  // const upload_resp = await axios.post(
  //   "http://localhost:5000/upload",
  //   formData,
  //   {
  //     headers: {
  //       "Content-Type": "multipart/form-data",
  //     },
  //   }
  // );

  // return upload_resp.data;
  
  const subjectName = name + '_' + id;
  const res = await AddSubjectExample(images, subjectName);
  console.log('Trainning: ',res)
  return res
}

async function HandleRecognize() {
  let formdata = new FormData();
  formdata.append("file", IMAGES[0]);

  let requestOptions = {
    headers: {
      "Content-Type": "multipart/form-data",
      "x-api-key": "fef094a9-c36a-42d8-85f5-eb26f340d756",
    },
  };

  const res = await axios.post(
    `${HOST_NAME}/api/v1/recognition/recognize?prediction_count=3&limit=1`,
    formdata,
    requestOptions
  );
  return res.data.result[0].subjects;
}

function HandleCancelModalAndResetSession(e) {
  ShowToast("Notification", "Chờ 5s cho phiên tiếp theo!");
  ActionWithDelay(() => {
    ClearImageList();
    modalInfo.removeEventListener(
      "hide.bs.modal",
      HandleCancelModalAndResetSession
    );
  }, 5000);
}

async function HandleMakeNewFriendClick(event) {
  event.preventDefault();
  /**
   * InnerHTML of modal
   */
  let desc = document.createElement("h3");
  let inputGroup = document.createElement("div");

  desc.className = "text-center";
  desc.textContent = "Có vẻ mình chưa gặp nhau, mình làm quen nhé!";

  let idInput = document.createElement("input");
  let idLabel = document.createElement("label");
  idLabel.setAttribute("for", "new-user-id");
  idLabel.textContent = "Nhập mã số sinh viên: ";
  idInput.onchange = (e) => {
    NEW_ID = e.target.value;
  };
  idInput.id = "new-user-id";
  idInput.placeholder = "Mã số sinh viên(VD: 21520846)";

  let nameInput = document.createElement("input");
  let nameLabel = document.createElement("label");
  nameLabel.setAttribute("for", "new-user-name");
  nameLabel.textContent = "Nhập họ và tên đầy đủ: ";
  nameInput.onchange = (e) => {
    NEW_NAME = e.target.value;
  };
  nameInput.id = "new-user-name";
  nameInput.placeholder = "Họ và tên(VD: Ngô Đức Hoàng Hiệp)";
  
  inputGroup.classList.add(...["mb-3"]);
  nameLabel.className = idLabel.className = 'form-label';
  nameInput.className = idInput.className = 'form-control';
  nameInput.type = idInput.type = 'text';
  inputGroup.appendChild(nameLabel);
  inputGroup.appendChild(nameInput);
  inputGroup.appendChild(idLabel);
  inputGroup.appendChild(idInput);

  ActionWithDelay(() => {
    MODAL_INFO_BODY.innerHTML = "";
    MODAL_INFO_BODY.appendChild(desc);
    MODAL_INFO_BODY.appendChild(inputGroup);
    ShowModal(modalInfoTrigger, "Mình làm quen nhé!");
  }, 500);

  let submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.setAttribute("class", "btn btn-info");
  submitBtn.setAttribute("data-bs-dismiss", "modal");

  let modalFooter = document.querySelectorAll(".modal-footer")[1];
  submitBtn.addEventListener("click", async () => {
    /**
     * Submit user id and 3 images(upload to GG drive)
     */
    CANCEL_INFO_MODAL = false;
    if (IMAGES.length == NUMBER_OF_IMAGES && NEW_ID && NEW_NAME) {
      ShowSpinner();
      modalFooter.removeChild(modalFooter.firstChild);
      const res = await HandleRegister({ id: NEW_ID, name: NEW_NAME }, IMAGES);
      if (res) {
        HideSpinner();
        if (res.status === "success") {
          ShowToast(
            "Notification",
            "Đã làm quen bạn mới, Hãy thử lại nhận diện!"
          );
        } else {
          ShowToast("Notification", "Có lỗi xảy ra!");
        }

        ActionWithDelay(() => {
          ShowToast("Notification", "Chờ 5s cho phiên tiếp theo!");
        }, 6000);

        ActionWithDelay(() => {
          ClearImageList();
        }, 12000);
      }
    } else {
      if (IMAGES.length < NUMBER_OF_IMAGES) console.log("image missing");
      if (!NEW_ID) console.log("ID missing");
      if (!NEW_NAME) console.log("NAME missing");
    }
  });

  modalFooter.insertBefore(submitBtn, modalFooter.firstChild);
}

async function HandleGetUserInfoClick(event) {
  event.preventDefault();
  id = event.target.id;
  /**
   * Call api to get user detail information
   */
  ShowSpinner();
  MODAL_INFO_BODY.innerHTML = "";
  const resp = `<table class="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">First</th>
            <th scope="col">Last</th>
            <th scope="col">Handle</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td colspan="2">Larry the Bird</td>
            <td>@twitter</td>
          </tr>
        </tbody>
      </table>`;

  ActionWithDelay(() => {
    HideSpinner();
  }, 1000);

  ActionWithDelay(() => {
    ShowModal(modalInfoTrigger, "Thông tin của bạn", resp);
  }, 1000);
}

function RenderUserPrediction(info) {
  let modalBody = document.querySelector("#greeting-modal-body");
  if (modalBody.innerHTML === "") {
    let listGr = document.createElement("div");
    listGr.className = "list-group";
    listGr.id = "user-prediction";

    let listHeader = document.createElement("button");
    listHeader.classList.add(
      ...["list-group-item", "active", "text-center", "h3"]
    );
    listHeader.disabled = true;
    listHeader.textContent = "Tên của bạn là gì?";
    listGr.appendChild(listHeader);

    for (const i in info) {
      let prediction = document.createElement("button");
      prediction.classList.add(
        ...["list-group-item", "list-group-item-action"]
      );
      prediction.setAttribute("data-bs-dismiss", "modal");
      prediction.id = info[i].id;
      prediction.textContent = info[i].name;

      prediction.addEventListener("click", async (e) => {
        /**
         * Handle correct recognition
         */
        CANCEL_GREETING_MODAL = false;
        console.log('id:', e.target.id, 'is selected!')
        HandleGetUserInfoClick(e);
      });

      listGr.appendChild(prediction);
    }

    let denyBtn = document.createElement("button");
    denyBtn.classList.add(...["list-group-item", "list-group-item-action"]);
    denyBtn.textContent = "Không có tên của tôi.";
    denyBtn.addEventListener("click", (e) => {
      /**
       * Handle wrong recognition
       */
      CANCEL_GREETING_MODAL = false;
      HandleMakeNewFriendClick(e);
    });
    denyBtn.setAttribute("data-bs-dismiss", "modal");
    listGr.appendChild(denyBtn);

    modalBody.appendChild(listGr);
  }
}
