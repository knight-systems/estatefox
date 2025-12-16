# Changelog

All notable changes to Estatefox will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dev/prod deployment strategy with GitHub Environments
- Automated release notes generation
- Release convenience script (`scripts/release.sh`)

### Changed
- Main branch now auto-deploys to dev environment
- Production deploys require manual approval via version tags

## [v0.1.0] - 2024-XX-XX

### Added
- Initial release
- Property listing and search
- User authentication
- API backend with FastAPI
- Mobile app with Expo
- Web app deployment to AWS S3 + CloudFront

[Unreleased]: https://github.com/knight-systems/estatefox/compare/v0.1.0...HEAD
[v0.1.0]: https://github.com/knight-systems/estatefox/releases/tag/v0.1.0
