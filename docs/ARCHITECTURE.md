# SmartDustbin - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     End Users & Clients                         │
│  Web Browser (Desktop/Mobile) via Next.js Application          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Layer (SPA)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages: Landing, Auth, Dashboard, Map, Bins, Alerts     │  │
│  │  Components: Navbar, Sidebar, Charts, Forms             │  │
│  │  Built with: Next.js 14, React 18, TypeScript, Tailwind │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  State Management & Logic                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Zustand Store: Auth, Bins, Alerts, Fleet, UI State    │  │
│  │  Services: Firestore, Auth, Maps, Route Optimization   │  │
│  │  Sensor Simulation: IoT Bin Data Generation             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
     ┌────────┐    ┌─────────┐    ┌──────────┐
     │ Firebase   │ Google    │    │ External │
     │ Backend    │ Maps API  │    │ Services │
     └────────┘    └─────────┘    └──────────┘
```

---

## Component Architecture

### Frontend Components Hierarchy

```
app/layout.tsx (Root)
│
├── page.tsx (Landing Page)
│   ├── HeroSection
│   ├── FeaturesSection
│   ├── HowItWorksSection
│   ├── PricingSection
│   └── Footer
│
└── dashboard/ (Authenticated)
    ├── layout.tsx (DashboardLayout)
    │   ├── Navbar
    │   ├── Sidebar
    │   └── OfflineIndicator
    │
    ├── page.tsx (Overview)
    │   ├── StatCard (4x)
    │   ├── Table (recent collections)
    │   └── QuickActionCards
    │
    ├── map/page.tsx
    │   └── MapComponent
    │       ├── Markers (one per bin)
    │       ├── Route Polyline
    │       └── Sidebar (bin details)
    │
    ├── bins/page.tsx
    │   ├── SearchInput
    │   ├── FilterDropdown
    │   └── BinCard (many)
    │
    ├── alerts/page.tsx
    │   ├── AlertCard (unresolved)
    │   └── AlertCard (resolved history)
    │
    ├── analytics/page.tsx
    │   ├── KPICard (many)
    │   ├── BarChart
    │   ├── PieChart
    │   ├── LineChart
    │   └── RadarChart
    │
    ├── fleet/page.tsx
    │   ├── StatCard (4x)
    │   ├── VehicleCard (many)
    │   ├── RouteDetails
    │   └── MapComponent
    │
    └── settings/page.tsx
        ├── ProfileSection
        ├── NotificationSettings
        ├── PreferencesForm
        └── DangerZone
```

---

## Data Flow Architecture

### Authentication Flow

```
User Input (Email/Password)
         │
         ▼
Login Page (auth/login/page.tsx)
         │
         ▼
authService.login()
         │
         ├─→ Firebase Auth.signInWithEmailAndPassword()
         │              │
         │              ▼
         │         Returns: User object with uid
         │              │
         └──────────────┘
                │
                ▼
usersService.getProfile(uid)
         │
         ├─→ Firestore: /users/{uid}
         │              │
         │              ▼
         │         Returns: UserProfile with role
         │              │
         └──────────────┘
                │
                ▼
useAppStore.setCurrentUser(user)
         │
         ▼
Redirect to /dashboard
```

### Real-Time Data Sync

```
Firestore Collections
├── /bins (with real-time listeners)
│   │
│   └─→ onSnapshot() listener
│        │
│        ├─→ Triggers on every: INSERT, UPDATE, DELETE
│        │
│        ▼
│   useAppStore.setBins(data)
│        │
│        ▼
│   React Re-render (Map, Bins page, Dashboard)
│
├── /alerts
│   │
│   └─→ Similar real-time sync
│
└── /fleet
    │
    └─→ Similar real-time sync
```

### Sensor Simulation Flow

```
startSensorSimulation()
         │
         ├─→ Gets all bins from Firestore
         │
         ├─→ setInterval(10 seconds)
         │   │
         │   ├─→ Increment fillPercentage by 5-15%
         │   │
         │   ├─→ Update Firestore: /bins/{binId}
         │   │   │
         │   │   └─→ Triggers real-time listeners
         │   │
         │   ├─→ Check if fillPercentage >= 95%
         │   │   │
         │   │   ├─ YES: handleBinFull()
         │   │   │   │
         │   │   │   ├─→ Create alert in Firestore
         │   │   │   ├─→ Play notification sound
         │   │   │   ├─→ Show browser notification
         │   │   │   └─→ Update store
         │   │   │
         │   │   └─ NO: Continue
         │   │
         │   └─→ Retry in 10 seconds
