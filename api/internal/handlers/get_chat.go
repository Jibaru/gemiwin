package handlers

import (
	"net/http"

	"gemiwin/api/internal/services"

	"github.com/gin-gonic/gin"
)

func GetChat(service *services.ChatService) gin.HandlerFunc {
	return func(c *gin.Context) {
		chatID := c.Param("id")

		chat, err := service.GetChatByID(chatID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get chat"})
			return
		}
		if chat == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Chat not found"})
			return
		}

		c.JSON(http.StatusOK, chat)
	}
}
