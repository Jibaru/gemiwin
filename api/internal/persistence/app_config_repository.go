package persistence

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"

	"gemiwin/api/internal/domain"
)

const appConfigFile = "data/app_config.json"

// AppConfigRepository handles persistence of the global AppConfig.
type AppConfigRepository struct{}

// NewAppConfigRepository returns a new instance of AppConfigRepository.
func NewAppConfigRepository() *AppConfigRepository {
	return &AppConfigRepository{}
}

// Save writes the provided configuration to disk in JSON format.
func (r *AppConfigRepository) Save(cfg *domain.AppConfig) error {
	// Ensure the data directory exists
	if err := os.MkdirAll(filepath.Dir(appConfigFile), 0755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	return ioutil.WriteFile(appConfigFile, data, 0644)
}

// Load retrieves the configuration from disk. If no configuration exists, it returns an empty AppConfig instance.
func (r *AppConfigRepository) Load() (*domain.AppConfig, error) {
	data, err := ioutil.ReadFile(appConfigFile)
	if err != nil {
		if os.IsNotExist(err) {
			// Return default empty configuration when the file doesn't exist
			return &domain.AppConfig{}, nil
		}
		return nil, err
	}

	var cfg domain.AppConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}
