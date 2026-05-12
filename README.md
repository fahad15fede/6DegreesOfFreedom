# Hoverable: 3D Cube Matching Game with 6DOF Control

## Project Overview

Hoverable is an interactive 3D cube-matching game built with React, Three.js, and MediaPipe. The player controls a cube using **keyboard input** and **real-time hand gestures** detected through a webcam. The goal is to position and rotate the player cube until it matches a randomized target cube in 3D space.

This project demonstrates **6 Degrees of Freedom (6DOF) interaction**, spatial reasoning, gesture-based control, and HCI principles using modern web graphics and computer vision technology.

## Key Features

- ✅ **6DOF Control**: Full 3D positioning and rotation with natural gesture controls
- ✅ **Real-time Hand Gesture Recognition**: MediaPipe-powered gesture detection for intuitive control
- ✅ **Keyboard & Gesture Modes**: Dual input methods with mode switching (Move/Rotate)
- ✅ **Live Performance Metrics**: Timer, error calculations, and alignment status
- ✅ **Visual Feedback System**: Color-coded status, corner markers, bounding box visualization
- ✅ **3D Scene Rendering**: Perspective camera, lighting, grid helpers, and interactive camera controls

## Technical Stack

- **Frontend Framework**: React 19.2.5
- **3D Graphics**: Three.js 0.184.0
- **Computer Vision**: MediaPipe Hand Landmarker
- **Camera Controls**: Three.js OrbitControls
- **Build Tool**: Vite 8.0.10
- **Additional Libraries**: react-webcam, @mediapipe/tasks-vision

---

## 1. Scene Architecture

The 3D environment is built with Three.js and provides:

### Camera Setup
- **Perspective Camera** (75° FOV): Positioned at (15, 15, 15) for diagonal viewport
- **Window Responsive**: Scales with browser dimensions

### Lighting
- **Directional Light**: Positioned at (5, 10, 5) to provide depth and readability
- **Default Material**: Three.js ambient lighting for overall illumination

### Visual Reference System
- **Three Grid Planes** (XY, XZ, YZ): 90×50 grid units for spatial orientation
  - Each axis highlighted in different colors (Green, Red, Blue)
- **Box Helper**: White bounding box around player cube for position reference

### Camera Interaction
- **OrbitControls Enabled**: Mouse-based camera rotation and zoom
- **Damping**: Smooth camera movement transitions

---

## 2. The 6 Degrees of Freedom (6DOF) Explained

6DOF refers to the six independent ways an object can move and rotate in 3D space:

### 3 Translational Degrees of Freedom (Position)
1. **X-Axis (Sway)**: Left ↔ Right movement
2. **Y-Axis (Heave)**: Up ↔ Down movement  
3. **Z-Axis (Surge)**: Forward ↔ Backward movement

Position is calculated as:
```
playerCube.position = {x, y, z}
Distance from origin = √(x² + y² + z²)
```

### 3 Rotational Degrees of Freedom (Orientation)
1. **X-Rotation (Pitch)**: Rotation around X-axis (nose up/down)
2. **Y-Rotation (Yaw)**: Rotation around Y-axis (heading left/right)
3. **Z-Rotation (Roll)**: Rotation around Z-axis (wing tilt)

Rotation is represented using Euler angles:
```
playerCube.rotation = {x: radians, y: radians, z: radians}
```

---

## 3. Movement Calculation System

### Position Movement (Translation)

#### Keyboard Input
Movement is controlled through key presses with a constant speed factor:

```javascript
moveSpeed = 0.18 units/frame

// X-Axis (Sway)
A key  → playerCube.position.x -= moveSpeed  (Left)
D key  → playerCube.position.x += moveSpeed  (Right)

// Y-Axis (Heave)
W key  → playerCube.position.y += moveSpeed  (Up)
S key  → playerCube.position.y -= moveSpeed  (Down)

// Z-Axis (Surge)
Q key  → playerCube.position.z -= moveSpeed  (Forward)
E key  → playerCube.position.z += moveSpeed  (Backward)
```

#### Gesture Input (Hand Tracking)
Gestures are mapped to movement through finger state detection:

- **Open Palm** (All 4 fingers extended) → Forward (Z-axis)
- **Closed Fist** (All 4 fingers closed) → Backward (Z-axis)
- **Index Finger Only** → Right (X-axis)
- **Pinky Finger Only** → Left (X-axis)
- **Index + Middle Fingers** → Up (Y-axis)
- **Index + Middle + Ring Fingers** → Down (Y-axis)

