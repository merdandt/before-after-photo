.PHONY: help local deploy deploy_local deploy_cloud_run

# Colors
GREEN  := \033[0;32m
YELLOW := \033[1;33m
BLUE   := \033[0;34m
NC     := \033[0m # No Color

# Configuration
SERVICE_NAME := before-after-photo
PORT := 8080

help:
	@echo "$(BLUE)========================================$(NC)"
	@echo "$(BLUE)  Before/After Photo - Deployment$(NC)"
	@echo "$(BLUE)========================================$(NC)"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@echo "  $(YELLOW)make local$(NC)             - Run development server locally with npm"
	@echo "  $(YELLOW)make deploy_local$(NC)      - Same as 'make local'"
	@echo "  $(YELLOW)make deploy_cloud_run$(NC)  - Deploy to GCP Cloud Run (project: salesshortcut)"
	@echo "  $(YELLOW)make deploy$(NC)            - Same as 'make deploy_cloud_run'"
	@echo "  $(YELLOW)make help$(NC)              - Show this help message"
	@echo ""

local:
	@echo "$(BLUE)Starting local deployment...$(NC)"
	@chmod +x deploy_local.sh
	@./deploy_local.sh

deploy_cloud_run:
	@echo "$(BLUE)Starting GCP Cloud Run deployment...$(NC)"
	@chmod +x deploy_cloud_run.sh
	@./deploy_cloud_run.sh

deploy: deploy_cloud_run

# Default target
.DEFAULT_GOAL := help

deploy_local:
	@echo "$(BLUE)Starting local deployment...$(NC)"
	@chmod +x deploy_local.sh
	@./deploy_local.sh
