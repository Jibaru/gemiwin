package handlers

import (
	"net/http"

	"gemiwin/api/internal/domain"
	"gemiwin/api/internal/services"

	"github.com/gin-gonic/gin"
)

// UpdateChatConfig handles PUT /chats/:id/config to update per-chat configuration.
func UpdateChatConfig(service *services.ChatService) gin.HandlerFunc {
	return func(c *gin.Context) {
		chatID := c.Param("id")

		var req domain.ChatConfig
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		chat, err := service.UpdateChatConfig(chatID, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if chat == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Chat not found"})
			return
		}

		c.JSON(http.StatusOK, chat)
	}
}
