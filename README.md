# SmartDustbin - Installation & Setup Guide

## Quick Start

### 1. Clone or Download Project

```bash
cd smart
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy example to local:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your credentials:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Firebase Setup (1st Time Only)

Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) to:
- Create Firebase project
- Enable Firestore and Authentication
- Create test users
- Get configuration

### 5. Google Maps Setup

Follow [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) to:
- Create Google Cloud project
- Enable Maps APIs
- Get API key
- Configure restrictions

### 6. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

### 7. Test Login

Use demo credentials:
- **Email:** admin@smartdustbin.com
- **Password:** demo@123456

---

## Project Structure

```
smart/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── auth/
│   │   │   └── login/page.tsx # Login page
│   │   └── dashboard/         # All dashboard pages
│   ├── components/
│   │   ├── landing/           # Landing page components
│   │   ├── dashboard/         # Dashboard components (if needed)
│   │   └── shared/            # Reusable components
│   ├── lib/
│   │   ├── firebase.ts        # Firebase initialization
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── store.ts           # Zustand state management
│   ├── services/
│   │   ├── firestore.ts       # Firestore CRUD operations
│   │   ├── auth.ts            # Firebase Auth
│   │   └── sensorSimulation.ts # IoT sensor simulation
│   ├── utils/
│   │   ├── helpers.ts         # Utility functions
│   │   ├── maps.ts            # Google Maps utilities
│   │   └── routeOptimization.ts # Route calculation
│   └── styles/
│       └── globals.css        # Global styles
├── docs/                       # Documentation
│   ├── DATABASE_SCHEMA.md
│   ├── FIREBASE_SETUP.md
│   └── GOOGLE_MAPS_SETUP.md
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## Key Technologies

### Frontend
- **Next.js 14**: React meta-framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Recharts**: Charts and graphs

### Backend & Services
- **Firebase Firestore**: Real-time database
- **Firebase Auth**: Authentication
- **Firebase Storage**: File storage (optional)
- **Google Maps**: Mapping and routing

### DevTools
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Zustand**: State management

---

## Build for Production

### 1. Create Production Build

```bash
npm run build
```

### 2. Test Production Build Locally

```bash
npm run start
```

### 3. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 4. Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login and initialize
firebase init hosting
firebase deploy
```

### 5. Other Hosting Options
- **Netlify**: `netlify deploy`
- **AWS Amplify**: Amplify Console
- **Docker**: Create Dockerfile and deploy to Docker Hub

---

## Development Workflow

### Code Quality

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# Both
npm run lint && npm run type-check
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `HeroSection.tsx`)
- **Pages**: kebab-case within app router (e.g., `/app/dashboard/live-map`)
- **Functions**: camelCase (e.g., `calculateDistance()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SIMULATION_CONFIG`)

### Component Patterns

All client components must have `'use client'` directive:
```typescript
'use client'

import React from 'react'

interface Props {
  // Props here
}

export const ComponentName: React.FC<Props> = ({ /* destructure props */ }) => {
  // Implementation
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Landing page loads and looks good
- [ ] Login with demo credentials works
- [ ] Dashboard displays without errors
- [ ] Map page shows (even if placeholder)
- [ ] Bins page lists items
- [ ] Alerts page shows sample alerts
- [ ] Analytics page displays charts
- [ ] Fleet page shows vehicles
- [ ] Settings page allows changes
- [ ] Logout works

### Sensor Simulation

The app automatically starts sensor simulation when loading the dashboard. Watch for:
- Bin fill percentages increasing
- Status changing from available → nearly_full → full
- Alerts appearing when bins fill up
- Alert sound playing (if browser allows)
- Notification badge increasing

### Performance Testing

```bash
# Lighthouse audit
npx lighthouse http://localhost:3000

# Target scores:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

---

## Troubleshooting

### Common Issues

**"Firebase config is invalid"**
- ✅ Check `.env.local` has all 6 Firebase keys
- ✅ Verify no spaces or extra quotes
- ✅ Reload page after updating .env

**"Auth/invalid-api-key"**
- ✅ Verify API key in Firebase Console
- ✅ Check domain restrictions allow localhost
- ✅ Wait 5 minutes for changes to propagate

**"Map not showing"**
- ✅ Check Google Maps API key in .env
- ✅ Verify APIs are enabled in Google Cloud
- ✅ Check browser console for specific errors

**"Port 3000 already in use"**
```bash
# On macOS/Linux
kill -9 $(lsof -t -i:3000)

# On Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

**"Node modules issues"**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Optimization

### Current Optimizations
- ✅ Image lazy loading
- ✅ Code splitting (Next.js automatic)
- ✅ CSS optimization (Tailwind purging)
- ✅ Font optimization (Inter from Google Fonts)
- ✅ Real-time updates with Firestore listeners

### Additional Optimizations
- Implement service worker for PWA
- Add page caching strategies
- Optimize database indexes
- Implement pagination for large lists
- Add request debouncing

---

## Security Best Practices

✅ **Implemented:**
- Firebase security rules (role-based)
- HTTPS enforcement
- Secure authentication flow
- Input validation

**In Production, Also:**
- Enable Cloud Armor
- Set up DDoS protection
- Use WAF (Web Application Firewall)
- Regular security audits
- Implement logging and monitoring
- Use environment variables for secrets

---

## Monitoring & Analytics

### Free Tools
- **Firebase Analytics**: Automatic tracking
- **Google Analytics**: Easy integration
- **Sentry**: Error tracking
- **LogRocket**: Session replay

### Integration Example
```typescript
// src/lib/analytics.ts
import { getAnalytics, logEvent } from "firebase/analytics";
import { analytics } from "./firebase";

export const trackEvent = (name: string, data?: any) => {
  logEvent(analytics, name, data);
};
```

---

## Deployment Checklist

- [ ] Replace demo credentials with production values
- [ ] Enable production Firestore security rules
- [ ] Configure Firebase backups
- [ ] Set up error logging (Sentry)
- [ ] Enable CORS restrictions
- [ ] Test on multiple browsers and devices
- [ ] Run Lighthouse audit
- [ ] Set up monitoring and alerts
- [ ] Configure CI/CD pipeline
- [ ] Create database backups
- [ ] Document API endpoints

---

## Support & Resources

- **Documentation**: See `/docs` folder
- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs/

---

## License

MIT License - feel free to use for personal or commercial projects.

---

## Troubleshooting Checklist

Problem | Solution
---|---
Env variables not loading | Restart dev server after updating .env.local
Firebase rules too restrictive | Switch to development rules (allow read/write)
Maps not displaying | Check API key and verify APIs are enabled
Sensor simulation not starting | Open browser developer tools, check for errors
Animations too slow | Reduce animation duration or disable in settings
Database queries slow | Check Firestore indexes are created

---

**Happy building! 🚀**
