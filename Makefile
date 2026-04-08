IMAGE=mahelbir/cron-manager
VERSION=1.0.0

test:
	docker compose -f docker-compose.dev.yaml up --build --force-recreate

push:
	docker buildx build \
	  --platform linux/amd64,linux/arm64 \
	  -t $(IMAGE):$(VERSION) \
	  -t $(IMAGE):latest \
	  --push .