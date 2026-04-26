# Hoverable

## Overview

`hoverable` is an interactive React + Three.js web app that demonstrates 3D object manipulation and spatial interaction. The project is designed to explore human-computer interaction (HCI) concepts through a simple, hover-based interface.

## Why 6 Degrees of Freedom Matters

In HCI, 6 degrees of freedom (6DoF) refers to the full range of motion available to an object in three-dimensional space:

- **Translation** along the x, y, and z axes:
  - Move left/right
  - Move up/down
  - Move forward/backward
- **Rotation** around the x, y, and z axes:
  - Roll
  - Pitch
  - Yaw

For interactive systems, 6DoF is a core concept because it defines how users perceive and control objects within virtual environments, augmented reality, and 3D user interfaces.

## HCI Relevance

This project connects 6DoF with HCI principles by focusing on:

- **Spatial awareness:** Users learn how objects exist in 3D space and how movement in different directions affects interaction.
- **Direct manipulation:** Hovering and moving objects mimics natural gestures, making interfaces more intuitive.
- **Affordances:** Visual and interaction cues show what actions are possible, reducing cognitive load for users.
- **Feedback:** Immediate visual changes provide users with confirmation of their actions and help them understand the relationship between input and motion.

## Project Features

- Responsive 3D scene built with Three.js
- Object highlights on hover
- Intuitive interaction patterns for moving and rotating the cube
- React-based UI for fast development and experimentability

## Installation

From the `hoverable` folder:

```bash
npm install
```

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

## Learn More

This repository is a good starting point for exploring how 3D interaction maps to HCI design choices. Consider extending it by adding:

- support for full 6DoF controls
- VR/AR input handling
- gesture-based interaction
- user testing data and usability metrics
