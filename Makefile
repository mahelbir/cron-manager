IMAGE=mahelbir/cron-manager
VERSION=2.0.0

dev:
	docker compose -f docker-compose.dev.yaml up -d --build --force-recreate

push:
	docker buildx build \
	  --platform linux/amd64,linux/arm64 \
	  -t $(IMAGE):$(VERSION) \
	  -t $(IMAGE):latest \
	  --push .