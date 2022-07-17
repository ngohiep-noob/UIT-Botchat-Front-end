const modal = document.querySelector("#modal-panel");
let modalTrigger = new bootstrap.Modal(modal);
const spinnerLoading = document.querySelector("#backdrop");
const toastLive = document.getElementById('liveToast')
const toast = new bootstrap.Toast(toastLive)

var IMAGES = []

document.addEventListener("DOMContentLoaded", () => {});

function TriggerModal(title = "This is modal title", innerHTML) {
  if (innerHTML !== undefined)
    document.querySelector(".modal-body").innerHTML = innerHTML;
  document.querySelector(".modal-title").textContent = title;
  modalTrigger.show();
}

function ShowSpinner() {
  spinnerLoading.style.display = "block";
}

function HideSpinner() {
  spinnerLoading.style.display = "none";
}

function ShowToast(title, message) {
    let header = document.querySelector('.toast-title')
    header.textContent = title
    let body = document.querySelector('.toast-body')
    body.textContent = message
    toast.show()
}

function RenderUserPrediction(info) {
  let modalBody = document.querySelector(".modal-body");
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
    prediction.classList.add(...["list-group-item", "list-group-item-action"]);
    prediction.setAttribute("data-bs-dismiss", "modal");
    prediction.id = info[i].id;
    prediction.textContent = info[i].name;
    prediction.addEventListener("click", async (e) => {
      e.preventDefault();
      id = e.target.id;
      /**
       * Call api to get user detail information
       */

      ShowSpinner();
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

      setTimeout(() => {
        HideSpinner();
      }, 1000);

      setTimeout(() => {
        TriggerModal("Thông tin của bạn", resp);
      }, 1000);
    });

    listGr.appendChild(prediction);
  }
  let denyBtn = document.createElement("button");
  denyBtn.classList.add(...["list-group-item", "list-group-item-action"]);
  denyBtn.textContent = "Không có tên của tôi.";
  denyBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const modelInnerHTML = `<h3 class='text-center'>Có vẻ mình chưa gặp nhau, mình làm quen nhé!<h3></br>
        <div class="input-group mb-3">
        <input type="text" id="student-id" class="form-control" placeholder="Nhập mã số sinh viên" aria-label="Recipient's username" aria-describedby="button-addon2">
        </div>
    `;

    ShowSpinner();

    setTimeout(() => {
        HideSpinner();
    }, 1000);

    setTimeout(() => {
        TriggerModal("Mình làm quen nhé!", modelInnerHTML);
    }, 1000);

    let submitBtn = document.createElement("button");
    submitBtn.textContent = 'Submit';
    submitBtn.setAttribute('class', 'btn btn-info')
    submitBtn.setAttribute("data-bs-dismiss", "modal")
    submitBtn.addEventListener('click', async() => {
        id = document.getElementById('student-id').value

        ShowSpinner();
        const res = await HandleRegister(id, IMAGES)
        modalFooter.removeChild(modalFooter.firstChild)
        if(res) {
            HideSpinner()
            console.log(res)
            if(res.status === 'success') {
                ShowToast('Notification', 'Đã làm quen bạn mới!')
            } else {
                ShowToast('Notification', 'Có lỗi xảy ra!')
            }
        }
    })
    let modalFooter = document.querySelector('.modal-footer')
    modalFooter.insertBefore(submitBtn, modalFooter.firstChild)
});
  denyBtn.setAttribute("data-bs-dismiss", "modal");
  listGr.appendChild(denyBtn);

  modalBody.appendChild(listGr);
}