```

---

## Service Layer Architecture

### Firestore Service Structure

```
src/services/firestore.ts
│
├── binsService
│   ├── getAll()           ─→ All bins
│   ├── getById(id)        ─→ Single bin
│   ├── update(id, data)   ─→ Update bin
│   ├── subscribeToAll()   ─→ Real-time listener
│   └── collect(binId)     ─→ Mark as collected
│
├── alertsService
│   ├── getAll()           ─→ All alerts
│   ├── create(data)       ─→ New alert
│   ├── resolve(id)        ─→ Resolve alert
│   ├── subscribeToUnresolved()
│   └── subscribeToResolved()
│
├── usersService
│   ├── getProfile(uid)    ─→ Get user data
│   ├── upsertProfile()    ─→ Create/update profile
│   ├── setRole(uid, role) ─→ Update user role
│   └── subscribeToProfile()
│
├── fleetService
│   ├── getVehicles()      ─→ All vehicles
│   ├── updateLocation()   ─→ GPS update
│   ├── updateStatus()     ─→ Status change
│   └── subscribeToVehicles()
│
└── collectionEventsService
    ├── getHistory()       ─→ Past collections
    ├── create(data)       ─→ Log collection
    ├── getStats(date)     ─→ Daily/weekly stats
    └── subscribeByBin()
```

### Authentication Service

```
src/services/auth.ts
│
├── register(email, password, displayName, role)
│   ├─→ Firebase Auth.createUserWithEmailAndPassword()
│   └─→ Create user profile in Firestore
│
├── login(email, password)
│   ├─→ Firebase Auth.signInWithEmailAndPassword()
│   └─→ Return user object
│
├── logout()
│   ├─→ Firebase Auth.signOut()
│   └─→ Clear store
│
├── getCurrentUser()
│   └─→ Return currently signed-in user
│
└── onAuthStateChange(callback)
    └─→ Listen for auth changes
```

---

## State Management (Zustand Store)

```
useAppStore
│
├── Auth State
│   ├── currentUser: User | null
│   ├── currentRole: 'admin' | 'field_worker'
│   ├── isAuthenticated: boolean
│   └── isLoading: boolean
│
├── Data State
│   ├── bins: Bin[]
│   ├── fullBins: Bin[]       (filtered)
│   ├── alerts: Alert[]
│   ├── unresolvedAlerts: Alert[]
│   ├── fleetVehicles: FleetVehicle[]
│   └── collectionEvents: CollectionEvent[]
│
├── UI State
│   ├── sidebarOpen: boolean
│   ├── isOnline: boolean
│   ├── theme: 'light' | 'dark' | 'auto'
│   ├── notifications: Notification[]
│   ├── selectedBin?: Bin
│   ├── selectedRoute?: OptimizedRoute
│   └── loadingState: string
│
└── Actions (Setters)
    ├── setCurrentUser(user)
    ├── setBins(bins)
    ├── setAlerts(alerts)
    ├── setFleetVehicles(vehicles)
    ├── toggleSidebar()
    ├── setOnlineStatus(online)
    ├── addNotification(notification)
    └── clearNotification(id)
```

---

## Database Schema (Firestore Collections)

```
firestore()
│
├── /bins/{binId}
│   ├── fillPercentage: number (0-100)
│   ├── status: 'available' | 'nearly_full' | 'full'
│   ├── latitude: number
│   ├── longitude: number
│   ├── location: string
│   ├── lastUpdated: Timestamp
│   └── isCollected: boolean
│
├── /alerts/{alertId}
│   ├── binId: string
│   ├── severity: 'info' | 'warning' | 'critical'
│   ├── message: string
│   ├── createdAt: Timestamp
│   ├── resolved: boolean
│   └── resolvedBy?: string
│
├── /users/{uid}
│   ├── email: string
│   ├── displayName: string
│   ├── role: 'admin' | 'field_worker'
│   ├── createdAt: Timestamp
│   └── lastLogin: Timestamp
│
├── /fleet/{vehicleId}
│   ├── vehicleNumber: string
│   ├── driverId: string
│   ├── status: 'available' | 'on_route' | 'collecting'
│   ├── latitude: number
│   ├── longitude: number
│   └── lastUpdated: Timestamp
│
└── /collectionEvents/{eventId}
    ├── binId: string
    ├── collectedAt: Timestamp
    ├── collectedByUserId: string
    └── weight?: number
```

---

## API Integration Points

### Firebase APIs Used

| API | Purpose | Usage |
|-----|---------|-------|
| `auth()` | User authentication | Login, register, logout |
| `getFirestore()` | Real-time database | CRUD ops, listeners |
| `collection()` | Access collections | Query documents |
| `query()` | Build queries | Filter by status, date |
| `onSnapshot()` | Real-time listeners | Live data sync |
| `updateDoc()` | Update records | Modify bin data |
| `addDoc()` | Create documents | New alerts, events |
| `deleteDoc()` | Remove records | Clean up old data |
| `writeBatch()` | Batch operations | Multiple writes |

### Google Maps APIs Used

| API | Purpose | Usage |
|-----|---------|-------|
| Google Maps JS | Map rendering | Display map with markers |
| Directions API | Route planning | Calculate optimal routes |
| Distance Matrix | Distance calculation | Estimate collection time |
| Geocoding API | Address ↔ Coords | Show addresses on map |

---

## Performance Considerations

### Optimization Strategies

1. **Real-Time Data Sync**
   - Firestore listeners only on dashboard pages
   - Unsubscribe on component unmount
   - Single listener per collection to prevent duplicates

2. **Bundle Size**
   - Code splitting with Next.js App Router
   - Dynamic imports for heavy components
   - Tree-shaking unused code via tsconfig

3. **Rendering Performance**
   - React.FC components with memo() for expensive computations
   - Zustand selectors to prevent unnecessary re-renders
   - Framer Motion for GPU-accelerated animations

4. **Database Queries**
   - Firestore indexes for common queries
   - Pagination for large lists
   - Pre-aggregated analytics collection

5. **Network Optimization**
   - Image lazy loading
   - Font subsetting (Inter)
   - Compression of API responses

---

## Security Architecture

```
┌─ Public Routes ─────────────────┐
│ • / (landing page)              │
│ • /auth/login                   │
└─────────────────────────────────┘
         │
         │ (No auth required)
         │
         ▼
