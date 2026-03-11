# SmartDustbin - Database Schema

## Overview
This document describes the Firestore database schema for the SmartDustbin application. The database uses a collection-based structure with real-time synchronization capabilities.

## Collections

### 1. `bins` Collection
Stores information about waste bins in the system.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  id: string;                    // Unique bin identifier
  latitude: number;              // GPS latitude coordinate
  longitude: number;             // GPS longitude coordinate
  fillPercentage: number;        // Current fill level (0-100%)
  status: string;                // Status: 'available', 'nearly_full', or 'full'
  lastUpdated: Timestamp;        // Last sensor update timestamp
  location?: string;             // Human-readable address
  capacity?: number;             // Bin capacity in liters
  binType?: string;              // Type of waste bin
  reportedByUser?: string;       // User ID who reported issues
  isCollected: boolean;          // Whether bin was recently collected
  collectionCount?: number;      // Total times collected
  createdAt: Timestamp;          // Creation timestamp
}
```

**Indexes:**
- Composite: `status` + `fillPercentage` (for filtering full bins)
- Simple: `status` (for status queries)
- Simple: `lastUpdated` (for recent updates)

**Rules:**
- Only admins can create/delete bins
- Field workers can update `fillPercentage` and `status`

---

### 2. `alerts` Collection
Stores real-time alerts for full and critical bins.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  id: string;                    // Unique alert identifier
  binId: string;                 // Reference to bins collection
  severity: string;              // 'info', 'warning', or 'critical'
  message: string;               // Alert message
  createdAt: Timestamp;          // When alert was created
  resolved: boolean;             // Whether alert has been addressed
  resolvedAt?: Timestamp;        // When alert was resolved
  collectionId?: string;         // Reference to collection event
  resolvedBy?: string;           // User ID who resolved alert
}
```

**Indexes:**
- Composite: `resolved` + `createdAt` (for listing unresolved)
- Simple: `binId` (for bin-specific alerts)
- Simple: `severity` (for filtering by severity)

**Rules:**
- Auto-created when bin status becomes 'full'
- Only admins can resolve alerts
- Real-time listeners trigger notifications

---

### 3. `users` Collection
Stores user profiles and authentication metadata.

**Document ID:** Firebase Auth UID

**Fields:**
```typescript
{
  uid: string;                   // Firebase Auth UID
  email: string;                 // User email address
  displayName: string;           // User's display name
  role: string;                  // 'admin' or 'field_worker'
  photoURL?: string;             // Profile picture URL
  createdAt: Timestamp;          // Account creation date
  lastLogin: Timestamp;          // Last login timestamp
  isActive: boolean;             // Account status
  phone?: string;                // Phone number
  zone?: string;                 // Assigned zone/area
}
```

**Indexes:**
- Simple: `role` (for admin queries)
- Simple: `email` (for user lookup)

**Rules:**
- Users can only view their own profile
- Only system can update lastLogin
- Admins can view all user profiles

---

### 4. `fleet` Collection
Tracks collection vehicle locations and status in real-time.

**Document ID:** Vehicle ID

**Fields:**
```typescript
{
  id: string;                    // Vehicle identifier
  vehicleNumber: string;         // License plate/registration number
  driverId: string;              // Reference to driver user
  driverName: string;            // Driver's name
  latitude: number;              // Current GPS latitude
  longitude: number;             // Current GPS longitude
  status: string;                // 'available', 'on_route', or 'collecting'
  currentRoute?: {
    startedAt: Timestamp;        // Route start time
    estimatedEndTime: Timestamp; // Estimated completion
    binsToCollect: string[];     // Bin IDs to visit
    binsCollected: string[];     // Completed bins
  };
  lastUpdated: Timestamp;        // Last location update
  fuelLevel?: number;            // Percentage (0-100)
  totalBinsCollected?: number;   // Today's count
}
```

