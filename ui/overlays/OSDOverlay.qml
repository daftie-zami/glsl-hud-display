import QtQuick

Item {
    id: root
    
    // HUD configuration
    property color hudColor: '#80e5e0'       // Primary HUD tint color
    property bool animated: true               // Enable/disable animations
    property real hudOpacity: 1.0              // Overall HUD opacity
    
    // Telemetry data inputs
    property real yaw: 0                       // Aircraft yaw (0-360)
    property real pitch: 0                     // Aircraft pitch (-90 to 90)
    property real roll: 0                      // Aircraft roll (-180 to 180)
    property real altitude: 0                  // Altitude in meters
    property real speed: 0                     // speed in km/h
    
    // Target tracking
    property bool targetLocked: false          // Target lock status
    property real targetX: 0.5                 // Target X position (0-1)
    property real targetY: 0.5                 // Target Y position (0-1)
    
    // Internal timer for shader animation
    property real elapsedTime: 0
    
    Timer {
        interval: 16  // ~60 FPS
        running: root.animated && root.visible
        repeat: true
        onTriggered: root.elapsedTime += 0.016
    }
    
    // Smooth transitions for telemetry values
    Behavior on yaw { NumberAnimation { duration: 100; easing.type: Easing.OutQuad } }
    Behavior on pitch { NumberAnimation { duration: 100; easing.type: Easing.OutQuad } }
    Behavior on roll { NumberAnimation { duration: 100; easing.type: Easing.OutQuad } }
    Behavior on altitude { NumberAnimation { duration: 100; easing.type: Easing.OutQuad } }
    Behavior on speed { NumberAnimation { duration: 100; easing.type: Easing.OutQuad } }
    
    // MSDF Font Atlas Texture
    Image {
        id: fontAtlasImage
        source: "qrc:/qt/qml/hud/shaders/audiowide.png"
        visible: false
        smooth: true
        mipmap: false
    }
    
    // Main HUD shader
    ShaderEffect {
        id: tacticalHud
        anchors.fill: parent
        opacity: root.hudOpacity
        
        // Font atlas texture
        property variant fontAtlas: fontAtlasImage
        
        // Shader uniforms
        property real iTime: root.elapsedTime
        property real aspectRatio: width / height
        property vector2d iResolution: Qt.vector2d(width, height)
        property vector2d padding: Qt.vector2d(0, 0)
        property vector4d hudColor: Qt.vector4d(
            root.hudColor.r,
            root.hudColor.g,
            root.hudColor.b,
            root.hudColor.a
        )
        
        // Telemetry uniforms for future use
        property real yaw: root.yaw
        property real pitch: root.pitch
        property real roll: root.roll
        property real altitude: root.altitude
        property real speed: root.speed
        
        vertexShader: "qrc:/shaders/osd/osd.vert.qsb"
        fragmentShader: "qrc:/shaders/osd/osd.frag.qsb"
    }
}
