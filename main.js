const video1 = document.getElementsByClassName("input_video1")[0];
const out1 = document.getElementsByClassName("output1")[0];
const img = document.getElementById("img");
const controlsElement1 = document.getElementsByClassName("control1")[0];
const canvasOut1 = out1.getContext("2d");
const canvasImgCrop = img.getContext("2d");
const fpsControl = new FPS();
const stopBtn = document.getElementById("stop-btn");
const mainBox = document.getElementById("main-box");

/**
 * Call api to verify user
 * - if user verification is correct -> show user information
 * - if user verification is not correct
 *    -> ask user id
 *    -> upload to gg drive and call api register
 */

function stopDetect() {
  faceDetection.onResults(() => {
    //console.log("finished face detection!");
  });
}

function runDetect() {
  faceDetection.onResults(onResultsFace)
}

let state = 1; // 0 - waiting, 1 - ready

async function onResultsFace(results) {
  fpsControl.tick();
  canvasOut1.save();
  canvasOut1.clearRect(0, 0, out1.width, out1.height);
  canvasOut1.drawImage(results.image, 0, 0, out1.width, out1.height);

  if (results.detections.length > 0) {
    const size = 480;
    const sHeight = results.detections[0].boundingBox["height"] * size;
    const sWidth = results.detections[0].boundingBox["width"] * size;
    const sx = results.detections[0].boundingBox["xCenter"] * size;
    const sy = results.detections[0].boundingBox["yCenter"] * size;
    // console.log('height: ' + sHeight,'width: ' +  sWidth, 'sx: ' + sx, 'sy: ' + sy)

    drawRectangle(canvasOut1, results.detections[0].boundingBox, {
      color: "green",
      lineWidth: 4,
      fillColor: "#00000000",
    });

    drawLandmarks(canvasOut1, results.detections[0].landmarks, {
      color: "white",
      radius: 5,
    });
    /**
     * user face need to be close and there aren't any process running
     */
    if(!PROCESSING && sHeight > 160 && sWidth > 160) {
      if(IMAGES.length < NUMBER_OF_IMAGES) {
        if (state != 0) {
          state = 0;
          ShowSpinner();
          setTimeout(() => {
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

            let file = dataURLtoFile(img.toDataURL("image/jpeg"), `${IMAGES.length}.jpeg`);
            AddImageToList(file)
            state = 1;
          }, 2000);
          // HideSpinner();
        }
      } else {
        PROCESSING = true;
        
        /**
         * Call api to verify
         * http response: 3 student: {
         *  id: string,
         *  name: string,
         * }
         */
        ShowToast('Notifications', 'Đang nhận diện gương mặt!');
        let resp = await HandleRecognize();
        HideSpinner();

        let userList = resp.reduce((preList, u) => {
          const name_id = u.subject.split('_')
          return [
            ...preList,
            {
              id: name_id[1],
              name: name_id[0]
            }
          ]
        }, [])
        
        console.log('Prediction: ',userList)

        RenderUserPrediction(userList);
        ShowModal(modalGreetingTrigger, 'Xin chào!');
      }
    } else if(PROCESSING) {
      console.log('in process!')
    } else if(sHeight > 110 && sWidth > 110){ 
      if(IMAGES.length < 3)
      ShowToast('Notification', 'Hãy lại gần camera!')
    }
  }
  canvasOut1.restore();
}

const faceDetection = new FaceDetection({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.0/${file}`;
  },
});

runDetect();

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

const CLIENT_ID =
  "820301224887-c72qonm394gunrrdt9n3u3kcmii9t3rt.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const API_KEY = "AIzaSyB3SyqrMdcaLWA1aWHcI6kMQRTa4N7N6Yo";

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/drive";

let ACCESS_TOKEN = "";

const REFRESH_TOKEN =
  "1//04W8LGfnVnOWrCgYIARAAGAQSNwF-L9IrhK88uQALSHRDRZCIyMD3C52or3Qnj_ju3fOheaByYi1Kl9ohTlG5refWP1Ggv_oPomo";

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
    .then(async () => {
      console.log("API client initialized successfully");

      ACCESS_TOKEN = await RefreshToken(
        CLIENT_ID,
        CLIENT_SECRET,
        REFRESH_TOKEN
      );

      gapi.client.setToken({
        access_token: ACCESS_TOKEN,
      });

      FindParentFolder();
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
}

setInterval(async () => {
  ACCESS_TOKEN = await RefreshToken(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN);
}, 35000);
