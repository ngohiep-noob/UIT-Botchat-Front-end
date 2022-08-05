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
    const size = out1.height;
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
    if(!IN_PROCESS && sHeight > 160 && sWidth > 160) {
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
        IN_PROCESS = true;
        
        /**
         * Call api to verify
         * http response: 3 student: {
         *  id: string,
         *  name: string,
         * }
         */
        try {
          ShowToast('Notifications', 'Đang nhận diện gương mặt!');
          let resp = await HandleRecognize();

          let userList = resp.data.reduce((preList, u) => {
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
        } catch (error) {
          ShowToast('Error', error.message, true, 'error') 
          ActionWithDelay(() => {
            ClearImageList()
          }, 5000)   
        }
        HideSpinner();
      }
    } else if(IN_PROCESS) {
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
  width: out1.height,
  height: out1.height,
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