┌─ Protected Routes ──────────────┐
│ • /dashboard (all)              │
│ Requires: Firebase Auth         │
│ Enforced: DashboardLayout       │
└─────────────────────────────────┘
         │
         │ (Auth + role check)
         │
         ▼
┌─ Firestore Security Rules ──────┐
│ • Admin role access: all data   │
│ • Field worker: read bins only  │
│ • Immutable: collection events  │
│ • User isolation: own profile   │
└─────────────────────────────────┘
```

### Security Measures

✅ **Implemented:**
- Firebase Auth (strong password hashing)
- Firestore security rules (role-based)
- Environment variables for secrets
- TypeScript strict mode
- Input validation on forms

⏳ **To Implement:**
- HTTPS enforcement
- CORS configuration
- Rate limiting on API calls
- Content Security Policy headers
- Regular security audits

---

## Scalability Architecture

### Current Capacity (Production Ready)

| Resource | Capacity | Notes |
|----------|----------|-------|
| Bins | 1,000+ | Per city zone |
| Users | 100+ | Admin + field workers |
| Alerts | Real-time | Firestore listeners |
| API Calls | 100,000+/month | Free Firebase quota |

### Scaling Strategies

**Phase 1: Single City (Current)**
- All data in single Firestore project
- Zone-based data partitioning
- Real-time sync for active zones only

**Phase 2: Multi-City**
- Separate Firestore per region
- Zone federation
- Regional API delegation

**Phase 3: Global SaaS**
- Federated Firestore instances per region
- Edge caching (CDN)
- Distributed backend architecture

---

## Deployment Architecture

```
┌─────────────────────────────────────┐
│    Code Repository (GitHub)         │
└────────────┬────────────────────────┘
             │
             ▼ (git push)
┌─────────────────────────────────────┐
│    CI/CD Pipeline                   │
│    • Run tests                      │
│    • Build Next.js app              │
│    • Run linter                     │
└────────────┬────────────────────────┘
             │
             ▼ (build success)
┌──────────────────────────────────────┐
│  Deployment Options:                 │
│  1. Vercel (Recommended)             │
│  2. Firebase Hosting                 │
│  3. AWS Amplify                      │
│  4. Docker + Any host                │
└──────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  CDN (Vercel Edge / CloudFront)      │
│  • Cache static assets               │
│  • Global distribution               │
│  • Fast first-page load              │
└──────────────────────────────────────┘
```

---

## Development Workflow

```
Feature Development
│
├─→ Create feature branch
│   │
│   ├─→ Component/Page development
│   │   └─→ Use localhost:3000
│   │
│   ├─→ Type checking
│   │   └─→ npm run type-check
│   │
│   ├─→ Linting
│   │   └─→ npm run lint
│   │
│   └─→ Manual testing
│       └─→ Test on multiple browsers
│
├─→ Commit changes
│   │
│   └─→ Create pull request
│
└─→ Code review + merge
    │
    └─→ Auto-deploy to production
```

---

## Technology Stack Decision Rationale

| Technology | Why Chosen |
|-----------|-----------|
| **Next.js 14** | Full-stack React framework, excellent DX |
| **TypeScript** | Type safety prevents runtime errors |
| **Tailwind CSS** | Utility-first CSS for rapid development |
| **Framer Motion** | Smooth animations without motion libraries bugs |
| **Firebase** | Managed backend, real-time sync, auth included |
| **Zustand** | Lightweight state management vs Redux overhead |
| **Recharts** | Simple charting library for analytics |
| **Lucide React** | Consistent, modern icon library |

---

## Monitoring & Observability

```
Application Layer
│
├─→ Console logging (dev)
│
├─→ Firebase Analytics
│   └─→ Track user events, engagement
│
├─→ Error tracking (Sentry - optional)
│   └─→ Catch and report runtime errors
│
└─→ Performance monitoring
    └─→ Lighthouse, Chrome DevTools
```

---

## Disaster Recovery

**Data Backup Strategy:**
- ✅ Firestore automatic daily backups
- ✅ Export data quarterly to Cloud Storage
- ✅ Test restore procedure monthly

**Incident Response:**
1. Identify issue (monitoring alerts)
2. Rollback to previous version (if needed)
3. Fix issue in code
4. Redeploy to production
5. Verify fix
6. Post-mortem analysis

---

**Next Architecture Review:** Quarterly or after major feature additions.