**Detection Method**: MediaPipe Hand Landmarker provides 21 hand joint coordinates. Finger state is determined by comparing fingertip Y-position with finger PIP joint Y-position:
```javascript
const indexOpen = indexTip.y < indexPip.y; // True if tip is above PIP joint
```

---

## 4. Rotation Angle Conversion & Calculation

### Rotation Representation: Euler Angles

Three.js uses **Euler angles** (order: XYZ) to represent 3D rotations:
- Each angle is in **radians** (0 to 2π)
- Range: -∞ to ∞ (automatically wraps around)

### Keyboard Rotation Input

```javascript
rotSpeed = 0.023 radians/frame (≈ 1.3°/frame)

// X-Rotation (Pitch)
I key  → playerCube.rotation.x -= rotSpeed  (Rotate back)
K key  → playerCube.rotation.x += rotSpeed  (Rotate forward)

// Y-Rotation (Yaw)
J key  → playerCube.rotation.y -= rotSpeed  (Rotate counter-clockwise)
L key  → playerCube.rotation.y += rotSpeed  (Rotate clockwise)

// Z-Rotation (Roll)
U key  → playerCube.rotation.z -= rotSpeed  (Roll left)
O key  → playerCube.rotation.z += rotSpeed  (Roll right)
```

### Gesture Rotation Input

In **Rotate Mode** (R key), hand position is tracked to determine rotation direction:

**Hand Position Metrics Extracted**:
```javascript
dx = middleMcp.x - wrist.x        // Horizontal hand displacement
dy = middleMcp.y - wrist.y        // Vertical hand displacement
angleZ = atan2(pinkyTip.y - indexTip.y, 
               pinkyTip.x - indexTip.x)  // Palm orientation angle
```

**Gesture-to-Rotation Mapping**:
- **Open Palm** → Rotate-X (Uses `dy` for X-rotation): `rotation.x += dy × 0.1`
- **Closed Fist** → Rotate+X (Opposite direction): `rotation.x += dy × -0.1`
- **Index Only** → Rotate-Y (Uses `dx` for Y-rotation): `rotation.y += dx × 0.4`
- **Pinky Only** → Rotate+Y (Opposite direction): `rotation.y -= dx × 0.2`
- **Index + Middle** → Rotate-Z (Uses `angleZ`): `rotation.z += angleZ × 0.01`
- **Index + Middle + Ring** → Rotate+Z (Opposite direction): `rotation.z += angleZ × -0.01`

### Angular Error Calculation

To compare rotation angles (accounting for circular wrapping at 2π):

```javascript
const angleDiff = (a, b) => {
  let diff = Math.abs(a - b);
  return Math.min(diff, Math.PI*2 - diff);  // Returns smallest angle between them
};

// Total rotation error is sum of all three axes
totalRotationError = angleDiff(playerRotX, targetRotX) +
                     angleDiff(playerRotY, targetRotY) +
                     angleDiff(playerRotZ, targetRotZ);
```

**Why this works**: Angles can be compared in either direction around a circle. We find the shortest angular distance between target and player rotation.

---

## 5. Keyboard Controls

### Movement Mode (Default)

| Key | Action | Axis |
|-----|--------|------|
| **A** | Move Left | X (Sway) |
| **D** | Move Right | X (Sway) |
| **W** | Move Up | Y (Heave) |
| **S** | Move Down | Y (Heave) |
| **Q** | Move Forward | Z (Surge) |
| **E** | Move Backward | Z (Surge) |

### Rotation Mode

| Key | Action | Axis |
|-----|--------|------|
| **I** | Rotate Backward | X (Pitch) |
| **K** | Rotate Forward | X (Pitch) |
| **J** | Rotate Counter-Clockwise | Y (Yaw) |
| **L** | Rotate Clockwise | Y (Yaw) |
| **U** | Roll Left | Z (Roll) |
| **O** | Roll Right | Z (Roll) |

### Mode Switching & Utility

| Key | Action |
|-----|--------|
| **M** | Switch to Movement Mode |
| **R** | Switch to Rotation Mode |
| **Reset Button** | Resets cube to origin with zero rotation |

---

## 6. Gesture-Based Controls

### Hand Tracking Technology

- **Input**: Webcam video stream
- **Processing**: MediaPipe Hand Landmarker (26-point hand model)
- **Detection Points**: 21 hand joint landmarks per hand
- **Supported Hands**: Up to 2 hands simultaneously

