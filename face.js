const video1 = document.getElementsByClassName("input_video1")[0];
const out1 = document.getElementsByClassName("output1")[0];
const img = document.getElementById("img");
const controlsElement1 = document.getElementsByClassName("control1")[0];
const canvasOut1 = out1.getContext("2d");
const canvasImgCrop = img.getContext("2d");
const fpsControl = new FPS();
const stopBtn = document.getElementById("stop-btn");
const mainBox = document.getElementById("main-box");
const ACCESS_TOKEN =
  "ya29.A0AVA9y1tYUkqA9JJ-Hd_I6ndXE5mQQkXWNSBO-yHXUAP8cpvG4netBlkaDenubJyBLlqQI_msUXPLuvaX2M_CPzhyUcArNyuA8CQ1XOP-lOCxGRtXZhO1k18iNEEXOpG1xv7hKn3uFcvUHPo-MURH3pR_aaxNYUNnWUtBVEFTQVRBU0ZRRTY1ZHI4bjRiOW9mbGlaWWhxbVFacHJsaEx0QQ0163";
const spinner = document.querySelector(".loading");
spinner.ontransitionend = () => {
  spinner.style.display = "none";
};

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

let state = 1; // 0 - waiting, 1 - ready
let time = 0;
let files = []
async function onResultsFace(results) {
  document.body.classList.add("loaded");
  fpsControl.tick();
  // canvasOut1.save();
  // canvasOut1.clearRect(0, 0, out1.width, out1.height);
  // canvasOut1.drawImage(results.image, 0, 0, out1.width, out1.height);

  if (results.detections.length > 0) {
    const size = 480;
    const sHeight = results.detections[0].boundingBox["height"] * size;
    const sWidth = results.detections[0].boundingBox["width"] * size;
    const sx = results.detections[0].boundingBox["xCenter"] * size;
    const sy = results.detections[0].boundingBox["yCenter"] * size;

    // drawRectangle(canvasOut1, results.detections[0].boundingBox, {
    //   color: "green",
    //   lineWidth: 4,
    //   fillColor: "#00000000",
    // });

    // drawLandmarks(canvasOut1, results.detections[0].landmarks, {
    //   color: "white",
    //   radius: 5,
    // });

    if (time < 3) {
      if (state != 0) {
        state = 0;
        setTimeout(() => {
          // const imgBase64 = img
          //         .toDataURL("image/jpeg")
          //         .replace(/^data:image\/jpeg;base64,/, "");
          canvasImgCrop.drawImage(
            results.image,
            sx - sWidth / 2 - 30,
            sy - sHeight / 2 - 70,
            sWidth + 70,
            sHeight + 80,
            0,
            0,
            img.width,
            img.height
          );

          let file = dataURLtoFile(img.toDataURL("image/jpeg"), `${time}.jpg`);
          files.push(file)
          state = 1;
          time++;
        }, 2000);
      }
    } else {
      var id = prompt("Enter your id: ")
      let formData = new FormData();
      formData.append("id", id);
      
      for(let i in files) {  
        const res = await UploadImage(files[i], id + " - " + files[i].name)
        if(res) {
          formData.append('img_link', 'https://drive.google.com/uc?id=' + res.id)
        }
        console.log(res)
      }

      const upload_resp = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        }
      );
      console.log(upload_resp)

      faceDetection.onResults(() => {
        console.log('finished face detection!')
      })
    }
  }
  canvasOut1.restore();
}

const faceDetection = new FaceDetection({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.0/${file}`;
  },
});

faceDetection.onResults(onResultsFace);

const camera = new Camera(video1, {
  onFrame: async () => {
    await faceDetection.send({ image: video1 });
  },
  width: 480,
  height: 480,
});
camera.start();

new ControlPanel(controlsElement1, {
  selfieMode: true,
  minDetectionConfidence: 0.5,
})
  .add([
    new StaticText({ title: "MediaPipe Face Detection" }),
    fpsControl,
    new Toggle({ title: "Selfie Mode", field: "selfieMode" }),
    new Slider({
      title: "Min Detection Confidence",
      field: "minDetectionConfidence",
      range: [0, 1],
      step: 0.01,
    }),
  ])
  .on((options) => {
    video1.classList.toggle("selfie", options.selfieMode);
    faceDetection.setOptions(options);
  });

// google drive configuaration

/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID =
  "820301224887-c72qonm394gunrrdt9n3u3kcmii9t3rt.apps.googleusercontent.com";
const API_KEY = "AIzaSyB3SyqrMdcaLWA1aWHcI6kMQRTa4N7N6Yo";

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/drive";

let tokenClient;

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load("client", intializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    })
    .then(() => {
      console.log("API client initialized successfully");
      gapi.client.setToken({
        access_token: ACCESS_TOKEN
      });
      FindParentFolder()
    })
    .catch((err) => {
      console.error(err);
    });
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", // defined later
  });
  console.log(google.accounts.oauth2)
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
    alert("No files found.");
    return;
  }
  // Flatten to string to display
  const output = files.reduce(
    (str, file) => `${str}${file.name} (${file.id})\n`,
    "Files:\n"
  );
  console.log(files);
  localStorage.setItem("parent_folder", files[0].id);
}

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

  let res =  await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + ACCESS_TOKEN,
      }),
      body: fd,
    }
  )
  return await res.json()
}
