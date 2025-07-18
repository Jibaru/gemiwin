package services

import (
	"gemiwin/api/internal/domain"
	"gemiwin/api/internal/persistence"
)

// AppConfigService provides business logic for managing the global AppConfig.
type AppConfigService struct {
	repo *persistence.AppConfigRepository
}

// NewAppConfigService constructs a new AppConfigService instance.
func NewAppConfigService(repo *persistence.AppConfigRepository) *AppConfigService {
	return &AppConfigService{repo: repo}
}

// GetConfig returns the current application configuration.
func (s *AppConfigService) GetConfig() (*domain.AppConfig, error) {
	return s.repo.Load()
}

// UpdateConfig merges and persists the provided configuration with any existing configuration.
// A non-empty field value replaces the existing one. An explicitly empty value clears it.
func (s *AppConfigService) UpdateConfig(newCfg *domain.AppConfig) (*domain.AppConfig, error) {
	existingCfg, err := s.repo.Load()
	if err != nil {
		return nil, err
	}

	existingCfg.GeminiApiKey = newCfg.GeminiApiKey

	if err := s.repo.Save(existingCfg); err != nil {
		return nil, err
	}
	return existingCfg, nil
}
