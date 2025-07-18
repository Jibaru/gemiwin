package handlers

import (
	"net/http"

	"gemiwin/api/internal/services"

	"github.com/gin-gonic/gin"
)

func ListChats(service *services.ChatService) gin.HandlerFunc {
	return func(c *gin.Context) {
		chats, err := service.ListChats()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list chats"})
			return
		}

		c.JSON(http.StatusOK, chats)
	}
}