### Hand Landmarks Used

```
Key landmarks extracted:
- Wrist (0): Base reference for hand position
- Index Finger: PIP (6), Tip (8)
- Middle Finger: MCP (9), PIP (10), Tip (12)
- Ring Finger: PIP (14), Tip (16)
- Pinky Finger: PIP (18), Tip (20)
```

### Movement Mode Gestures

| Gesture | Movement | Detection Logic |
|---------|----------|-----------------|
| **Open Palm** | Forward (Z-) | All fingers extended (`indexOpen && middleOpen && ringOpen && pinkyOpen`) |
| **Closed Fist** | Backward (Z+) | All fingers curled (`!indexOpen && !middleOpen && !ringOpen && !pinkyOpen`) |
| **Index Only** | Right (X-) | Only index extended (`indexOpen && !middleOpen...`) |
| **Pinky Only** | Left (X+) | Only pinky extended (`pinkyOpen && !indexOpen...`) |
| **Index + Middle** | Up (Y+) | Two fingers (`indexOpen && middleOpen && !ringOpen...`) |
| **Index + Middle + Ring** | Down (Y-) | Three fingers (`indexOpen && middleOpen && ringOpen && !pinkyOpen`) |

### Rotation Mode Gestures

| Gesture | Rotation | Formula |
|---------|----------|---------|
| **Open Palm** | Rotate-X | `rotation.x += (middleMcp.y - wrist.y) × 0.1` |
| **Closed Fist** | Rotate+X | `rotation.x += (middleMcp.y - wrist.y) × -0.1` |
| **Index Only** | Rotate-Y | `rotation.y += (middleMcp.x - wrist.x) × 0.4` |
| **Pinky Only** | Rotate+Y | `rotation.y -= (middleMcp.x - wrist.x) × 0.2` |
| **Index + Middle** | Rotate-Z | `rotation.z += atan2(pinkyTip.y - indexTip.y, ...) × 0.01` |
| **Index + Middle + Ring** | Rotate+Z | `rotation.z -= atan2(...) × 0.01` |

---

## 7. Timer System

### How the Timer Works

The timer tracks elapsed time from when the player first moves the cube:

```javascript
// State management
const [time, setTime] = useState(0);
const timerStartedRef = useRef(false);
const timerIntervalRef = useRef(null);

// Start timer on first input
const startTimer = () => {
  if (timerStartedRef.current) return;  // Prevent multiple starts
  timerStartedRef.current = true;
  timerIntervalRef.current = setInterval(() => {
    setTime(prev => prev + 1);
  }, 1000);  // Increment every 1000ms (1 second)
};

// Reset timer when cube is reset
const resetTimer = () => {
  clearInterval(timerIntervalRef.current);
  timerStartedRef.current = false;
  setTime(0);
};

// Stop timer on perfect alignment
if (status === "perfect") {
  clearInterval(timerIntervalRef.current);
}
```

### Timer Trigger Events

Timer starts when:
- ✅ Any keyboard key is pressed (Q, E, A, D, W, S, I, K, J, L, U, O)
- ✅ Hand gesture is detected (`gestureRef.current !== "none"`)

### Time Display Format

```javascript
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};
// Output: "MM:SS" format (e.g., "01:42" for 1 minute 42 seconds)
```

The timer is displayed in a floating box (`timer-box`) showing real-time elapsed time.

---

## 8. Error Calculation & Alignment Status

### Three Types of Error Metrics

#### 1. Position Error
```javascript
totalPositionError = |targetCubeDistance - playerCubeDistance|

where:
targetCubeDistance = √(targetX² + targetY² + targetZ²)
playerCubeDistance = √(playerX² + playerY² + playerZ²)
```

#### 2. Rotation Error
```javascript
totalRotationError = angleDiff(playerRotX, targetRotX) +
                     angleDiff(playerRotY, targetRotY) +
                     angleDiff(playerRotZ, targetRotZ)
```

#### 3. Corner Error
```javascript
// Distance between all 8 corresponding corners
totalCornerError = Σ(distance from playerCorner[i] to targetCorner[i])
                   for i = 0 to 7
```

### Alignment Status System

| Status | Condition | Color | Meaning |
|--------|-----------|-------|---------|
| **Perfect** | Position < 0.5 AND Rotation < 0.2 | 🟢 Green | Cube matched! Timer stops |
| **Near** | Position < 2 AND Rotation < 0.6 | 🟡 Yellow | Very close, almost aligned |
| **Far** | All others | 🔴 Red | Cube far from target |

