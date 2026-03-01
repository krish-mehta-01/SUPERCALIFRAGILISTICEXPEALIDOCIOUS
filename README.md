# Vehicle, Owner & Insurance Identity Management System

## Car Company Hackathon - Round 1 Submission

A comprehensive system for managing vehicle identities, verifying ownership, handling insurance relationships, and enforcing validity checks for connected vehicle platform interactions.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Usage Guide](#usage-guide)
8. [Screenshots](#screenshots)
9. [Deployment](#deployment)
10. [Team Information](#team-information)

---

## 🎯 Overview

This solution addresses the **"Vehicle, Owner & Insurance Identity Management"** task by creating a robust system that:

- **Manages Vehicle Identities**: Unique identification and registration tracking
- **Verifies Authorization**: Ensures only authorized vehicles interact with connected platforms
- **Handles Ownership**: Maintains complete ownership history and transfers
- **Manages Insurance**: Tracks insurance policies with validity enforcement
- **Enforces Validity Checks**: Multi-layer verification before platform access

### Problem Statement
> Design a system that manages vehicle identities and verifies whether a vehicle is authorized to interact with a connected vehicle platform. The solution should represent ownership and insurance relationships and enforce validity checks on vehicle interactions.

---

## ✨ Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **Vehicle Registration** | Complete vehicle profile with VIN, registration, make/model, engine/chassis numbers |
| **Owner Management** | Secure owner registration with identity verification |
| **Insurance Tracking** | Policy management with coverage details and validity periods |
| **Authorization Engine** | Multi-factor verification before platform access |
| **Audit Logging** | Complete history of all authorization attempts |
| **Dashboard Analytics** | Real-time statistics and monitoring |

### Verification Checks

The system enforces **three-layer validation**:

1. **Vehicle Validity**: Active status, valid registration
2. **Ownership Validity**: Current owner, active account
3. **Insurance Validity**: Active policy, not expired

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │    Forms     │  │   Tables     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (Express.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Vehicles   │  │    Owners    │  │   Insurance  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Verify     │  │    Logs      │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER (SQLite)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   vehicles   │  │    owners    │  │  insurance   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │vehicle_owner │  │     logs     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3 (lightweight, file-based)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing

---

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd vehicle-identity-management

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. For development (auto-restart)
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file:

```env
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

---

## 📚 API Documentation

### Vehicles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | List all vehicles |
| GET | `/api/vehicles/:id` | Get vehicle details |
| POST | `/api/vehicles` | Register new vehicle |

**POST /api/vehicles** - Request Body:
```json
{
  "vin": "1HGBH41JXMN109186",
  "registration_number": "ABC-1234",
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "color": "Silver",
  "owner_id": "uuid-of-owner"
}
```

### Owners

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/owners` | List all owners |
| POST | `/api/owners/register` | Register new owner |
| POST | `/api/owners/login` | Owner login |

### Insurance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insurance/:id` | Get insurance details |
| POST | `/api/insurance` | Add insurance policy |

**POST /api/insurance** - Request Body:
```json
{
  "vehicle_id": "uuid-of-vehicle",
  "policy_number": "POL-123456",
  "provider_name": "SafeDrive Insurance",
  "insurance_type": "comprehensive",
  "coverage_amount": 50000,
  "premium_amount": 1200,
  "start_date": "2024-01-01",
  "end_date": "2025-01-01"
}
```

### Verification (Core Feature)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/verify/authorization` | Check platform authorization |
| POST | `/api/verify/identity` | Verify vehicle-owner relationship |

**POST /api/verify/authorization** - Request Body:
```json
{
  "vehicle_id": "uuid-of-vehicle",
  "platform_id": "PLATFORM_001",
  "action": "connect"
}
```

**Success Response**:
```json
{
  "authorized": true,
  "vehicle_id": "...",
  "owner_id": "...",
  "insurance_id": "...",
  "validity": {
    "vehicle": true,
    "ownership": true,
    "insurance": true
  }
}
```

**Failure Response**:
```json
{
  "authorized": false,
  "reason": "No active insurance coverage",
  "timestamp": "2024-..."
}
```

---

## 🗄️ Database Schema

### Tables

#### vehicles
- `vehicle_id` (PRIMARY KEY) - UUID
- `vin` - Vehicle Identification Number (UNIQUE)
- `registration_number` - License plate (UNIQUE)
- `make`, `model`, `year`, `color`
- `engine_number`, `chassis_number`
- `status` - active/inactive
- `created_at`, `updated_at`

#### owners
- `owner_id` (PRIMARY KEY) - UUID
- `first_name`, `last_name`
- `email` (UNIQUE), `phone`
- `address`, `id_proof_type`, `id_proof_number`
- `password_hash` - bcrypt encrypted
- `status` - active/inactive

#### vehicle_ownership
- Links vehicles to owners
- Tracks ownership history
- `is_current` flag for current owner
- `ownership_start_date`, `ownership_end_date`

#### insurance
- `insurance_id` (PRIMARY KEY) - UUID
- `vehicle_id` (FOREIGN KEY)
- `policy_number`, `provider_name`
- `insurance_type` - comprehensive/third_party/etc
- `coverage_amount`, `premium_amount`
- `start_date`, `end_date`
- `status` - active/expired

#### authorization_logs
- Audit trail for all verification attempts
- `timestamp`, `status` (approved/denied/error)
- `details` - reason for denial

---

## 📖 Usage Guide

### 1. Initial Setup

Access the dashboard at `http://localhost:3000`

### 2. Register an Owner

1. Click "Add New" → Select "Add Owner"
2. Fill in personal details
3. Submit to create owner account

### 3. Register a Vehicle

1. Click "Add New" → Select "Register Vehicle"
2. Enter VIN, registration, make/model details
3. Assign to an owner (optional)
4. Submit

### 4. Add Insurance

1. Click "Add New" → Select "Add Insurance"
2. Select vehicle from dropdown
3. Enter policy details and validity period
4. Submit

### 5. Verify Authorization

1. Navigate to "Verification" tab
2. Enter Vehicle ID and Platform ID
3. Select action type (connect, data_access, etc.)
4. Click "Verify Authorization"
5. System checks:
   - Vehicle exists and is active
   - Has valid owner
   - Has active insurance
6. Result displayed with details

### 6. View Logs

All authorization attempts are logged in the "Auth Logs" section for auditing.

---

## 📸 Screenshots

### Dashboard
- Real-time statistics
- Recent authorization logs
- Quick action buttons

### Vehicle Management
- Complete vehicle listing
- Search and filter capabilities
- Detailed vehicle profiles

### Verification Interface
- Dual verification modes
- Clear success/failure indicators
- Detailed validation breakdown

---

## 🌐 Deployment

### Local Deployment
```bash
npm start
```

### Cloud Deployment (Render/Railway/Heroku)

1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy automatically

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t vehicle-identity .
docker run -p 3000:3000 vehicle-identity
```

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Stateless auth tokens
- **Input Validation**: Server-side validation
- **SQL Injection Protection**: Parameterized queries
- **CORS**: Configured for cross-origin requests

---

## 🎥 Demo Video

[Link to 4-minute demo video showing:]
- System overview
- Vehicle registration process
- Owner management
- Insurance addition
- Authorization verification (success and failure cases)
- Dashboard analytics

---

## 📊 Future Enhancements

- [ ] Blockchain integration for immutable records
- [ ] QR code generation for vehicle verification
- [ ] Mobile app for owners
- [ ] Integration with government registration APIs
- [ ] Real-time insurance verification with providers
- [ ] Multi-signature authorization for fleet vehicles

---

## 👥 Team Information

**Hackathon**: Car Company Hackathon - Round 1  
**Task**: Vehicle, Owner & Insurance Identity Management  
**Submission Date**: February 2024

---

## 📄 License

MIT License - Created for Car Company Hackathon

---

## 🙏 Acknowledgments

- Car Company Hackathon organizers
- CodeChef platform
- Open source community

---

**Note**: This is a working prototype demonstrating core functionality. For production use, additional security measures, scalability considerations, and compliance requirements should be implemented.
