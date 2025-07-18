package persistence

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"

	"gemiwin/api/internal/domain"
)

const dataDir = "data"

type ChatRepository struct{}

func NewChatRepository() *ChatRepository {
	return &ChatRepository{}
}

func (r *ChatRepository) Create(chat *domain.Chat) error {
	return r.save(chat)
}

func (r *ChatRepository) FindByID(id string) (*domain.Chat, error) {
	filePath := filepath.Join(dataDir, id+".json")
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil // Not found
		}
		return nil, err
	}

	var chat domain.Chat
	if err := json.Unmarshal(data, &chat); err != nil {
		return nil, err
	}
	return &chat, nil
}

func (r *ChatRepository) Update(chat *domain.Chat) error {
	return r.save(chat)
}

func (r *ChatRepository) Delete(id string) error {
	filePath := filepath.Join(dataDir, id+".json")
	return os.Remove(filePath)
}

func (r *ChatRepository) save(chat *domain.Chat) error {
	data, err := json.MarshalIndent(chat, "", "  ")
	if err != nil {
		return err
	}

	filePath := filepath.Join(dataDir, chat.ID+".json")
	return ioutil.WriteFile(filePath, data, 0644)
}
