cmake_minimum_required(VERSION 3.16)

project(OSD VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_PREFIX_PATH "$ENV{HOME}/Qt/6.10.2/macos")

find_package(Qt6 REQUIRED COMPONENTS Quick Multimedia ShaderTools)

qt_standard_project_setup(REQUIRES 6.8)

qt_add_executable(apposd
    src/main.cpp
)

qt_add_qml_module(apposd
    URI osd
    QML_FILES
        ui/Main.qml
        ui/overlays/OSDOverlay.qml
    RESOURCES
        shaders/font.png
)

qt_add_shaders(apposd "hud_shaders"
    PREFIX "/"
    FILES
        shaders/osd/osd.vert
        shaders/osd/osd.frag
)

# Qt for iOS sets MACOSX_BUNDLE_GUI_IDENTIFIER automatically since Qt 6.1.
# If you are developing for iOS or macOS you should consider setting an
# explicit, fixed bundle identifier manually though.
set_target_properties(apposd PROPERTIES
#    MACOSX_BUNDLE_GUI_IDENTIFIER com.example.apposd
    MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
    MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}
    MACOSX_BUNDLE TRUE
    WIN32_EXECUTABLE TRUE
)

target_link_libraries(apposd
    PRIVATE Qt6::Quick
)

include(GNUInstallDirs)
install(TARGETS apposd
    BUNDLE DESTINATION .
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)
