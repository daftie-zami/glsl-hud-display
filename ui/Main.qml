import QtQuick

Window {
    width: 1280
    height: 720
    visible: true
    title: qsTr("OSD")
    color: "black"
    flags: Qt.FramelessWindowHint
    
    OSDOverlay {
        anchors.fill: parent
        focus: true
        Keys.onEscapePressed: Qt.quit()
        
        yaw: 0 + Math.sin(time * 0.5) * 30
        pitch: 0 + Math.cos(time * 0.7) * 15
        roll: 0 + Math.sin(time * 0.3) * 10
        altitude: 0 + Math.sin(time * 0.2) * 500
        speed: 0 + Math.cos(time * 0.4) * 50
        
        targetLocked: true
        targetX: 0.6 + Math.sin(time * 0.8) * 0.2
        targetY: 0.4 + Math.cos(time * 0.6) * 0.2
        
        property real time: 0
        
        Timer {
            interval: 16  // ~60 FPS
            running: true
            repeat: true
            onTriggered: parent.time += 0.016
        }
    }
}