---

## 9. HCI (Human-Computer Interaction) Principles

### 1. **Multimodal Input**
- Supports both **keyboard** and **gesture-based** input
- Users can choose their preferred interaction method
- Reduces strain by allowing switching between input modes

### 2. **Visual Feedback**
- **Color-coded target cube** (Red/Yellow/Green) shows progress
- **Corner markers** (8 colored spheres) visualize alignment
- **Grid helpers** provide spatial context
- **Bounding box** shows player cube boundaries
- **Real-time metrics** display on screen

### 3. **Intuitive Gesture Mapping**
- Gestures map naturally to actions:
  - Open palm = Move forward (natural pushing motion)
  - Closed fist = Move backward (natural pulling motion)
  - Hand height = Vertical rotation
  - Hand side = Horizontal rotation

### 4. **Mode Switching**
- **Separate modes** (Move/Rotate) reduce cognitive load
- **Simple key binding** (M/R) for mode switching
- **Clear visual indication** of current mode

### 5. **Real-Time Performance Metrics**
- **Timer** motivates completion and tracks performance
- **Error metrics** provide immediate feedback on alignment accuracy
- **Status indicators** clarify how close player is to winning

### 6. **Affordance & Discoverability**
- **Instructions panel** (☰ button) explains all controls
- **Keyboard hints** in UI (W/S, A/D, Q/E, etc.)
- **Reset button** provides clear recovery mechanism
- **Webcam preview** shows what hand gestures are being detected

### 7. **Accessibility**
- **Keyboard-only option**: Users without webcam/hands can still play
- **Gesture-only option**: Users who prefer hands-free can disable keyboard
- **Responsive UI** adapts to different screen sizes

### 8. **Constraint-Based Design**
- **Constrained movement speed** (0.18 units/frame) prevents jerky motion
- **Constrained rotation speed** (0.023 rad/frame) allows precise control
- **Damped camera controls** smooth interaction

---

## 10. Cube Vertices & Corner Markers

### Corner Detection Algorithm

```javascript
const getCorners = (cube) => {
  const pos = cube.geometry.attributes.position;
  const unique = new Set();
  const result = [];

  // Extract all vertices from geometry
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    
    // Transform to world coordinates
    v.applyMatrix4(cube.matrixWorld);
    
    // Remove duplicates (rounded to 3 decimal places)
    const key = `${v.x.toFixed(3)}_${v.y.toFixed(3)}_${v.z.toFixed(3)}`;
    
    if (!unique.has(key)) {
      unique.add(key);
      result.push(v);
    }
  }
  
  return result.slice(0, 8);  // Return exactly 8 unique corners
};
```

### Color-Coded Corners

```javascript
cornerColors = [
  0xff0000,  // Red
  0xff7f00,  // Orange
  0xffff00,  // Yellow
  0x00ff00,  // Green
  0x0000ff,  // Blue
  0x4b0082,  // Indigo
  0x8f00ff,  // Violet
  0x40e0d0   // Turquoise
];
```

Each corner is marked with a 0.25-unit radius sphere, positioned at the actual corner coordinates in real-time. This helps visualize cube alignment accuracy.

---

## 11. Cube Specifications

### Player Cube
- **Geometry**: 7×7×7 units
- **Materials**: Colored by face (Red front, Green top, Blue right, etc.)
- **Starting Position**: Origin (0, 0, 0)
- **Starting Rotation**: No rotation (0, 0, 0)
- **Max Speed**: 0.18 units/frame

### Target Cube
- **Geometry**: 8×8×8 units (slightly larger)
- **Material**: White, semi-transparent (opacity 0.85)
- **Position**: Random within 15×15×15 space
- **Rotation**: Random in all axes
- **Color Feedback**: Changes based on alignment status

---

## 12. Performance & Optimization

- **RequestAnimationFrame**: Smooth 60 FPS rendering
- **Damping Controls**: Smooth camera transitions
- **Resource Disposal**: Proper cleanup of Three.js geometries, materials, and renderers
- **MediaPipe Optimization**: VIDEO mode for real-time performance
- **Two-Hand Support**: Handles up to 2 hands simultaneously (currently uses first hand)

---

## How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

---

## Project Structure

```
hoverable/
├── src/
│   ├── App.jsx           # Main application logic (6DOF control, gestures, timer)
│   ├── App.css           # Styling for UI components
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
└── README.md             # This file
```

