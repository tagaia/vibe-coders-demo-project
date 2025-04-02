
.ONESHELL:

.PHONY: run-backend
run-backend:
	PYTHONPATH=src pdm run src/api/api.py


.PHONY: run-frontend
run-frontend:
	cd frontend && npm run dev
