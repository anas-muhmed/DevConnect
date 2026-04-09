# Docker Volumes & Networking - Production Concepts

## Part 1: Docker Volumes (Data Persistence)

### The Problem
**Containers are ephemeral (temporary)**. When you delete a container, all data inside is LOST.

```bash
docker compose down  # ❌ Without volumes = ALL DATA GONE
```

### The Solution: Volumes
Volumes are **Docker-managed storage** that lives OUTSIDE the container.

---

## Volume Types (Interview Question!)

### 1. Named Volumes (What MongoDB uses)

```yaml
mongodb:
  volumes:
    - mongo-data:/data/db  # Named volume

volumes:
  mongo-data:  # Docker creates & manages this
```

**How it works:**
- Docker creates a folder on your **host machine** (not in the container)
- Location: `/var/lib/docker/volumes/devconnect_mongo-data/_data`
- Survives `docker compose down`
- Only deleted with `docker compose down -v` (explicit volume delete)

**Use case:** Database storage, logs, anything you want Docker to manage

**Why MongoDB uses this:**
- Database files persist across restarts
- You restarted containers 3 times today - data survived ✅

---

### 2. Bind Mounts (What Backend uploads uses)

```yaml
backend:
  volumes:
    - ./backend/uploads:/usr/src/app/uploads  # Bind mount
```

**How it works:**
- **Direct mapping** between host folder and container folder
- Changes in `./backend/uploads` (host) → instantly reflected in container
- Changes in container → instantly reflected on host
- Two-way sync (real-time)

**Use case:** Development (hot reload), uploads, logs you want to see easily

**Why Backend uses this:**
- User uploads profile pictures → saved to `./backend/uploads` on host
- You can browse uploaded files directly in VS Code
- If container restarts, uploads still there

---

## Volume Comparison Table

