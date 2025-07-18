package handlers

import (
	"io/ioutil"
	"net/http"

	"gemiwin/api/internal/services"

	"github.com/gin-gonic/gin"
)

func UploadFileToChat(service *services.ChatService) gin.HandlerFunc {
	return func(c *gin.Context) {
		chatID := c.Param("id")

		file, header, err := c.Request.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing file"})
			return
		}
		defer file.Close()

		bytes, err := ioutil.ReadAll(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
			return
		}

		userContent := c.PostForm("content")

		chat, _, err := service.AddFileToChat(chatID, userContent, header.Filename, bytes)
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
