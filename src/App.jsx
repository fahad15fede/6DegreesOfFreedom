import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { HandLandmarker, FilesetResolver} from "@mediapipe/tasks-vision";


const Panel = ({pos, title, children})=>{
  return(
    <div className={`panel ${pos}`}>
      <b className="panel-title">{title}</b> <br />
      {children}
    </div>
  );
};





function App(){
  const [showInstructions, setShowInstructions] = useState(false);
  const mountRef = useRef(null);
  const videoRef = useRef(null);
  const gestureRef = useRef("none");  
  const [gesture, setGesture] = useState("none");
  const [mode, setMode] = useState("move");
  const modeRef = useRef("move");
  const playerCubeRef = useRef();
  const targetCubeRef = useRef();
  const rotationRef = useRef({
  x: 0,
  y: 0,
  z: 0,
});

  const [time, setTime] = useState(0);

  const timerStartedRef = useRef(false);
  const timerIntervalRef = useRef(null);

  const cornerColors =[
      0xff0000, // red
      0xff7f00, // orange
      0xffff00, // yellow
      0x00ff00, // green
      0x0000ff, // blue
      0x4b0082, // indigo
      0x8f00ff, // violet
      0x40e0d0  // turquoise
  ];
  
  const [info, setInfo] = useState({
    playerCubeRadius:0,
    targetCubeRadius:0,
    playerCubeRotation: {x:0, y:0, z:0},
    targetCubeRotation:{x:0, y:0, z:0},
    playerCorners:[],
    targetCorners:[],
    totalCornerError:Infinity,
    totalRotationError:Infinity,
    totalPositionError:Infinity,
    status:"none"
  });

    const resetPlayerCube = () => {
      if (!playerCubeRef.current) return;

      resetTimer();

      playerCubeRef.current.position.set(0,0,0);

      playerCubeRef.current.rotation.set(0,0,0);
    };

      const startTimer = () => {
        if (timerStartedRef.current) return;

        timerStartedRef.current = true;

        timerIntervalRef.current = setInterval(() => {
          setTime(prev => prev + 1);
        }, 1000);
      };

      const resetTimer = () => {
        clearInterval(timerIntervalRef.current);

        timerStartedRef.current = false;

        setTime(0);
      };
  
  useEffect(()=>{
    //Scene
    const scene = new THREE.Scene();

    //Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth/window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);

    //Renderer 
    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    //Grid for better coordinates visuals
    const grid = new THREE.GridHelper(90,50,  0xffff00, // center line (bright)
  'green' );
    const grid2 = new THREE.GridHelper(90,50, 0xffff00, 'red');
    const grid3 = new THREE.GridHelper(90,50, 0xffff00, 'blue');

    grid2.rotation.x=Math.PI/2;
    grid3.rotation.z=Math.PI/2;

    scene.add(grid);
    scene.add(grid2);
    scene.add(grid3);

    //Axes
    // const axesHelper = new THREE.AxesHelper(20);
    // scene.add(axesHelper);

    //playerCube
    const playerGeometry = new THREE.BoxGeometry(7,7,7);
    const targetGeometry = new THREE.BoxGeometry(8,8,8);

    const materials = [
      
      
      new THREE.MeshStandardMaterial({ color: 0xFF0000 }), // Front  → Red
      new THREE.MeshStandardMaterial({ color: 0xFF7F7F }),  // Back   → Light Red
      
      new THREE.MeshStandardMaterial({ color: 0x00FF00 }), // Top    → Green
      new THREE.MeshStandardMaterial({ color: 0x32CD32 }), // Bottom → Lime

      new THREE.MeshStandardMaterial({ color: 0x4169E1 }), // Right  → Royal Blue
      new THREE.MeshStandardMaterial({ color: 0xADD8E6 }), // Left   → Light Blue
      

    ];


    //Light gives depth
    const light = new THREE.DirectionalLight(0xffffff, 1);  
    light.position.set(5, 10, 5);
    scene.add(light);

    //Bounding box 
    
    const playerCube = new THREE.Mesh(playerGeometry, materials);
    scene.add(playerCube);

    //Target cube
    const targetMaterial = new THREE.MeshStandardMaterial({
      color: "white",
      transparent: false,
      opacity:0.85,
      wireframe:false
    });

    const targetCube = new THREE.Mesh(targetGeometry, targetMaterial);

    playerCubeRef.current = playerCube;
    targetCubeRef.current = targetCube;


    //Random position of goal cube

    targetCube.position.set(
        Math.random() * 15 ,
        Math.random() * 15,
        Math.random() * 15 
    );

    //Random rotation of goal cube
    targetCube.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    scene.add(targetCube);

    const boxHelper = new THREE.BoxHelper(playerCube, 0xFFFFFF);
    scene.add(boxHelper);

    //corner markers

    const playerCornerSpheres = [];
    const targetCornerSpheres = [];

    for(let i = 0; i < 8; i++){
      const playerCornerSphere = new THREE.Mesh(new THREE.SphereGeometry(0.25),
      new THREE.MeshBasicMaterial({color: cornerColors[i]})
    );

    scene.add(playerCornerSphere);
    playerCornerSpheres.push(playerCornerSphere);

     const targetCornerSphere = new THREE.Mesh(new THREE.SphereGeometry(0.25),
     new THREE.MeshBasicMaterial({color:cornerColors[i]})
    );
    scene.add(targetCornerSphere);
    targetCornerSpheres.push(targetCornerSphere);

    }

    //Controls

    const keys = {};
    const handleKeyDown = (e) =>(keys[e.key.toLowerCase()] = true);
    const handleKeyUp = (e) =>(keys[e.key.toLowerCase()]=false);

    const handleModeSwitch = (e) => {

      if(e.key === "m"){
        setMode("move");
          modeRef.current = "move";
      }

      if(e.key === "r"){
        setMode("rotate");
        modeRef.current = "rotate";

      }

    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleModeSwitch);

    // Movement speed
    const moveSpeed = 0.18;
    const rotSpeed = 0.023;

    const getCorners = (cube) =>{
      const pos = cube.geometry.attributes.position;
      const unique = new Set();
      const result = [];

      for (let i = 0; i < pos.count; i++){
        const v = new THREE.Vector3().fromBufferAttribute(pos, i);

        v.applyMatrix4(cube.matrixWorld);

        const key = `${v.x.toFixed(3)}_${v.y.toFixed(3)}_${v.z.toFixed(3)}`;

        if(!unique.has(key)){
          unique.add(key);
          result.push(v);
        }
      }

      return result.slice(0, 8);

    };



    //Animate
    let animationId;
    const animate = () =>{
      console.log(gestureRef.current);
      const playerCorners = getCorners(playerCube);
      const targetCorners = getCorners(targetCube);

      
      animationId = requestAnimationFrame(animate);
      controls.update();
      boxHelper.update();

      //Timer start logic
      const keyboardMoving =
        keys["q"] ||
        keys["e"] ||
        keys["a"] ||
        keys["d"] ||
        keys["w"] ||
        keys["s"] ||
        keys["i"] ||
        keys["k"] ||
        keys["j"] ||
        keys["l"] ||
        keys["u"] ||
        keys["o"];

      if (keyboardMoving) {
        startTimer();
      }

      // 🔹 Translation (Position)
      if (keys["q"]) playerCube.position.z -= moveSpeed; // forward
      if (keys["e"]) playerCube.position.z += moveSpeed; // backward
      if (keys["a"]) playerCube.position.x -= moveSpeed; // left
      if (keys["d"]) playerCube.position.x += moveSpeed; // right
      if (keys["w"]) playerCube.position.y += moveSpeed; // up
      if (keys["s"]) playerCube.position.y -= moveSpeed; // down
      
      // 🔹 Rotation
      if (keys["i"]) playerCube.rotation.x -= rotSpeed; // rotate X
      if (keys["k"]) playerCube.rotation.x += rotSpeed;
      if (keys["j"]) playerCube.rotation.y -= rotSpeed; // rotate Y
      if (keys["l"]) playerCube.rotation.y += rotSpeed;
      if (keys["u"]) playerCube.rotation.z -= rotSpeed; // rotate Z
      if (keys["o"]) playerCube.rotation.z += rotSpeed;

      //Start timer on gesture movement
      if (gestureRef.current !== "none") {
        startTimer();
      }
      //gesture movements
      if(gestureRef.current === "forward"){
        playerCube.position.z -= moveSpeed;
      }
      if(gestureRef.current === "backward"){
        playerCube.position.z += moveSpeed;
      }
      if(gestureRef.current === "right"){
        playerCube.position.x -= moveSpeed;
      }
      if(gestureRef.current === "left"){
        playerCube.position.x += moveSpeed;
      }
      if(gestureRef.current === "up"){
        playerCube.position.y += moveSpeed;
      }
      if(gestureRef.current === "down"){
        playerCube.position.y -= moveSpeed;
      } 
      if(gestureRef.current === "Rotate-X"){
        playerCube.rotation.x += rotationRef.current.x * 0.1;
      }
      if(gestureRef.current === "Rotate+X"){
        playerCube.rotation.x += rotationRef.current.x * -0.1;
      }
      if(gestureRef.current === "Rotate-Y"){
        playerCube.rotation.y += rotationRef.current.y * 0.4;
      }
      if(gestureRef.current === "Rotate+Y"){
        playerCube.rotation.y -= rotationRef.current.y * 0.2;
      }
      if(gestureRef.current === "Rotate-Z"){
        playerCube.rotation.z += rotationRef.current.z * 0.01;
      }
      if(gestureRef.current === "Rotate+Z"){
        playerCube.rotation.z += rotationRef.current.z * -0.01;
      }


            
      //Info updates
      const playerCubeRadius = playerCube.position.length();
      const targetCubeRadius = targetCube.position.length();
      
      const playerCubeRotation = {
        x:playerCube.rotation.x,
        y:playerCube.rotation.y,
        z:playerCube.rotation.z,
      };
      
      //Error calculation
      const totalPositionError = Math.abs(targetCubeRadius - playerCubeRadius);
      const targetRotX = parseFloat(targetCube.rotation.x.toFixed(2));
      const targetRotY = parseFloat(targetCube.rotation.y.toFixed(2));
      const targetRotZ = parseFloat(targetCube.rotation.z.toFixed(2));
      const playerRotX = parseFloat(playerCube.rotation.x.toFixed(2));
      const playerRotY = parseFloat(playerCube.rotation.y.toFixed(2));
      const playerRotZ = parseFloat(playerCube.rotation.z.toFixed(2));

      const angleDiff=(a, b)=>{
        let diff = Math.abs(a-b);
        return(Math.min(diff, Math.PI*2-diff));
      };

      const totalRotationError = angleDiff(playerRotX, targetRotX)+angleDiff(playerRotY, targetRotY)+angleDiff(playerRotZ, targetRotZ);

      let totalCornerError = 0;
      for(let i = 0; i < 8; i++){
        if(playerCorners[i] && targetCorners[i]){
          totalCornerError += playerCorners[i].distanceTo(targetCorners[i]);
        }
      }
      
      //Display status
      let status = "none";
      if (totalPositionError < 0.5 && totalRotationError < 0.2){
        status = "perfect";
      } 
      else if(totalPositionError < 2 && totalRotationError < 0.6){
        status = "near";
      } 
      else {
        status = "far";
      }

      setInfo({
        playerCubeRadius: playerCubeRadius.toFixed(2),
        targetCubeRadius: targetCubeRadius.toFixed(2),
        
        playerCubeRotation: {
          x: playerRotX,
          y: playerRotY,
          z: playerRotZ,
        },
        
        targetCubeRotation: {
          x: targetRotX,
          y: targetRotY,
          z: targetRotZ,
        },
        
        playerCorners: playerCorners.map(c => ({
          x: c.x.toFixed(2),
          y: c.y.toFixed(2),
          z: c.z.toFixed(2)
        })),
        
        targetCorners: targetCorners.map(c => ({
          x: c.x.toFixed(2),
          y: c.y.toFixed(2),
          z: c.z.toFixed(2)
        })),
        
        totalPositionError: totalPositionError.toFixed(2),
        totalRotationError: totalRotationError.toFixed(2),
        totalCornerError: totalCornerError.toFixed(2),
        status: status
      });


      playerCorners.forEach((corner, i)=>{
          if(playerCornerSpheres[i]){
            playerCornerSpheres[i].position.copy(corner);
          }
      });

      targetCorners.forEach((corner, i)=>{
          if(targetCornerSpheres[i]){
            targetCornerSpheres[i].position.copy(corner);
          }
      });

      if(status === "far"){
        targetCube.material.color.set(0xff0000);
      }
      else if(status === "near"){
        targetCube.material.color.set(0xffff00);
      }
      else if(status === "perfect"){
        targetCube.material.color.set(0x00ff00);
        clearInterval(timerIntervalRef.current);
      }

      renderer.render(scene, camera);
    };
      
    animate();

    //Clean Up
    return()=>{
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleModeSwitch);
      
      // Dispose Three.js resources
      playerGeometry.dispose();
      targetGeometry.dispose();
      materials.forEach(m => m.dispose());
      targetMaterial.dispose();
      
      playerCornerSpheres.forEach(sphere => {
        sphere.geometry.dispose();
        sphere.material.dispose();
      });
      targetCornerSpheres.forEach(sphere => {
        sphere.geometry.dispose();
        sphere.material.dispose();
      });
      
      boxHelper.geometry.dispose();
      boxHelper.material.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      grid2.geometry.dispose();
      grid2.material.dispose();
      grid3.geometry.dispose();
      grid3.material.dispose();
      light.dispose();
      renderer.dispose();
      controls.dispose();
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }

      if(videoRef.current?.srcObject){
        const tracks = videoRef.current.srcObject.getTracks();

      tracks.forEach(track => track.stop());
}
    };

  }, []);

  useEffect(()=>{

    let handLandmarker;

    async function setUpHands() {
        //start webcam

        const stream = await navigator.mediaDevices.getUserMedia({video:true,});

        videoRef.current.srcObject = stream;

        await videoRef.current.play();

        //media vision setup
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");

        // create a hand detector
        handLandmarker = await HandLandmarker.createFromOptions(vision,
          {
            baseOptions:{
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            },
            runningMode:"VIDEO",
            numHands:2,
          }
        );

        detectHands();
    }

    function detectHands(){
      async function frameLoop() {

        if(!videoRef.current || !handLandmarker){
          requestAnimationFrame(frameLoop);
          return;
        }

        // DEFAULT VALUES
        let isPinching = false;
        let dx = 0;
        let dy = 0;
        let angleZ = 0;

        const results = handLandmarker.detectForVideo(
          videoRef.current,
          performance.now()
        );

        if(results.landmarks && results.landmarks.length > 0){

          const landmarks = results.landmarks[0];


           // finger joints
            const indexPip = landmarks[6];
            const middleMcp = landmarks[9];
            const middlePip = landmarks[10];
            const ringPip = landmarks[14];
            const pinkyPip = landmarks[18];
            // fingertips

            const indexTip = landmarks[8];
            const middleTip = landmarks[12];
            const ringTip = landmarks[16];
            const pinkyTip = landmarks[20];

            // thumb
            // const thumbTip = landmarks[4];
            // const thumbIp = landmarks[3];
            // const thumbMcp = landmarks[2];

            //wrist
            const wrist = landmarks[0];


            //finger states
            const indexOpen = indexTip.y< indexPip.y;

            const middleOpen = middleTip.y < middlePip.y;

            const ringOpen = ringTip.y < ringPip.y;

            const pinkyOpen = pinkyTip.y < pinkyPip.y;

            // const thumbUp = thumbTip.y < thumbMcp.y;

            // const thumbDown = thumbTip.y > thumbMcp.y;

            // const pinchDistance = Math.hypot(
            // thumbTip.x - indexTip.x,
            // thumbTip.y - indexTip.y,
            // thumbTip.z - indexTip.z
            // );  

            dx = middleMcp.x - wrist.x;
            dy = middleMcp.y - wrist.y;
            angleZ = Math.atan2(
              pinkyTip.y - indexTip.y,
              pinkyTip.x - indexTip.x
            );
            // isPinching = pinchDistance < 0.05;

          if(modeRef.current === "move"){
            //gestures
            if(indexOpen && middleOpen && ringOpen && pinkyOpen) {
              gestureRef.current = "forward";
              setGesture("forward");
            }
            else if(!indexOpen && !middleOpen && !ringOpen && !pinkyOpen ){
              gestureRef.current = "backward";
              setGesture("backward");
            }
            else if(indexOpen && !middleOpen && !ringOpen && !pinkyOpen ){
              gestureRef.current = "right";
              setGesture("right");
            }
            else if(!indexOpen && !middleOpen && !ringOpen && pinkyOpen){
              gestureRef.current = "left";
              setGesture("left");
            }
            else if(indexOpen && middleOpen && !ringOpen && !pinkyOpen){
              gestureRef.current = "up";
              setGesture("up");
            }
            else if(indexOpen && middleOpen && ringOpen && !pinkyOpen){
              gestureRef.current = "down";
              setGesture("down");
            }
            else{
              gestureRef.current = "none";
              setGesture("none");
            }
          } else if(modeRef.current === "rotate"){

            gestureRef.current = "none";

            // reset all first
            rotationRef.current.x = 0;
            rotationRef.current.y = 0;
            rotationRef.current.z = 0;

            if(indexOpen && middleOpen && ringOpen && pinkyOpen){
                  rotationRef.current.x = dy;
                  gestureRef.current = "Rotate-X";
                  setGesture("Rotate-X");
            }
            else if(!indexOpen && !middleOpen && !ringOpen && !pinkyOpen){
                  rotationRef.current.x = dy;
                  gestureRef.current = "Rotate+X";
                  setGesture("Rotate+X");
            }
            else if(indexOpen && !middleOpen && !ringOpen && !pinkyOpen){
                  rotationRef.current.y = dx;
                  gestureRef.current = "Rotate-Y";
                  setGesture("Rotate-Y");
            }
            else if(!indexOpen && !middleOpen && !ringOpen && pinkyOpen){
                  rotationRef.current.y = dx;
                  gestureRef.current = "Rotate+Y";
                  setGesture("Rotate+Y");
            }
            else if(indexOpen && middleOpen && !ringOpen && !pinkyOpen){
                  rotationRef.current.z = angleZ;
                  gestureRef.current = "Rotate-Z";
                  setGesture("Rotate-Z");
            }
            else if(indexOpen && middleOpen && ringOpen && !pinkyOpen){
                  rotationRef.current.z = angleZ;
                  gestureRef.current = "Rotate+Z";
                  setGesture("Rotate+Z");
            }
            else{
              setGesture("none");
              gestureRef.current = "none";
            }
          } 
        } else {
          gestureRef.current = "none";
          setGesture("none");
          rotationRef.current.x = 0;
          rotationRef.current.y = 0;
          rotationRef.current.z = 0;
        }

        requestAnimationFrame(frameLoop);
      }

      frameLoop();
    }
    setUpHands();
  }, []);

  const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};


  return(
    <div className="container">

      <div ref ={mountRef} className="canvas"></div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width={640}
        height={480}
        className="webcam"
      />

      <div className="timer-box">
        ⏱ {formatTime(time)}
      </div>

      <button
        className="instructions-toggle"
        onClick={() => setShowInstructions(!showInstructions)}
      >
        {showInstructions ? "✖ Close" : "☰ Instructions"}
      </button>

      <div className={`instructions-sidebar ${showInstructions ? "open" : ""}`}>
  
        <h2>Controls & Instructions</h2>

        <div className="instruction-section">
          <h3>Movement Keys</h3>

          <p>W / S → Up & Down</p>
          <p>A / D → Left & Right</p>
          <p>Q / E → Forward & Backward</p>
        </div>

        <div className="instruction-section">
          <h3>Rotation Keys</h3>

          <p>I / K → Rotate X</p>
          <p>J / L → Rotate Y</p>
          <p>U / O → Rotate Z</p>
        </div>

        <div className="instruction-section">
          <h3>Gesture Controls</h3>

          <p>Open Palm → Forward</p>
          <p>Closed Fist → Backward</p>
          <p>Index Finger → Right</p>
          <p>Pinky Finger → Left</p>
          <p>2 Fingers → Up</p>
          <p>3 Fingers → Down</p>
        </div>

        <div className="instruction-section">
          <h3>Modes</h3>

          <p>M → Move Mode</p>
          <p>R → Rotate Mode</p>
        </div>
      </div>
        <button
        className="reset-btn"
        onClick={resetPlayerCube}
      >
        Reset Cube
      </button>
      
      {/* <Panel pos="top-left" title="Move Shape"> <br />
        <b>Keyboard</b> <br />
        A(Left)⬅️/D➡️(Right)→[Sway] X-axis<br />
        W(Up)⬆️/S(Down)⬇️[Heave]→ Y-axis <br />
        Q(Forward)↗️/E(Backward)↘️→[Surge] Z-axis <br />
        <b>Gestures</b> <br />
        Index(Left)⬅️/Pinky➡️(Right)→[Sway] X-axis<br />
        First two fingers(Up)⬆️/First three fingers(Down)⬇️[Heave]→ Y-axis <br />
        Open palm(Forward)↗️/Closed fist(Backward)↘️→[Surge] Z-axis <br /> <br />




      </Panel> */}
      <Panel pos="top-right" title="Move Camera">
        {/* <br />
        I/K[Pitch] → X<br />
        J/L[Yaw] → Y<br />
        U/O[Roll] → Z <br /> <br /> */}
        <br />
        Drag → Rotate<br />
        Scroll → Zoom <br /> <br />
        <b className="subTitles">Mode</b> <br />
        <b>{mode}</b> 
      </Panel>
      <Panel pos="bottom-left" title="Target Data">
        <br />
        <b className="subTitles">Target Radius:</b> <br /> 
        {info.targetCubeRadius} <br /> <br />

        <b className="subTitles">Target Cube Rotation (radians):</b> <br />
        X: {info.targetCubeRotation.x} <br />
        Y: {info.targetCubeRotation.y} <br />
        Z: {info.targetCubeRotation.z} <br /> <br />

      <b className="subTitles">Coordinates(Vectors):</b> <br />

        {info.targetCorners.map((c, i) => (
          <div key={i}>
            P{i + 1}: ({c.x}, {c.y}, {c.z})
          </div>
        ))} <br />
        <b className="subTitles">Status:</b> <br /> {info.status}


      </Panel>

      <Panel pos="bottom-right" title="Player Data">

        <br />
        <b className="subTitles">Player Radius:</b> <br /> 
        {info.playerCubeRadius} <br /> <br />

        <b className="subTitles">Player Cube Rotation (radians):</b> <br />
        X: {info.playerCubeRotation.x} <br />
        Y: {info.playerCubeRotation.y} <br />
        Z: {info.playerCubeRotation.z} <br /> <br />


        <b className="subTitles">Coordinates(Vectors):</b> <br />

        {info.playerCorners.map((c, i) => (
          <div key={i}>
            P{i + 1}: ({c.x}, {c.y}, {c.z})
          </div>
        ))}
        <br />
        <b className="subTitles">Gesture:</b> <br /> {gesture}
       </Panel> 
    </div>
  );
}

export default App;