package handlers

import (
	"net/http"

	"gemiwin/api/internal/services"

	"github.com/gin-gonic/gin"
)

func DeleteChat(service *services.ChatService) gin.HandlerFunc {
	return func(c *gin.Context) {
		chatID := c.Param("id")

		if err := service.DeleteChatByID(chatID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete chat"})
			return
		}

		c.JSON(http.StatusNoContent, nil)
	}
}
