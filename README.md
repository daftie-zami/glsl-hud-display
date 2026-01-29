# OSD - Heads-Up Display

Tactical HUD overlay with real-time telemetry display built with Qt6 and custom GLSL shaders.

## Screenshot

![HUD Screenshot](docs/images/screenshot.png)

## Features

- Real-time telemetry (yaw, pitch, roll, altitude, speed)
- Custom shader effects with MSDF font rendering
- Target tracking system
- 144 FPS animations depends on Screen Refresh Rate

## Build

1. Open the project in **Qt Creator**
2. Configure the kit (Qt 6.8+ with CMake)
3. Click **Build** or press `Ctrl+B`
4. Run the application with `Ctrl+R`

**Requirements:** Qt 6.8+, Qt Creator, CMake 3.16+
