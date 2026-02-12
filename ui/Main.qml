import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Window {
    id: mainWindow
    width: 1280
    height: 720
    visible: true
    title: qsTr("OSD")
    color: "black"
    flags: Qt.FramelessWindowHint

    property bool useSliders: true
    property real animTime: 0

    Timer {
        interval: 16
        running: true
        repeat: true
        onTriggered: animTime += 0.016
    }

    OSDOverlay {
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.topMargin: useSliders ? 80 : 0
        anchors.bottom: parent.bottom
        Keys.onEscapePressed: Qt.quit()

        yaw: useSliders ? yawSlider.value : Math.sin(animTime * 0.5) * 30
        pitch: useSliders ? pitchSlider.value : Math.cos(animTime * 0.7) * 15
        roll: useSliders ? rollSlider.value : Math.sin(animTime * 0.3) * 10
        altitude: useSliders ? altSlider.value : Math.sin(animTime * 0.2) * 500
        speed: useSliders ? speedSlider.value : Math.cos(animTime * 0.4) * 50

        targetLocked: true
        targetX: 0.6 + Math.sin(animTime * 0.8) * 0.2
        targetY: 0.4 + Math.cos(animTime * 0.6) * 0.2
    }

    Rectangle {
        id: sliderPanel
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        height: 80
        color: "#1a1a2e"
        visible: useSliders

        MouseArea {
            anchors.fill: parent
            hoverEnabled: true
            acceptedButtons: Qt.NoButton
        }

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 20
            anchors.rightMargin: 20
            anchors.topMargin: 6
            anchors.bottomMargin: 6
            spacing: 20

            // Yaw
            ColumnLayout {
                spacing: 2
                Layout.fillWidth: true
                Text { text: "Yaw: " + yawSlider.value.toFixed(1) + "°"; color: "#80e5e0"; font.pixelSize: 12; font.bold: true }
                Slider {
                    id: yawSlider
                    Layout.fillWidth: true
                    Layout.preferredHeight: 40
                    from: -180; to: 180; value: 0; live: true
                    background: Rectangle {
                        x: yawSlider.leftPadding
                        y: yawSlider.topPadding + yawSlider.availableHeight / 2 - height / 2
                        implicitWidth: 200; implicitHeight: 4
                        width: yawSlider.availableWidth; height: 4; radius: 2; color: "#40808080"
                        Rectangle { width: yawSlider.visualPosition * parent.width; height: parent.height; radius: 2; color: "#80e5e0" }
                    }
                    handle: Rectangle {
                        x: yawSlider.leftPadding + yawSlider.visualPosition * (yawSlider.availableWidth - width)
                        y: yawSlider.topPadding + yawSlider.availableHeight / 2 - height / 2
                        implicitWidth: 20; implicitHeight: 20
                        width: 20; height: 20; radius: 10
                        color: yawSlider.pressed ? "#b0f0ec" : "#80e5e0"
                        border.color: "#1a1a2e"; border.width: 2
                    }
                }
            }

            // Pitch
            ColumnLayout {
                spacing: 2
                Layout.fillWidth: true
                Text { text: "Pitch: " + pitchSlider.value.toFixed(1) + "°"; color: "#80e5e0"; font.pixelSize: 12; font.bold: true }
                Slider {
                    id: pitchSlider
                    Layout.fillWidth: true
                    Layout.preferredHeight: 40
                    from: -90; to: 90; value: 0; live: true
                    background: Rectangle {
                        x: pitchSlider.leftPadding
                        y: pitchSlider.topPadding + pitchSlider.availableHeight / 2 - height / 2
                        implicitWidth: 200; implicitHeight: 4
                        width: pitchSlider.availableWidth; height: 4; radius: 2; color: "#40808080"
                        Rectangle { width: pitchSlider.visualPosition * parent.width; height: parent.height; radius: 2; color: "#80e5e0" }
                    }
                    handle: Rectangle {
                        x: pitchSlider.leftPadding + pitchSlider.visualPosition * (pitchSlider.availableWidth - width)
                        y: pitchSlider.topPadding + pitchSlider.availableHeight / 2 - height / 2
                        implicitWidth: 20; implicitHeight: 20
                        width: 20; height: 20; radius: 10
                        color: pitchSlider.pressed ? "#b0f0ec" : "#80e5e0"
                        border.color: "#1a1a2e"; border.width: 2
                    }
                }
            }

            // Roll
            ColumnLayout {
                spacing: 2
                Layout.fillWidth: true
                Text { text: "Roll: " + rollSlider.value.toFixed(1) + "°"; color: "#80e5e0"; font.pixelSize: 12; font.bold: true }
                Slider {
                    id: rollSlider
                    Layout.fillWidth: true
                    Layout.preferredHeight: 40
                    from: -180; to: 180; value: 0; live: true
                    background: Rectangle {
                        x: rollSlider.leftPadding
                        y: rollSlider.topPadding + rollSlider.availableHeight / 2 - height / 2
                        implicitWidth: 200; implicitHeight: 4
                        width: rollSlider.availableWidth; height: 4; radius: 2; color: "#40808080"
                        Rectangle { width: rollSlider.visualPosition * parent.width; height: parent.height; radius: 2; color: "#80e5e0" }
                    }
                    handle: Rectangle {
                        x: rollSlider.leftPadding + rollSlider.visualPosition * (rollSlider.availableWidth - width)
                        y: rollSlider.topPadding + rollSlider.availableHeight / 2 - height / 2
                        implicitWidth: 20; implicitHeight: 20
                        width: 20; height: 20; radius: 10
                        color: rollSlider.pressed ? "#b0f0ec" : "#80e5e0"
                        border.color: "#1a1a2e"; border.width: 2
                    }
                }
            }

            // Altitude
            ColumnLayout {
                spacing: 2
                Layout.fillWidth: true
                Text { text: "Alt: " + altSlider.value.toFixed(0) + " m"; color: "#80e5e0"; font.pixelSize: 12; font.bold: true }
                Slider {
                    id: altSlider
                    Layout.fillWidth: true
                    Layout.preferredHeight: 40
                    from: -1000; to: 1000; value: 0; live: true
                    background: Rectangle {
                        x: altSlider.leftPadding
                        y: altSlider.topPadding + altSlider.availableHeight / 2 - height / 2
                        implicitWidth: 200; implicitHeight: 4
                        width: altSlider.availableWidth; height: 4; radius: 2; color: "#40808080"
                        Rectangle { width: altSlider.visualPosition * parent.width; height: parent.height; radius: 2; color: "#80e5e0" }
                    }
                    handle: Rectangle {
                        x: altSlider.leftPadding + altSlider.visualPosition * (altSlider.availableWidth - width)
                        y: altSlider.topPadding + altSlider.availableHeight / 2 - height / 2
                        implicitWidth: 20; implicitHeight: 20
                        width: 20; height: 20; radius: 10
                        color: altSlider.pressed ? "#b0f0ec" : "#80e5e0"
                        border.color: "#1a1a2e"; border.width: 2
                    }
                }
            }

            // Speed
            ColumnLayout {
                spacing: 2
                Layout.fillWidth: true
                Text { text: "Spd: " + speedSlider.value.toFixed(0) + " km/h"; color: "#80e5e0"; font.pixelSize: 12; font.bold: true }
                Slider {
                    id: speedSlider
                    Layout.fillWidth: true
                    Layout.preferredHeight: 40
                    from: -100; to: 100; value: 0; live: true
                    background: Rectangle {
                        x: speedSlider.leftPadding
                        y: speedSlider.topPadding + speedSlider.availableHeight / 2 - height / 2
                        implicitWidth: 200; implicitHeight: 4
                        width: speedSlider.availableWidth; height: 4; radius: 2; color: "#40808080"
                        Rectangle { width: speedSlider.visualPosition * parent.width; height: parent.height; radius: 2; color: "#80e5e0" }
                    }
                    handle: Rectangle {
                        x: speedSlider.leftPadding + speedSlider.visualPosition * (speedSlider.availableWidth - width)
                        y: speedSlider.topPadding + speedSlider.availableHeight / 2 - height / 2
                        implicitWidth: 20; implicitHeight: 20
                        width: 20; height: 20; radius: 10
                        color: speedSlider.pressed ? "#b0f0ec" : "#80e5e0"
                        border.color: "#1a1a2e"; border.width: 2
                    }
                }
            }

            // Toggle butonu
            Button {
                Layout.preferredWidth: 80
                Layout.alignment: Qt.AlignVCenter
                text: "Anim"
                contentItem: Text {
                    text: parent.text; color: "#1a1a2e"; font.pixelSize: 11; font.bold: true
                    horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle { radius: 4; color: parent.hovered ? "#b0f0ec" : "#80e5e0" }
                onClicked: useSliders = false
            }
        }
    }

    Rectangle {
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: 8
        width: 36; height: 36; radius: 18
        color: "#1a1a2e"
        visible: !useSliders

        Text {
            anchors.centerIn: parent
            text: "☰"
            color: "#80e5e0"
            font.pixelSize: 18
        }

        MouseArea {
            anchors.fill: parent
            onClicked: useSliders = true
        }
    }

    Item {
        focus: true
        Keys.onEscapePressed: Qt.quit()
    }
}
