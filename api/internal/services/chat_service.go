package services

import (
	"time"

	"gemiwin/api/internal/domain"
	"gemiwin/api/internal/persistence"

	"github.com/google/uuid"
)

type ChatService struct {
	repo *persistence.ChatRepository
	bot  *BotService
}

func NewChatService(repo *persistence.ChatRepository, bot *BotService) *ChatService {
	return &ChatService{
		repo: repo,
		bot:  bot,
	}
}

func (s *ChatService) GetChatByID(id string) (*domain.Chat, error) {
	return s.repo.FindByID(id)
}

func (s *ChatService) AddMessageToChat(id string, content string) (*domain.Chat, error) {
	var chat *domain.Chat
	var err error

	if id == "" {
		chat = &domain.Chat{
			ID:        uuid.New().String(),
			Name:      content,
			CreatedAt: time.Now(),
			Messages:  []domain.Message{},
		}
		if err := s.repo.Create(chat); err != nil {
			return nil, err
		}
	} else {
		chat, err = s.repo.FindByID(id)
		if err != nil {
			return nil, err
		}
		if chat == nil {
			return nil, nil // Or return a specific not found error
		}
	}

	if len(chat.Messages) == 0 {
		chat.Name = content
	}

	userMessage := domain.Message{
		Role:      domain.UserRole,
		Content:   content,
		Timestamp: time.Now(),
	}
	chat.Messages = append(chat.Messages, userMessage)

	botResponse, err := s.bot.GetBotResponse(chat)
	if err != nil {
		return nil, err
	}

	botMessage := domain.Message{
		Role:      domain.BotRole,
		Content:   botResponse,
		Timestamp: time.Now(),
	}
	chat.Messages = append(chat.Messages, botMessage)

	if err := s.repo.Update(chat); err != nil {
		return nil, err
	}
	return chat, nil
}

func (s *ChatService) DeleteChatByID(id string) error {
	return s.repo.Delete(id)
}
