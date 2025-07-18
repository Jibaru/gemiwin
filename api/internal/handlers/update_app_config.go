package handlers

import (
	"net/http"

	"gemiwin/api/internal/domain"
	"gemiwin/api/internal/services"

	"github.com/gin-gonic/gin"
)

// UpdateAppConfig handles PUT requests to update the global application configuration.
func UpdateAppConfig(service *services.AppConfigService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req domain.AppConfig
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		updatedCfg, err := service.UpdateConfig(&req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update configuration"})
			return
		}

		c.JSON(http.StatusOK, updatedCfg)
	}
}
