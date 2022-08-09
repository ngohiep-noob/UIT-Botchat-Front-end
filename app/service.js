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

async function TotalFacesOfSubject(subjectName) {
  let requestOptions = {
    headers: {
      "Content-Type": "multipart/form-data",
      "x-api-key": "fef094a9-c36a-42d8-85f5-eb26f340d756",
    },
  };

  const res = await axios.get(
    `${HOST_NAME}/api/v1/recognition/faces?subject=${subjectName}`,
    requestOptions
  );

  return Promise.resolve(res.data.faces.length);
}

async function AddSubjectExample(images, subjectName) {
  let formData = new FormData();

  for (const image of images) {
    formData.append("file", image);
  }

  let requestOptions = {
    headers: {
      "Content-Type": "multipart/form-data",
      "x-api-key": "fef094a9-c36a-42d8-85f5-eb26f340d756",
    },
  };
  const faces = await TotalFacesOfSubject(subjectName);
  if (faces < 3) {
    const res = await axios.post(
      `${HOST_NAME}/api/v1/recognition/faces?subject=${subjectName}`,
      formData,
      requestOptions
    );

    if (res.data.subject === subjectName) {
      if (faces > 0) {
        return {
          status: "success",
          message: `a face added!, there are ${
            faces + 1
          } faces for subject: ${subjectName}`,
        };
      }
      return {
        status: "success",
        message: "Add subject successfully!",
      };
    } else {
      return {
        status: "error",
        message: res.data.message,
      };
    }
  } else {
    return {
      status: "success",
      message: `subject has already had 3 examples!!!`,
    };
  }
}

/**
 * add new face to trainning
 */
async function HandleRegister(userInfo, images) {
  let { id, name } = userInfo;
  const subjectName = name + "_" + id;
  const res = await AddSubjectExample(images, subjectName);
  console.log("Trainning: ", res);
  return res;
}

/**
 * Call api to recognize
 */
async function HandleRecognize() {
  let formdata = new FormData();

  formdata.append("file", IMAGES[0]);

  let requestOptions = {
    headers: {
      "Content-Type": "multipart/form-data",
      "x-api-key": "fef094a9-c36a-42d8-85f5-eb26f340d756",
    },
  };

  try {
    const predictionCount = 9;
    const res = await axios.post(
      `${HOST_NAME}/api/v1/recognition/recognize?prediction_count=${predictionCount}&limit=1`,
      formdata,
      requestOptions
    );
    const listRes = res.data.result[0].subjects;
    let finalList = [];
    for (const i of listRes) {
      if (finalList.length < 3) {
        let existed = false;
        for (const s of finalList) {
          if (i.subject === s.subject) {
            existed = true;
            break;
          }
        }
        if (!existed) finalList.push(i);
      } else break;
    }

    return Promise.resolve({
      status: "OK",
      data: finalList,
    });
  } catch (resErr) {
    if (resErr.response.data.code === 28) {
      console.log("error: ", resErr.response.data.message);
      return Promise.reject({
        status: "fail",
        message: "Không phát hiện gương mặt, Hãy thử lại!",
      });
    }
  }
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

/**
 * Unknown user
 */
async function HandleMakeNewFriendClick(event) {
  event.preventDefault();
  
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
  nameLabel.className = idLabel.className = "form-label";
  nameInput.className = idInput.className = "form-control";
  nameInput.type = idInput.type = "text";
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
    CANCEL_TIME_TAB_MODAL = false;
    if (IMAGES.length == NUMBER_OF_IMAGES && NEW_ID && NEW_NAME) {
      ShowSpinner();
      modalFooter.removeChild(modalFooter.firstChild);
      const res = await HandleRegister({ id: NEW_ID, name: NEW_NAME }, IMAGES);
      if (res) {
        HideSpinner();
        if (res.status === "success") {
          ShowToast("Notification", "Đã làm quen bạn mới, Hãy thử lại!");
        } else {
          ShowToast("Notification", "Có lỗi xảy ra!", false,'error');
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


function AddEmptyCellInCol(tabRows, beg, end) {
  for (let i = beg; i <= end; i++) {
    const empCell = document.createElement("td");
    tabRows[i].appendChild(empCell);
  }
}

/**
 * Render time schedule into empty table
 */
function RenderSchedule(schedule) {
  let tabRows = document.querySelectorAll(".tiethoc");
  for (const day in schedule) {
    // loop day by day
    const data = schedule[day];

    if (data.length === 0) {
      AddEmptyCellInCol(tabRows, 0, 9);
    } else {
      let emptyIndex = 0;
      for (const lesson of data) {
        // every lesson in a day
        const { tiet, online, phonghoc, dadk, ngonngu, malop} = lesson;
        const tenmh = lessonCode[malop.split('.')[0]];
        const tietBD = Number(tiet.split("-")[0]) - 1,
          tietKT = Number(tiet.split("-")[1]) - 1;

        AddEmptyCellInCol(tabRows, emptyIndex, tietBD - 1);
        let beginCell = document.createElement("td");
        beginCell.className = "text-center table-active border-white align-middle";
        beginCell.setAttribute("rowspan", tietKT - tietBD + 1);
        [
            newElement('h6', `${malop} - ${ngonngu}`),
            newElement('p', `${tenmh}`),
            newElement('p', `Phòng học: ${phonghoc}`),
            newElement('p', `Sỉ số: ${dadk}`),
            newElement('p', `Hình thức: ${online === '1' ? 'online' : 'offline'}`),
        ].forEach(child => beginCell.appendChild(child));
        tabRows[tietBD].appendChild(beginCell);
        emptyIndex = tietKT + 1;
      }

      AddEmptyCellInCol(tabRows, emptyIndex, 9); // add space until the last period in day
    }
  }
}

// call api to get table time
async function GetTimeTable(id) {
  const body = {
    id, 
    hocky: 3,
    namhoc: 2021
  }
  ShowSpinner();
  fetch(`http://localhost:3000/time-table`, {
    method: "POST",
    headers: {
      "Content-Type" : "application/json"
    }, 
    body: JSON.stringify(body)
  })
  .then(res => res.json())
  .then(res => {
    const data = res.data;
    console.log('res:', data)
    const schedule = {
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    };
    console.log(data)
    data.forEach((e) => schedule[e.thu].push(e));
    console.log('schedule', schedule)
    RenderSchedule(schedule);
    HideSpinner();
    modalTimeTabTrigger.show();
  })
  .catch(err => {
    console.error(err);
    ResetTimeTable();
    HideSpinner();
    modalTimeTabTrigger.show();
  })

}

/**
 * Render user detail information
 */
async function HandleGetUserInfoClick(event) {
  event.preventDefault();
  id = event.target.id;
  GetTimeTable(id);
}

/**
 * User predictions
 */
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
        console.log("id:", e.target.id, "is selected!");
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
