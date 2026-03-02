# Vehicle, Owner & Insurance Identity Management System

## TetherX

A comprehensive system for managing vehicle identities, verifying ownership, handling insurance relationships, and enforcing validity checks for connected vehicle platform interactions.

---

##  Table of Contents

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

## Overview

This solution addresses the **"Vehicle, Owner & Insurance Identity Management"** task by creating a robust system that:

- **Manages Vehicle Identities**: Unique identification and registration tracking
- **Verifies Authorization**: Ensures only authorized vehicles interact with connected platforms
- **Handles Ownership**: Maintains complete ownership history and transfers
- **Manages Insurance**: Tracks insurance policies with validity enforcement
- **Enforces Validity Checks**: Multi-layer verification before platform access

### Problem Statement
> Design a system that manages vehicle identities and verifies whether a vehicle is authorized to interact with a connected vehicle platform. The solution should represent ownership and insurance relationships and enforce validity checks on vehicle interactions.

---

## Features

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

##  Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Dashboard  │  │    Forms     │  │   Tables     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (Express.js)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Vehicles   │  │    Owners    │  │   Insurance  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Verify     │  │    Logs      │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER (SQLite)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   vehicles   │  │    owners    │  │  insurance   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │vehicle_owner │  │     logs     │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3 (lightweight, file-based)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing

---

##  Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Stateless auth tokens
- **Input Validation**: Server-side validation
- **SQL Injection Protection**: Parameterized queries
- **CORS**: Configured for cross-origin requests

---

## Team Information

**Hackathon**: TetherX
**Team Name**:SUPERCALIFRAGILISTICEXPEALIDOCIOUS
**Task**: Vehicle, Owner & Insurance Identity Management  
**Team Member** : Krish Mehta , Parthasarthi, Pravin P, Saisujan

---


