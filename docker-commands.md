# Docker Commands for LEGO Price Agent

## Development Mode

### Start all services
```bash
docker-compose up --build
```

### Start in background
```bash
docker-compose up -d --build
```

### View logs
```bash
docker-compose logs -f
```

### View specific service logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes
```bash
docker-compose down -v
```

## Production Mode

### Start production services
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Start production in background
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Stop production services
```bash
docker-compose -f docker-compose.prod.yml down
```

## Individual Service Management

### Rebuild specific service
```bash
docker-compose build backend
docker-compose build frontend
```

### Restart specific service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Execute commands in running containers
```bash
docker-compose exec backend python -m pytest
docker-compose exec frontend npm test
```

## Database Operations

### Access PostgreSQL
```bash
docker-compose exec db psql -U postgres -d lego_price_agent
```

### Backup database
```bash
docker-compose exec db pg_dump -U postgres lego_price_agent > backup.sql
```

### Restore database
```bash
docker-compose exec -T db psql -U postgres -d lego_price_agent < backup.sql
```

## Troubleshooting

### Check service status
```bash
docker-compose ps
```

### Check network connectivity
```bash
docker network ls
docker network inspect lego-price-agent_lego-network
```

### Clean up Docker resources
```bash
docker system prune -a
docker volume prune
```

## Access Points

- **Frontend (Development)**: http://localhost:3000
- **Frontend (Production)**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379 