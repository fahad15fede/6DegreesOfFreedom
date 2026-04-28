# Hoverable

## Overview

`Hoverable` is an interactive 3D experiment built with React and Three.js designed to help users learn and practice the concepts of 6 degrees of freedom (6DoF) in three-dimensional space. Through direct manipulation of a virtual cube, users can explore spatial positioning, rotation, and alignment in an intuitive, visual environment.

## Live Demo

Check the deployed demo at:

- https://6-degrees-of-freedom.vercel.app/

## Learning Objectives

This experiment helps you understand:

- **6 Degrees of Freedom (6DoF)**: The complete range of motion in 3D space
- **Translation (Position)**:
  - **Sway**: Movement along the lateral (X) axis (left/right)
  - **Heave**: Movement along the vertical (Y) axis (up/down)
  - **Surge**: Movement along the longitudinal (Z) axis (forward/backward)
- **Rotation (Orientation)**:
  - **Pitch**: Rotation around the lateral (X) axis
  - **Yaw**: Rotation around the vertical (Y) axis
  - **Roll**: Rotation around the longitudinal (Z) axis

## How to Use the Experiment

The experiment presents you with two cubes in a 3D scene:

- **Player Cube**: A colored cube you control (red, green, blue faces indicate orientation)
- **Target Cube**: A semi-transparent white cube with a random position and rotation

Your task is to manipulate the player cube to match the target's spatial properties. Use the information panels to guide your adjustments:

1. **Position Matching**: Adjust the player cube's position to minimize the "Position Error" (difference in distance from origin)
2. **Rotation Matching**: Rotate the player cube to align with the target's orientation, reducing "Rotation Error"
3. **Visual Alignment**: Use the colored corner spheres to visually align the cubes
4. **Status Feedback**: Monitor the status indicator:
   - "Far": Significant misalignment in position or rotation
   - "Near": Close to alignment
   - "Perfect": Successfully matched position and rotation

The experiment provides real-time feedback through numerical error values and status updates, helping you develop spatial intuition and control precision.

## Controls

### Translation Controls
- **Q/E**: Surge (forward/backward movement along Z-axis)
- **A/D**: Sway (left/right movement along X-axis)
- **W/S**: Heave (up/down movement along Y-axis)

### Rotation Controls
- **I/K**: Pitch (rotation around X-axis)
- **J/L**: Yaw (rotation around Y-axis)
- **U/O**: Roll (rotation around Z-axis)

### Camera Controls
- **Drag**: Rotate camera view
- **Scroll**: Zoom in/out

## Features

- Real-time 3D visualization with Three.js
- Precise control over 6DoF movement
- Visual feedback with corner markers
- Quantitative error measurements
- Educational information panels
- Randomized target configurations

## HCI Relevance

This experiment demonstrates key HCI principles:

- **Spatial Cognition**: Building mental models of 3D space
- **Motor Learning**: Developing fine motor control for 3D interfaces
- **Feedback Design**: Using visual and numerical cues for user guidance
- **Direct Manipulation**: Immediate, predictable responses to user input

## Installation

From the `hoverable` folder:

```bash
npm install
npm run dev
```

Open your browser to `http://localhost:5173` (or the port shown in terminal).

## Technologies

- React
- Three.js
- Vite
- JavaScript/ES6

## Running Locally

Start the development server:

```bash
npm run dev
```

Then open the provided local URL in your browser.

## Build and Preview

Build the app for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Recommended System

For the best experience, use a laptop or desktop computer rather than a mobile device. A larger screen and precise pointer control help with spatial interaction and object manipulation.

Minimum system requirements:

- OS: Windows 10/11, macOS, or Linux
- CPU: Dual-core processor or better
- RAM: 8 GB minimum
- Browser: Latest version of Chrome, Edge, or Firefox
- GPU: Modern integrated graphics or discrete GPU with WebGL support

## Learn More

This repository is a good starting point for exploring how 3D interaction maps to HCI design choices. Consider extending it by adding:

- support for full 6DoF controls
- VR/AR input handling
- gesture-based interaction
- user testing data and usability metrics
