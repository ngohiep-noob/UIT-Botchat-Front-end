const inputVid = document.getElementById("input-video");
const outputVid = document.getElementById("output-video");
const img = document.getElementById("img");
const controlsElement1 = document.getElementsByClassName("control1")[0];
const outputCtx = outputVid.getContext("2d");
const outputCrop = img.getContext("2d");
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

function runFaceDetect() {
  faceDetection.onResults(onResultsFace)
}

let state = 1; // 0 - waiting, 1 - ready

async function onResultsFace(results) {
  fpsControl.tick();
  outputCtx.save();
  outputCtx.translate(outputVid.width, 0);
  outputCtx.scale(-1, 1);
  outputCtx.clearRect(0, 0, outputVid.width, outputVid.height);
  outputCtx.drawImage(results.image, 0, 0, outputVid.width, outputVid.height);

  // console.log('face ',results.detections[0])
  if (results.detections.length > 0) {
    const size = outputVid.height;
    const sHeight = results.detections[0].boundingBox["height"] * size;
    const sWidth = results.detections[0].boundingBox["width"] * size;
    const sx = results.detections[0].boundingBox["xCenter"] * size;
    const sy = results.detections[0].boundingBox["yCenter"] * size;
    // console.log('height: ' + sHeight,'width: ' +  sWidth, 'sx: ' + sx, 'sy: ' + sy)

    drawRectangle(outputCtx, results.detections[0].boundingBox, {
      color: "green",
      lineWidth: 4,
      fillColor: "#00000000",
    });

    drawLandmarks(outputCtx, results.detections[0].landmarks, {
      color: "white",
      radius: 5,
    });
    
    /**
     * main process
     */
    if(!IN_PROCESS && sHeight > 160 && sWidth > 160) {
      if(IMAGES.length < NUMBER_OF_IMAGES) {
        if (state != 0) {
          state = 0;
          ShowSpinner();
          setTimeout(() => {
            outputCrop.drawImage(
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
        try {
          IN_PROCESS = true;
        
        /**
         * Call api to verify
         * http response: 3 student: {
         *  id: string,
         *  name: string,
         * }
         */
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
  outputCtx.restore();
}

async function onResultsHand(results) {
  if (results.multiHandLandmarks) {
    console.log('hand ',results.multiHandLandmarks)
    
    for (const i in results.multiHandLandmarks) {
      const coords = results.multiHandLandmarks[i];
      // drawConnectors(outputCtx, i, HAND_CONNECTIONS,
      //                {color: '#00FF00', lineWidth: 5});
      outputCtx.fillText(i, coords.x, coords.y)
      drawLandmarks(outputCtx, coords, {color: '#FF0000', lineWidth: 2});
    }
  }
}

const faceDetection = new FaceDetection({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.0/${file}`;
  },
});

runFaceDetect();

const FaceCamera = new Camera(inputVid, {
  onFrame: async () => {
    await faceDetection.send({ image: inputVid });
  },
  width: outputVid.height,
  height: outputVid.height,
});
FaceCamera.start();

const handDetection = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

handDetection.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
handDetection.onResults(onResultsHand);

const HandCamera = new Camera(inputVid, {
  onFrame: async () => {
    await handDetection.send({image: inputVid});
  },
  width: outputVid.height,
  height: outputVid.height,
});
HandCamera.start();

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
    inputVid.classList.toggle("selfie", options.selfieMode);
    faceDetection.setOptions(options);
  });

