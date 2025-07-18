package handlers

import (
	"net/http"
	"strconv"

	"gemiwin/api/internal/services"

	"github.com/gin-gonic/gin"
)

func DeleteMessagesFromChat(service *services.ChatService) gin.HandlerFunc {
	return func(c *gin.Context) {
		chatID := c.Param("id")
		indexParam := c.Param("index")

		idx, err := strconv.Atoi(indexParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message index"})
			return
		}

		chat, err := service.DeleteMessagesFromIndex(chatID, idx)
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
