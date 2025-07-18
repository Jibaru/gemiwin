package handlers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"gemiwin/api/internal/domain"
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

		// Optional config field (JSON) for new chat creation
		var cfg *domain.ChatConfig
		if chatID == "" {
			configStr := c.PostForm("config")
			if configStr != "" {
				var parsed domain.ChatConfig
				if err := json.Unmarshal([]byte(configStr), &parsed); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid config JSON"})
					return
				}
				cfg = &parsed
			}
		}

		chat, _, err := service.AddFileToChat(chatID, userContent, header.Filename, bytes, cfg)
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
