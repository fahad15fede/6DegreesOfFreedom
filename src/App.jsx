import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { rotate } from "three/src/nodes/utils/RotateNode.js";


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
    distance_from_origin:0,
    rotation: {x:0, y:0, z:0},
    corners:[]
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
    const grid = new THREE.GridHelper(50,50,  '0xffff00', // center line (bright)
  'green' );
    const grid2 = new THREE.GridHelper(50,50, '0xffff00', 'red');
    const grid3 = new THREE.GridHelper(50,50, '0xffff00', 'blue');

    grid2.rotation.x=Math.PI/2;
    grid3.rotation.z=Math.PI/2;

    scene.add(grid);
    scene.add(grid2);
    scene.add(grid3);

    //Axes
    // const axesHelper = new THREE.AxesHelper(20);
    // scene.add(axesHelper);

    //Cube
    const geometry = new THREE.BoxGeometry(7,7,7);

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
    
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
    const boxHelper = new THREE.BoxHelper(cube, 0xFFFFFF);
    scene.add(boxHelper);

    //corner markers

    const cornerSpheres = [];

    for(let i = 0; i < 8; i++){
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.25),
      new THREE.MeshBasicMaterial({color: cornerColors[i]})
    );

    scene.add(sphere);
    cornerSpheres.push(sphere);
    }

    //Controls

    const keys = {};
    const handleKeyDown = (e) =>(keys[e.key.toLowerCase()] = true);
    const handleKeyUp = (e) =>(keys[e.key.toLowerCase()]=false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Movement speed
    const moveSpeed = 0.05;
    const rotSpeed = 0.02;

    const getCorners = () =>{
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
      const corners = getCorners();
      requestAnimationFrame(animate);
      controls.update();
      boxHelper.update();

      // 🔹 Translation (Position)
      if (keys["q"]) cube.position.z -= moveSpeed; // forward
      if (keys["e"]) cube.position.z += moveSpeed; // backward
      if (keys["a"]) cube.position.x -= moveSpeed; // left
      if (keys["d"]) cube.position.x += moveSpeed; // right
      if (keys["w"]) cube.position.y += moveSpeed; // up
      if (keys["s"]) cube.position.y -= moveSpeed; // down

      // 🔹 Rotation
      if (keys["i"]) cube.rotation.x -= rotSpeed; // rotate X
      if (keys["k"]) cube.rotation.x += rotSpeed;
      if (keys["j"]) cube.rotation.y -= rotSpeed; // rotate Y
      if (keys["l"]) cube.rotation.y += rotSpeed;
      if (keys["u"]) cube.rotation.z -= rotSpeed; // rotate Z
      if (keys["o"]) cube.rotation.z += rotSpeed;
      
      //Info updates
      const distance_from_origin = cube.position.length();
      
      const rotation = {
        x:cube.rotation.x,
        y:cube.rotation.y,
        z:cube.rotation.z,
      };

      setInfo({
        distance_from_origin:distance_from_origin.toFixed(2),

        rotation:{
        x:rotation.x.toFixed(2),
        y:rotation.y.toFixed(2),
        z:rotation.z.toFixed(2),
        },
        corners: corners.map(c => ({
          x: c.x.toFixed(2),
          y: c.y.toFixed(2),
          z: c.z.toFixed(2)
        }))
      });


      corners.forEach((corner, i)=>{
          if(cornerSpheres[i]){
            cornerSpheres[i].position.copy(corner);
          }
      });

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
      </Panel>
      <Panel pos="top-right" title="Rotate">
        I/K[Pitch] → X<br />
        J/L[Yaw] → Y<br />
        U/O[Roll] → Z
      </Panel>
      <Panel pos="bottom-left" title="Mouse">
        Drag → Rotate<br />
        Scroll → Zoom
      </Panel>
      <Panel pos="bottom-right" title="Live Data">
        <b>Distance from center:</b> <br />
        {info.distance_from_origin} <br /> <br />

        <b>Rotation (radians):</b> <br />
        X: {info.rotation.x} <br />
        Y: {info.rotation.y} <br />
        Z: {info.rotation.z} <br />

        <b>Coordinates(Vectors):</b> <br />

        {info.corners.map((c, i) => (
          <div key={i}>
            P{i + 1}: ({c.x}, {c.y}, {c.z})
          </div>
        ))}
       </Panel>
    </div>
  );
}

export default App;