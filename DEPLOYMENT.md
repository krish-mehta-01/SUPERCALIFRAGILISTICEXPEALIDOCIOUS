# Deployment Guide

## Quick Start

### Option 1: Local Machine
```bash
npm install
npm start
```
Visit: http://localhost:3000

### Option 2: With Demo Data
```bash
npm install
node seed.js  # Optional: Add sample data
npm start
```

## Platform-Specific Deployment

### Render (Recommended - Free)
1. Go to https://render.com
2. Create New Web Service
3. Connect your GitHub repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `NODE_ENV=production`
5. Deploy

### Railway
1. Go to https://railway.app
2. New Project → Deploy from GitHub repo
3. Add variables:
   - `PORT=3000`
   - `JWT_SECRET=your-secret`
4. Deploy

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 3000) |
| JWT_SECRET | Secret for JWT signing | Yes |
| NODE_ENV | environment mode | No |

## Post-Deployment Verification

1. **Homepage loads**: Visit root URL
2. **API works**: GET /api/dashboard/stats
3. **Database**: SQLite file auto-created
4. **Add test data**: Use the UI forms

## Troubleshooting

**Issue**: Port already in use  
**Fix**: Change PORT in .env or use `PORT=3001 npm start`

**Issue**: Database locked  
**Fix**: Delete database/vehicle_identity.db and restart

**Issue**: CORS errors  
**Fix**: Check CORS settings in server.js

## Demo Checklist for Video

- [ ] Show dashboard with stats
- [ ] Register new vehicle
- [ ] Add owner
- [ ] Add insurance
- [ ] Test authorization (success)
- [ ] Test authorization (failure - no insurance)
- [ ] Show authorization logs
