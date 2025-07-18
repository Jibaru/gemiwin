package server

import (
	"gemiwin/api/internal/handlers"
	"gemiwin/api/internal/middlewares"
	"gemiwin/api/internal/persistence"
	"gemiwin/api/internal/services"

	"github.com/gin-gonic/gin"
)

func New() *gin.Engine {
	r := gin.Default()

	r.Use(middlewares.CORSMiddleware())

	// Serve uploaded files statically
	r.Static("/files", "./data/files")

	chatRepo := persistence.NewChatRepository()
	botService := services.NewBotService()
	chatService := services.NewChatService(chatRepo, botService)

	// Initialize AppConfig dependencies
	appConfigRepo := persistence.NewAppConfigRepository()
	appConfigService := services.NewAppConfigService(appConfigRepo)

	r.GET("/chats", handlers.ListChats(chatService))
	r.POST("/chats", handlers.SendMessage(chatService))
	r.GET("/chats/:id", handlers.GetChat(chatService))
	r.POST("/chats/:id/messages", handlers.AddMessageToChat(chatService))
	r.POST("/chats/files", handlers.UploadFileToChat(chatService))
	r.POST("/chats/:id/files", handlers.UploadFileToChat(chatService))
	r.DELETE("/chats/:id", handlers.DeleteChat(chatService))
	r.DELETE("/chats/:id/messages/:index", handlers.DeleteMessagesFromChat(chatService))

	// Update chat-specific configuration
	r.PUT("/chats/:id/config", handlers.UpdateChatConfig(chatService))

	// Endpoint for retrieving global configuration
	r.GET("/config", handlers.GetAppConfig(appConfigService))
	// Endpoint for updating global configuration
	r.PUT("/config", handlers.UpdateAppConfig(appConfigService))

	return r
}
