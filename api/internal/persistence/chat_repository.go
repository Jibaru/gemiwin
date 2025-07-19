package persistence

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"gemiwin/api/internal/domain"
)

const dataDir = "data/chats"

type ChatRepository struct{}

func NewChatRepository() *ChatRepository {
	// Ensure chat directory exists to avoid errors when reading or writing files.
	_ = os.MkdirAll(dataDir, 0755)
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

func (r *ChatRepository) FindAll() ([]*domain.Chat, error) {
	files, err := ioutil.ReadDir(dataDir)
	if err != nil {
		return make([]*domain.Chat, 0), err
	}

	chats := make([]*domain.Chat, 0)
	for _, file := range files {
		if !file.IsDir() && filepath.Ext(file.Name()) == ".json" {
			chat, err := r.FindByID(strings.TrimSuffix(file.Name(), ".json"))
			if err != nil {
				// Decide if you want to skip faulty files or return an error
				continue
			}
			if chat != nil {
				chats = append(chats, chat)
			}
		}
	}
	return chats, nil
}

func (r *ChatRepository) save(chat *domain.Chat) error {
	data, err := json.MarshalIndent(chat, "", "  ")
	if err != nil {
		return err
	}

	filePath := filepath.Join(dataDir, chat.ID+".json")
	return ioutil.WriteFile(filePath, data, 0644)
}