| Feature | Named Volume | Bind Mount |
|---------|-------------|------------|
| **Management** | Docker manages | You manage |
| **Location** | `/var/lib/docker/volumes/` | Your project folder |
| **Cross-platform** | Yes (Docker handles path) | No (Windows/Linux paths differ) |
| **Performance** | Fast (Docker optimized) | Slightly slower on Windows |
| **Use Case** | Production data (DB) | Development files (uploads, logs) |
| **Survives `down`** | Yes | Yes (it's your folder!) |
| **Easy to browse** | No (need `docker volume inspect`) | Yes (just open folder) |

---

## Testing Volume Persistence

### Test 1: MongoDB data survives restart

```bash
# 1. Add data
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"pass123"}'

# 2. Stop containers
docker compose down

# 3. Start again
docker compose up -d

# 4. Check data still exists
curl http://localhost:5000/health  # Database: "connected" ✅
# Login should still work because user data persisted
```

**Why it works:** `mongo-data` volume preserved `/data/db`

---

### Test 2: Uploads survive restart

```bash
# 1. Upload a file (through your frontend or Postman)

# 2. Check it exists
ls ./backend/uploads/  # You'll see files

# 3. Restart containers
docker compose restart backend

# 4. File still there
ls ./backend/uploads/  # ✅ Same files
```

**Why it works:** Bind mount links real folder on host

---

## Volume Commands (DevOps Must-Know)

```bash
# List all volumes
docker volume ls

# See where volume is stored
docker volume inspect devconnect_mongo-data

# Remove specific volume (⚠️ deletes data!)
docker volume rm devconnect_mongo-data

# Remove ALL unused volumes
docker volume prune

# Remove volumes when stopping
docker compose down -v  # ⚠️ Deletes DB data!
```

**Interview Answer:**
> "I use named volumes for database persistence because Docker manages the lifecycle and it's production-safe. For development files like uploads, I use bind mounts for easy access and debugging."

---

## Part 2: Docker Networking

### The Problem
Containers are **isolated** by default. Backend can't talk to MongoDB without networking.

```
❌ Without Network:
[Backend Container] --X--> [MongoDB Container]
                    Can't reach each other
```

### The Solution: Docker Networks
Networks create a **virtual bridge** so containers can communicate.

---

## How Compose Networking Works

```yaml
services:
  mongodb:
    networks:
      - devconnect-network

  backend:
    networks:
      - devconnect-network

networks:
  devconnect-network:
    driver: bridge
```

**Magic that happens:**
1. Docker creates a virtual network: `devconnect_devconnect-network`
2. Both containers join this network
3. Docker's **built-in DNS** resolves service names

---

## Service Name = Hostname (KEY CONCEPT!)

Inside containers, service names become hostnames:

```javascript
// Backend .env.docker
MONGO_URI=mongodb://admin:password123@mongodb:27017/devconnect?authSource=admin
                                      // ↑↑↑↑↑↑↑
                                      // Service name from docker-compose.yml!
```

**What happens:**
1. Backend tries to connect to `mongodb:27017`
2. Docker DNS resolves `mongodb` → `172.19.0.2` (MongoDB container IP)
3. Connection succeeds ✅

**You can't use:**
- ❌ `localhost:27017` (localhost = backend container itself, not MongoDB)
- ❌ `127.0.0.1:27017` (same issue)
- ✅ `mongodb:27017` (service name - Docker resolves it)

---

## Network Drivers (Interview Question!)

### 1. Bridge (Default - What we use)

```yaml
networks:
  devconnect-network:
    driver: bridge
```

**How it works:**
- Docker creates a virtual network interface
- Containers get IPs like `172.19.0.2`, `172.19.0.3`
- Containers can talk to each other using service names
- Isolated from host network (secure)

**Use case:** Multi-container apps (what you have now)

---

### 2. Host Network

```yaml
backend:
  network_mode: "host"  # Use host's network directly
```

**How it works:**
- Container uses host machine's network directly
- No port mapping needed
- Container sees `localhost` as the actual host machine

**Use case:** High-performance scenarios, monitoring tools

**Downside:** Less isolation, port conflicts

---

### 3. None (No networking)

```yaml
backend:
  network_mode: "none"
```

**Use case:** Security-critical containers that shouldn't talk to anything

---

## Network Inspection Commands

```bash
# List networks
docker network ls

# Inspect our network
docker network inspect devconnect_devconnect-network

# Output shows:
# - Subnet: 172.19.0.0/16
# - Gateway: 172.19.0.1
# - Containers connected:
#   - devconnect-mongo: 172.19.0.2
#   - devconnect-backend: 172.19.0.3
```

---

## Port Mapping (Important!)

```yaml
backend:
  ports:
    - "5000:5000"
    # ↑↑↑↑  ↑↑↑↑
    # Host  Container
```

**Two types of access:**

### 1. Container-to-Container (Inside Docker network)
- Backend talks to MongoDB: `mongodb:27017` (no port mapping needed!)
- Uses internal network
- Fast, secure

### 2. Host-to-Container (From your machine)
- You access backend: `localhost:5000` (needs port mapping!)
- Maps container port to host port
- Exposes service to outside world

**Why MongoDB has port mapping:**
```yaml
mongodb:
  ports:
    - "27017:27017"  # Only for debugging with MongoDB Compass
```

Technically **not needed** for app to work! Backend uses `mongodb:27017` internally.

We expose it so you can use MongoDB Compass from your laptop:
```
MongoDB Compass → localhost:27017 → Docker port mapping → MongoDB container
```

---

## Network Security Best Practices

### 1. Only expose necessary ports

```yaml
# ❌ Bad: Exposing DB to internet
mongodb:
  ports:
    - "27017:27017"  # Public production server = security risk

# ✅ Good: No port mapping (internal only)
mongodb:
  # No ports mapping - only backend can access via network
```

### 2. Use custom networks (not default)

```yaml
# ✅ Good: Explicit network
networks:
  devconnect-network:  # Isolated from other projects
```

Docker's default bridge can have conflicts between projects.

---

## Real-World Example: Your Current Setup

```
┌─────────────────────────────────────────────────┐
│  Host Machine (Your Laptop)                     │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Docker Network: devconnect-network      │   │
│  │                                          │   │
│  │  ┌────────────────┐  ┌───────────────┐  │   │
│  │  │ MongoDB        │  │ Backend       │  │   │
│  │  │ IP: 172.19.0.2│←→│ IP: 172.19.0.3│  │   │
│  │  │ Port: 27017   │  │ Port: 5000    │  │   │
│  │  └───────┬────────┘  └───────┬───────┘  │   │
│  │          │                   │          │   │
│  │     Named Volume         Bind Mount     │   │
│  │     mongo-data          ./uploads       │   │
│  └──────────┼───────────────────┼──────────┘   │
│             ↓                   ↓              │
│    /var/lib/docker/volumes   ./backend/uploads │
│                                                 │
│  Port Mappings (Host → Container):             │
│    localhost:5000 → backend:5000               │
│    localhost:27017 → mongodb:27017             │
└─────────────────────────────────────────────────┘
```

**Communication flows:**

1. **Your browser → Backend:**
   - `localhost:5000` → Port mapping → Backend container
   
2. **Backend → MongoDB:**
   - `mongodb:27017` → Docker DNS → `172.19.0.2:27017`
   - No port mapping needed (internal network)
   
3. **MongoDB Compass → MongoDB:**
   - `localhost:27017` → Port mapping → MongoDB container

---

## Interview Questions You Can Answer Now

### Q1: "What's the difference between volumes and bind mounts?"

**Answer:**
> "Named volumes are Docker-managed storage for production data like databases - Docker handles the location and lifecycle. Bind mounts directly map host folders to containers, great for development when you need real-time file access. I use named volumes for MongoDB persistence and bind mounts for uploads I need to inspect during debugging."

---

### Q2: "How do containers communicate in Docker Compose?"

**Answer:**
> "Compose creates a custom bridge network and uses built-in DNS resolution. Service names become hostnames - so my backend connects to MongoDB using `mongodb:27017` instead of an IP address. Docker resolves the service name to the container's internal IP. This is production-safe because container IPs can change, but service names stay constant."

---

### Q3: "What happens to data when you run `docker compose down`?"

**Answer:**
> "Containers are deleted but volumes persist. Named volumes like my database storage survive because they're external to the container lifecycle. I'd need `docker compose down -v` to explicitly delete volumes. Bind mounts also survive because they're just host folders - they're not managed by Docker."

---

### Q4: "Why can't you use localhost to connect backend to MongoDB?"

**Answer:**
> "Because localhost inside a container refers to that container's network namespace, not the host or other containers. Each container has its own isolated network. I use the service name 'mongodb' which Docker's DNS resolves to the MongoDB container's IP on the shared bridge network."

---

## Commands to Master

```bash
# Network debugging
docker network ls
docker network inspect <network_name>
docker exec -it devconnect-backend ping mongodb  # Test DNS resolution

# Volume debugging
docker volume ls
docker volume inspect devconnect_mongo-data
docker exec -it devconnect-mongo ls -la /data/db  # Check DB files

# Check container IPs
docker inspect devconnect-backend | grep IPAddress
docker inspect devconnect-mongo | grep IPAddress

# Test internal connectivity
docker exec -it devconnect-backend curl mongodb:27017
# Should show MongoDB connection message

# Logs (crucial for debugging)
docker logs devconnect-backend
docker logs devconnect-mongo
docker compose logs -f  # Follow all logs
```

---

## Next Steps (Aligned to Resume)

Now that you understand volumes & networking, next phase:

1. **Deploy to Real Linux VPS** (AWS EC2 / DigitalOcean)
   - You'll use same Docker concepts on remote server
   - Plus: systemctl, ufw, SSH (resume skills)

2. **Add Nginx Reverse Proxy**
   - Nginx container in docker-compose.yml
   - SSL/HTTPS setup
   - Production-grade routing

3. **GitHub Actions CI/CD**
   - Auto-build Docker images
   - Push to Docker Hub
   - Deploy to VPS

Ready to move to **Linux VPS deployment** next?
