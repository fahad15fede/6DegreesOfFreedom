import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


const Panel = ({pos, title, children})=>{
  return(
    <div className={`panel ${pos}`}>
      <b>{title}</b> <br />
      {children}
    </div>
  );
};





function App(){
  const mountRef = useRef(null);

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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Movement speed
    const moveSpeed = 0.1;
    const rotSpeed = 0.017;

    const getCorners = (cube) =>{
      const pos = cube.geometry.attributes.position;
      const unique = new Set();
      const result = [];

      for (let i = 0; i < pos.count; i++){
        const v = new THREE.Vector3().fromBufferAttribute(pos, i);

        v.applyMatrix4(cube.matrixWorld);

        const key = `${v.x.toFixed(3)}_${v.y.toFixed(3)}_${v.z.toFixed(3)}}`;

        if(!unique.has(key)){
          unique.add(key);
          result.push(v);
        }
      }

      return result.slice(0, 8);

    };

    //Animate
    const animate = () =>{
      const playerCorners = getCorners(playerCube);
      const targetCorners = getCorners(targetCube);

      
      requestAnimationFrame(animate);
      controls.update();
      boxHelper.update();

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
        totalCornerError += playerCorners[i].distanceTo(targetCorners[i]);
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

      if(status == "far"){
        targetCube.material.color.set(0xff0000);
      }
      else if(status == "near"){
        targetCube.material.color.set(0xffff00);
      }
      else if(status == "perfect"){
        targetCube.material.color.set(0x00ff00);
      }

      renderer.render(scene, camera);
    };

    animate();

    //Clean Up
    return()=>{
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };

  }, []);

  return(
    <div className="container">

      <div ref ={mountRef} className="canvas"></div>

      <Panel pos="top-left" title="Move">
        Q(Forward)↗️/E(Backward)↘️→[Surge] Z-axis<br />
        A(Left)⬅️/D➡️(Right)→[Sway] X-axis<br />
        W(Up)⬆️/S(Down)⬇️[Heave]→ Y-axis

        Drag → Rotate<br />
        Scroll → Zoom
      </Panel>
      <Panel pos="top-right" title="Rotate">
        I/K[Pitch] → X<br />
        J/L[Yaw] → Y<br />
        U/O[Roll] → Z
      </Panel>
      <Panel pos="bottom-left" title="Target Data">
        <b>Target Radius:</b> <br />
        {info.targetCubeRadius} <br />

        <b>Target Cube Rotation (radians):</b> <br />
        X: {info.targetCubeRotation.x} <br />
        Y: {info.targetCubeRotation.y} <br />
        Z: {info.targetCubeRotation.z} <br />

      <b>Coordinates(Vectors):</b> <br />

        {info.targetCorners.map((c, i) => (
          <div key={i}>
            P{i + 1}: ({c.x}, {c.y}, {c.z})
          </div>
        ))}



      </Panel>
      <Panel pos="bottom-right" title="Player Data">

        <b>Player Radius:</b> <br />
        {info.playerCubeRadius} <br /> <br />

        <b>Player Cube Rotation (radians):</b> <br />
        X: {info.playerCubeRotation.x} <br />
        Y: {info.playerCubeRotation.y} <br />
        Z: {info.playerCubeRotation.z} <br />


        <b>Coordinates(Vectors):</b> <br />

        {info.playerCorners.map((c, i) => (
          <div key={i}>
            P{i + 1}: ({c.x}, {c.y}, {c.z})
          </div>
        ))}
       </Panel>
    </div>
  );
}

export default App;