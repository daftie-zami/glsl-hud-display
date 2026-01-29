import QtQuick

Window {
    width: 1280
    height: 720
    visible: true
    title: qsTr("OSD")
    color: "black"
    //flags: Qt.FramelessWindowHint
    
    OSDOverlay {
        anchors.fill: parent
        
        yaw: 45
        pitch: 10
        roll: -5
        altitude: 1500
        speed: 250
        
        targetLocked: true
        targetX: 0.6
        targetY: 0.4
    }
}
