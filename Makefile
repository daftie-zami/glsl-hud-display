BUILD_DIR := build

.PHONY: all configure build run clean

all: build

build-dir:
	@mkdir -p $(BUILD_DIR)

configure: build-dir
	@cmake -S . -B $(BUILD_DIR)

build: configure
	@cmake --build $(BUILD_DIR)

run: build
	@cd $(BUILD_DIR) && (./apposd.app/Contents/MacOS/apposd 2>/dev/null || ./apposd.exe 2>/dev/null || ./Debug/apposd.exe 2>/dev/null || ./Release/apposd.exe 2>/dev/null || ./apposd)

clean:
	@cmake --build $(BUILD_DIR) --target clean