const modalGreeting = document.querySelector("#modal-panel");
let modalGreetingTrigger = new bootstrap.Modal(modalGreeting);
const modalInfo = document.querySelector('#info-modal')
let modalInfoTrigger = new bootstrap.Modal(modalInfo)
const spinnerLoading = document.querySelector("#backdrop");
const toastLive = document.getElementById("liveToast");
const toast = new bootstrap.Toast(toastLive);

// Global variable
var IN_PROCESS = false;
var MODAL_GREETING_BODY = document.querySelector('#greeting-modal-body');
var MODAL_INFO_BODY = document.querySelector('#info-modal-body');
var IMAGES = [];
var NUMBER_OF_IMAGES = 1;
var NEW_ID = '';
var NEW_NAME = ''
var CANCEL_GREETING_MODAL = true;
var CANCEL_INFO_MODAL = true;
var HOST_NAME = 'http://localhost:8000'

function ClearImageList(processing = false) {
  console.log('clear images')
  console.log('reset session!')
  IMAGES = []
  IN_PROCESS = processing;
}

function AddImageToList(img) {
  console.log('add image ' + (IMAGES.length + 1))
  IMAGES.push(img)
}

function ShowModal(modal, title = "This is modal title", innerHTML) {
  if(innerHTML)
    MODAL_INFO_BODY.innerHTML = innerHTML
  if(modal === modalGreetingTrigger) 
    document.querySelectorAll(".modal-title")[0].textContent = title;
  else 
    document.querySelectorAll(".modal-title")[1].textContent = title;

  modal.show();
}

function HideModal(modal) {
  modal.hide()
}

function ResetSessionInTime(sec = 5) {
  ShowToast('Notification', `Chờ ${sec}s cho phiên tiếp theo!`, true)
  ActionWithDelay(() => {
    ClearImageList()
  }, sec * 1000)
}

modalGreeting.addEventListener('hidden.bs.modal', (event) => {
  // console.log(CANCEL_GREETING_MODAL)
  MODAL_GREETING_BODY.innerHTML = '';
  if(CANCEL_GREETING_MODAL) {
    ResetSessionInTime(5);
  }
  CANCEL_GREETING_MODAL = true;
})

modalInfo.addEventListener('hidden.bs.modal', (e) => {
  MODAL_INFO_BODY.innerHTML = '';
  if(CANCEL_INFO_MODAL) {
    ResetSessionInTime(5);
  }
  CANCEL_INFO_MODAL = true
})

function ShowSpinner() {
  spinnerLoading.style.display = "block";
}

function HideSpinner() {
  spinnerLoading.style.display = "none";
}

function ShowToast(title, message, important = false, type = 'info') {
  const icon = document.getElementById('toast-icon')
  if(type === 'info') {
    icon.src = './info-icon.png'
  }
  if(type === 'error') {
    icon.src = './error-icon.png'
  }
  if(!toast.isShown() || important) {
    let header = document.querySelector(".toast-title");
    header.textContent = title;
    let body = document.querySelector(".toast-body");
    body.textContent = message;
    toast.show();
  }
}

function ActionWithDelay(callback, time = 5000) {
  setTimeout(callback, time)
}

