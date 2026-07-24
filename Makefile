.PHONY: build build-all dev frontend clean install

BUILD_DIR := cmd/taskboard
BINARY := taskboard

build: frontend
	go build -o $(BINARY) ./$(BUILD_DIR)

DIST_DIR := dist
CROSS_TARGETS := \
	linux/amd64 \
	linux/arm64 \
	darwin/amd64 \
	darwin/arm64

build-all: frontend
	@mkdir -p $(DIST_DIR)
	@for target in $(CROSS_TARGETS); do \
		GOOS=$${target%/*} GOARCH=$${target#*/} \
		go build -o $(DIST_DIR)/$(BINARY)-$${target%/*}-$${target#*/} ./$(BUILD_DIR); \
	done

dev:
	go run ./$(BUILD_DIR) start --foreground

frontend:
	cd web && npm install && npm run build
	mkdir -p $(BUILD_DIR)/web/dist
	cp -r web/dist/* $(BUILD_DIR)/web/dist/

clean:
	rm -f $(BINARY)
	rm -rf $(BUILD_DIR)/web
	rm -rf web/dist web/node_modules
	rm -rf $(DIST_DIR)

install: build
	cp $(BINARY) /usr/local/bin/

dev-frontend:
	cd web && npm run dev

test:
	go test ./...
