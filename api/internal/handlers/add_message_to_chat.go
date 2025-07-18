package handlers

import (
	"net/http"

	"gemiwin/api/internal/services"

	"github.com/gin-gonic/gin"
)

func AddMessageToChat(service *services.ChatService) gin.HandlerFunc {
	return func(c *gin.Context) {
		chatID := c.Param("id")
		var req SendMessageRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		chat, err := service.AddMessageToChat(chatID, req.Content)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
			return
		}
		if chat == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Chat not found"})
			return
		}

		c.JSON(http.StatusOK, chat)
	}
}
