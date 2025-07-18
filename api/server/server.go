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

	r.GET("/chats", handlers.ListChats(chatService))
	r.POST("/chats", handlers.SendMessage(chatService))
	r.GET("/chats/:id", handlers.GetChat(chatService))
	r.POST("/chats/:id/messages", handlers.AddMessageToChat(chatService))
	r.POST("/chats/files", handlers.UploadFileToChat(chatService))
	r.POST("/chats/:id/files", handlers.UploadFileToChat(chatService))
	r.DELETE("/chats/:id", handlers.DeleteChat(chatService))
	r.DELETE("/chats/:id/messages/:index", handlers.DeleteMessagesFromChat(chatService))

	return r
}
