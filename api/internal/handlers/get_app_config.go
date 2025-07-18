package handlers

import (
	"net/http"

	"gemiwin/api/internal/services"

	"github.com/gin-gonic/gin"
)

// GetAppConfig handles GET /config to return the current application configuration.
func GetAppConfig(service *services.AppConfigService) gin.HandlerFunc {
	return func(c *gin.Context) {
		cfg, err := service.GetConfig()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load configuration"})
			return
		}
		c.JSON(http.StatusOK, cfg)
	}
}