**Indexes:**
- Simple: `status` (for available vehicles)
- Simple: `driverId` (for driver's vehicles)
- Simple: `lastUpdated` (for recent activity)

**Rules:**
- Only drivers can update their vehicle data
- Admins can view all vehicle data
- Real-time location updates every 30 seconds

---

### 5. `collectionEvents` Collection
Logs all waste collection activities for audit and analytics.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  id: string;                    // Event identifier
  binId: string;                 // Bin that was collected
  collectedAt: Timestamp;        // When collection happened
  collectedByUserId: string;     // User who performed collection
  previousFillLevel: number;     // Fill % before collection
  weight?: number;               // Waste weight in kg (optional)
  notes?: string;                // Collection notes
  vehicleId?: string;            // Associated vehicle ID
  route?: string;                // Route ID (for batch collections)
  createdAt: Timestamp;          // Record creation time
}
```

**Indexes:**
- Composite: `binId` + `collectedAt` (for bin history)
- Simple: `collectedAt` (for date range queries)
- Simple: `collectedByUserId` (for worker reports)

**Rules:**
- Only field workers can create collection events
- Only admins can view all events
- Immutable after creation (audit trail)

---

### 6. `analytics` Collection
Pre-aggregated analytics data for dashboard performance.

**Document ID:** Format: `{type}-{period-date}` (e.g., "daily-2024-01-15")

**Fields:**
```typescript
{
  date: Timestamp;               // Date of analytics period
  periodType: string;            // 'hourly', 'daily', 'weekly'
  totalBins: number;             // Total bins in system
  fullBins: number;              // Bins that were full
  collectionsCompleted: number;  // Successful collections
  avgResponseTime: number;       // Minutes from alert to dispatch
  avgFillTime: number;           // Hours from empty to full
  collectionEfficiency: number;  // Percentage (0-100)
  wasteByType?: {
    [key: string]: number;       // Waste distribution by type
  };
  peakHour?: string;             // Hour with most full bins
  lastUpdated: Timestamp;        // When calculation ran
}
```

**Indexes:**
- Simple: `date` (for period queries)
- Simple: `periodType` (for filtering)

**Rules:**
- Only system can write (auto-calculated)
- Everyone can read
- Cleaned up after 1 year

---

## Data Moderation Rules

### Firestore Security Rules Template
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Function to check user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    // Bins collection
    match /bins/{binId} {
      allow read: if request.auth != null;
      allow create: if getUserRole() == 'admin';
      allow update: if getUserRole() == 'admin' || getUserRole() == 'field_worker';
      allow delete: if getUserRole() == 'admin';
    }

    // Alerts collection
    match /alerts/{alertId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if getUserRole() == 'admin';
      allow delete: if getUserRole() == 'admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId || getUserRole() == 'admin';
      allow write: if request.auth.uid == userId;
    }

    // Fleet collection
    match /fleet/{vehicleId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null;
    }

    // Collection events
    match /collectionEvents/{eventId} {
      allow read: if request.auth != null;
      allow create: if getUserRole() == 'field_worker' || getUserRole() == 'admin';
      allow delete: if false;  // Immutable
    }

    // Analytics
    match /analytics/{docId} {
      allow read: if request.auth != null;
      allow write: if false;  // System only
    }
  }
}
```

---

## Real-Time Listeners

### Subscription Patterns Used

1. **Bins with Real-Time Fill Updates**
   ```
   Listener: All bins collection
   Trigger: Every 10 seconds (sensor simulation)
   Payload: Full bin documents
   ```

2. **Active Alerts**
   ```
   Listener: Alerts where resolved == false
   Trigger: On alert creation or resolution
   Payload: Alert documents
   ```

3. **Fleet Vehicles**
   ```
   Listener: Fleet collection
   Trigger: Every 30 seconds (GPS update)
   Payload: Vehicle locations and status
   ```

4. **User Profile**
   ```
   Listener: Specific user document
   Trigger: On profile changes
   Payload: Updated user data
   ```

---

## Data Timestamps

- **Firestore Timestamp vs JavaScript Date:**
  - Stored as: `firebase.firestore.Timestamp`
  - Converted to: `number` (milliseconds since epoch) in app
  - Display as: `new Date(timestamp)`

---

## Backup and Retention

- **Backup Strategy:** Daily automated exports to Cloud Storage
- **Retention Periods:**
  - Bins: Indefinite (active records)
  - Alerts: 90 days (resolved alerts archived)
  - Collection Events: 2 years (audit trail)
  - Analytics: 1 year (historical data)
  - Users: Indefinite (account records)

---

## Query Performance

### Common Queries Optimized

1. Get all full bins
   ```
   Collection: bins
   Filter: status == 'full'
   Index: (status, fillPercentage)
   ```

2. Get unresolved alerts
   ```
   Collection: alerts
   Filter: resolved == false
   Order: createdAt DESC
   Index: (resolved, createdAt)
   ```

3. Get collections for date range
   ```
   Collection: collectionEvents
   Filter: collectedAt >= startDate AND collectedAt <= endDate
   Index: (collectedAt)
   ```

4. Get driver's current vehicle
   ```
   Collection: fleet
   Filter: driverId == userId
   Index: (driverId)
   ```

---

## Migration Guides

### Adding a New Bin
1. Admin submits bin creation form
2. Assigned unique ID
3. Initial status: `available`
4. Fill level starts: `0%`
5. Sensors begin tracking

### Decommissioning a Bin
1. Admin marks bin as `inactive`
2. Collections become read-only
3. Historical data preserved
4. Removed from active monitoring

---

## Cost Optimization

- **Firestore Pricing Considerations:**
  - Reads: 50k free, $0.06 per 100k
  - Writes: 20k free, $0.18 per 100k
  - Deletes: Similar to writes
  - Estimated monthly cost: $50-200 for 1000+ bins

- **Optimization Strategies:**
  - Batch real-time updates every 10 seconds
  - Aggregate analytics data hourly
  - Archive old collection events
  - Use pagination for list views