---

## Credits

- **Three.js**: 3D graphics library
- **MediaPipe**: Hand gesture recognition
- **React**: UI framework
- **Vite**: Build tool

---

## Author
Created by Miss Humera Tariq for HCI-CG (Human-Computer Interaction & Computer Graphics)

## 3. Gesture Controls

MediaPipe detects hand landmarks from the webcam feed and maps gesture states to cube movement.

Implemented gesture mapping:

- Open palm → move forward
- Closed fist → move backward
- Index finger up → move left/right
- Pinky finger up → opposite X-axis movement
- First two fingers up → move up
- First three fingers up → move down

Gesture detection uses fingertip landmarks and finger state logic based on PIP joint positions. This allows the app to infer whether each finger is extended or closed, then translate that state into movement commands.

## 4. Real-Time Feedback System

The game provides continuous accuracy feedback through several systems:

- Position error calculation: measures distance between player and target cube positions
- Rotation error calculation: evaluates orientation difference across axes
- Corner distance comparison: compares vertex positions for visual alignment
- Status system with three levels:
  - `Far`
  - `Near`
  - `Perfect`
- Target cube color changes dynamically based on alignment accuracy

## 5. Performance Optimizations

Performance is a priority for smooth gameplay and webcam processing:

- `useRef` is used instead of `useState` for gesture updates to reduce render overhead
- `requestAnimationFrame` drives the animation loop for consistent frame timing
- Cleanup functions release resources for:
  - animation frames
  - webcam tracks
  - Three.js objects, materials, and geometries
- Renderer pixel ratio is optimized for display clarity without unnecessary GPU load

## 6. React Concepts Used

This project demonstrates React fundamentals through a component-driven UI:

- `useEffect`: manages side effects such as scene setup, MediaPipe initialization, and teardown
- `useState`: stores UI state like status text, error values, and gesture mode
- `useRef`: preserves mutable references across renders for Three.js objects, animation IDs, and gesture state
- Component-based UI panels: display controls, performance data, and game feedback in separate reusable sections

## 7. UI Layout

The UI is designed for clarity and usability:

- Overlay panels show controls and cube data
- Webcam preview is visible alongside the 3D canvas
- Responsive fullscreen canvas adapts to browser size
- Information panels provide instant feedback on position and rotation errors

## 8. Controls

### Keyboard Controls

| Action | Keys |
|---|---|
| Move forward | `W` / `ArrowUp` |
| Move backward | `S` / `ArrowDown` |
| Move left | `A` / `ArrowLeft` |
| Move right | `D` / `ArrowRight` |
| Move up | `R` |
| Move down | `F` |
| Pitch up | `I` |
| Pitch down | `K` |
| Yaw left | `J` |
| Yaw right | `L` |
| Roll left | `U` |
| Roll right | `O` |

### Gesture Controls

| Gesture | Effect |
|---|---|
| Open palm | Move forward |
| Closed fist | Move backward |
| Index finger up | Move left/right |
| Pinky finger up | Move opposite X-axis |
| First two fingers up | Move up |
| First three fingers up | Move down |

## 9. Installation Instructions

Install dependencies and run the development server from the `hoverable` folder:

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (`http://localhost:5173` by default).

## 10. Dependencies

### Runtime dependencies

- `react`
- `react-dom`
- `three`
- `react-webcam`
- `@mediapipe/camera_utils`
- `@mediapipe/hands`
- `@mediapipe/tasks-vision`

### Development dependencies

- `vite`
- `@vitejs/plugin-react`
- `eslint`
- `@eslint/js`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `@types/react`
- `@types/react-dom`
- `globals`

## 11. Future Improvements

Potential enhancements to extend this project:

- Gesture smoothing for more stable input
- Multiplayer mode with synchronized target matching
- AR/VR support with headset or mobile device rendering
- Object snapping and guided alignment aids
- Physics-based motion and collision responses
- Better mobile responsiveness and touch-friendly controls
- More gesture types for richer interaction

## Why This Project Matters

Hoverable is more than a gaming demo — it's a prototype for natural 3D interaction. By combining hand-tracking gestures with a real-time Three.js scene, the project highlights how modern web experiences can blend computer vision with spatial reasoning and intuitive control.

---

## Getting Started

1. Clone the repo
2. Install packages
3. Start the app
4. Allow webcam access
5. Match the cubes using keyboard and gestures
