package services

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gemiwin/api/internal/domain"
	"gemiwin/api/internal/persistence"

	"github.com/google/uuid"
	pdf "github.com/ledongthuc/pdf"
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
		Type:      "text",
		Content:   content,
		Document:  nil,
		Timestamp: time.Now(),
	}
	chat.Messages = append(chat.Messages, userMessage)

	botResponse, err := s.bot.GetBotResponse(chat)
	if err != nil {
		return nil, err
	}

	botMessage := domain.Message{
		Role:      domain.BotRole,
		Type:      "text",
		Content:   botResponse,
		Document:  nil,
		Timestamp: time.Now(),
	}
	chat.Messages = append(chat.Messages, botMessage)

	if err := s.repo.Update(chat); err != nil {
		return nil, err
	}
	return chat, nil
}

// AddFileToChat adds a file as a message. If id is empty, a new chat is created.
func (s *ChatService) AddFileToChat(id string, userContent string, fileName string, fileBytes []byte) (*domain.Chat, string, error) {
	// Step 1: get or create chat
	defaultName := userContent
	if defaultName == "" {
		defaultName = fileName
	}

	chat, err := s.getOrCreateChat(id, defaultName)
	if err != nil || chat == nil {
		return chat, "", err
	}

	// Step 2: persist file to disk
	storedFileName, destPath, docURL, err := s.storeFile(fileName, fileBytes)
	if err != nil {
		return nil, "", err
	}

	// Step 3: extract textual content (if any)
	content := s.extractContent(destPath, filepath.Ext(fileName), fileBytes)

	// Step 4: compose document metadata
	document := &domain.Document{
		ID:      storedFileName,
		Name:    fileName,
		URL:     docURL,
		Content: content,
	}

	// Step 5: append user message with document. The message content comes from the request.
	userMessage := domain.Message{
		Role:      domain.UserRole,
		Type:      "doc",
		Content:   userContent,
		Document:  document,
		Timestamp: time.Now(),
	}
	chat.Messages = append(chat.Messages, userMessage)

	// Step 6: let bot respond
	botResponse, err := s.bot.GetBotResponse(chat)
	if err != nil {
		return nil, "", err
	}

	botMessage := domain.Message{
		Role:      domain.BotRole,
		Type:      "text",
		Content:   botResponse,
		Document:  nil,
		Timestamp: time.Now(),
	}
	chat.Messages = append(chat.Messages, botMessage)

	if err := s.repo.Update(chat); err != nil {
		return nil, "", err
	}

	return chat, storedFileName, nil
}

// getOrCreateChat returns the existing chat or creates a new one when id is empty.
func (s *ChatService) getOrCreateChat(id string, defaultName string) (*domain.Chat, error) {
	var chat *domain.Chat

	if id == "" {
		chat = &domain.Chat{
			ID:        uuid.New().String(),
			Name:      defaultName,
			CreatedAt: time.Now(),
			Messages:  []domain.Message{},
		}
		if err := s.repo.Create(chat); err != nil {
			return nil, err
		}
		return chat, nil
	}

	chat, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return chat, nil
}

// storeFile saves the uploaded bytes to disk and returns useful metadata.
func (s *ChatService) storeFile(originalName string, data []byte) (storedFileName, filePath, docURL string, err error) {
	filesDir := "data/files"
	if err = os.MkdirAll(filesDir, 0755); err != nil {
		return
	}

	ext := filepath.Ext(originalName)
	storedFileName = uuid.New().String() + ext
	filePath = filepath.Join(filesDir, storedFileName)

	if err = ioutil.WriteFile(filePath, data, 0644); err != nil {
		return
	}

	docURL = "/files/" + storedFileName
	return
}

// extractContent derives textual content from common text-based files or PDFs.
func (s *ChatService) extractContent(filePath string, ext string, data []byte) string {
	ext = strings.ToLower(ext)
	textExts := map[string]bool{".txt": true, ".md": true, ".markdown": true, ".json": true, ".yaml": true, ".yml": true, ".xml": true, ".csv": true, ".go": true, ".js": true, ".ts": true, ".py": true, ".java": true, ".c": true, ".cpp": true, ".rb": true, ".rs": true}

	if textExts[ext] {
		return string(data)
	}

	if ext == ".pdf" {
		if _, r, err := pdf.Open(filePath); err == nil {
			var sb strings.Builder
			for pageIndex := 1; pageIndex <= r.NumPage(); pageIndex++ {
				p := r.Page(pageIndex)
				if p.V.IsNull() {
					continue
				}
				txt, _ := p.GetPlainText(nil)
				sb.WriteString(txt)
			}
			return sb.String()
		}
	}

	return ""
}

func (s *ChatService) DeleteChatByID(id string) error {
	return s.repo.Delete(id)
}

func (s *ChatService) ListChats() ([]*domain.Chat, error) {
	return s.repo.FindAll()
}

// DeleteMessagesFromIndex removes the message at the given index and all subsequent messages.
// It returns the updated chat or nil if the chat does not exist.
func (s *ChatService) DeleteMessagesFromIndex(id string, index int) (*domain.Chat, error) {
	chat, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if chat == nil {
		return nil, nil
	}

	if index < 0 || index >= len(chat.Messages) {
		return nil, fmt.Errorf("message index out of range")
	}

	// Keep messages before the specified index
	chat.Messages = chat.Messages[:index]

	if err := s.repo.Update(chat); err != nil {
		return nil, err
	}

	return chat, nil
}
