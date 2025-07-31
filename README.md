# LEGO Price Agent

A full-stack web application for tracking and analyzing LEGO set prices, providing price recommendations and market insights.

## 🏗️ Project Structure

```
lego-price-agent/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── scraper/        # Web scraping modules
│   │   ├── recommender/    # Price recommendation algorithms
│   │   ├── api/           # API endpoints
│   │   └── database/      # Database models and migrations
│   ├── tests/             # Backend tests
│   └── requirements.txt   # Python dependencies
├── frontend/              # React TypeScript frontend
│   ├── src/              # Source code
│   ├── tests/            # Frontend tests
│   │   └── test_playwright.spec.ts
│   └── package.json      # Node.js dependencies
├── .cursor/              # AI prompt files (można tu dodać pliki promptów AI)
├── docker-compose.yml    # Docker orchestration
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd lego-price-agent
```

2. Start all services:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Features

- **Web Scraping**: Automated collection of LEGO set prices from various sources
- **Price Analysis**: Historical price tracking and trend analysis
- **Recommendations**: AI-powered price recommendations
- **Market Insights**: Comprehensive market analysis and reports
- **User Interface**: Modern, responsive web interface

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 API Endpoints

- `GET /api/sets` - Get all LEGO sets
- `GET /api/sets/{set_id}` - Get specific set details
- `GET /api/sets/{set_id}/prices` - Get price history
- `POST /api/recommendations` - Get price recommendations
- `GET /api/analysis` - Get market analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository. 