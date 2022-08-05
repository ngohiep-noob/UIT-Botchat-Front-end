const modalGreeting = document.querySelector("#modal-panel");
let modalGreetingTrigger = new bootstrap.Modal(modalGreeting);
const modalTimeTab = document.querySelector('#time-table-modal')
let modalTimeTabTrigger = new bootstrap.Modal(modalTimeTab)

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
var CANCEL_TIME_TAB_MODAL = true;
var HOST_NAME = 'http://localhost:8000'
const emptyTable = document.querySelector('.modal-body-time-table').innerHTML

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

function ResetTimeTable() {
  let timeTabModalBody = document.querySelector('.modal-body-time-table');
  timeTabModalBody.innerHTML = emptyTable;
}

modalTimeTab.addEventListener('hidden.bs.modal', () => {
  ResetTimeTable();
  if(CANCEL_TIME_TAB_MODAL) {
    ResetSessionInTime(5);
  }
  CANCEL_TIME_TAB_MODAL = true
})

modalGreeting.addEventListener('hidden.bs.modal', (event) => {
  // console.log(CANCEL_GREETING_MODAL)
  MODAL_GREETING_BODY.innerHTML = '';
  if(CANCEL_GREETING_MODAL) {
    ResetSessionInTime(5);
  }
  CANCEL_GREETING_MODAL = true;
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

const newElement = (nameTag, innerText = "", Attributes = {}) => {
  let newElem = document.createElement(nameTag);
  for (const key in Attributes) {
    newElem.setAttribute(key, Attributes[key]);
  }
  newElem.innerText = innerText;
  return newElem;
};
