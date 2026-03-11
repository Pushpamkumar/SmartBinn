# SmartDustbin - API Reference

## Overview

This document provides comprehensive API reference for all services, utilities, and functions available in the SmartDustbin application.

---

## Authentication Service (`src/services/auth.ts`)

### `register(email, password, displayName, role)`

Creates a new user account with the specified role.

**Parameters:**
- `email` (string): User email address
- `password` (string): Password (min 6 chars)
- `displayName` (string): User display name
- `role` (string): Either `'admin'` or `'field_worker'`

**Returns:** `Promise<User>`

**Example:**
```typescript
import { authService } from '@/services/auth';

try {
  const user = await authService.register(
    'user@example.com',
    'password123',
    'John Doe',
    'field_worker'
  );
  console.log('User created:', user.uid);
} catch (error) {
  console.error('Registration failed:', error);
}
```

---

### `login(email, password)`

Authenticates a user with email and password.

**Parameters:**
- `email` (string): User email
- `password` (string): User password

**Returns:** `Promise<User>`

**Example:**
```typescript
const user = await authService.login('admin@smartdustbin.com', 'demo@123456');
console.log('Logged in as:', user.email);
```

---

### `logout()`

Signs out the current user.

**Returns:** `Promise<void>`

**Example:**
```typescript
await authService.logout();
// User is now logged out
```

---

### `getCurrentUser()`

Gets the currently authenticated user.

**Returns:** `User | null`

**Example:**
```typescript
const user = authService.getCurrentUser();
if (user) {
  console.log('Current user:', user.email);
}
```

---

### `onAuthStateChange(callback)`

Listens for authentication state changes.

**Parameters:**
- `callback` (function): Called with user when auth state changes

**Returns:** `() => void` (unsubscribe function)

**Example:**
```typescript
const unsubscribe = authService.onAuthStateChange((user) => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});

// Later, stop listening:
unsubscribe();
```

---

## Firestore Service (`src/services/firestore.ts`)

### Bins Service

#### `binsService.getAll()`

Fetches all bins from Firestore.

**Returns:** `Promise<Bin[]>`

```typescript
const bins = await binsService.getAll();
console.log(`Found ${bins.length} bins`);
```

---

#### `binsService.getById(id)`

Fetches a single bin by ID.

**Parameters:**
- `id` (string): Bin document ID

**Returns:** `Promise<Bin | null>`

```typescript
const bin = await binsService.getById('bin-123');
console.log('Fill level:', bin?.fillPercentage);
```

---

#### `binsService.create(binData)`

Creates a new bin in the system.

**Parameters:**
- `binData` (object): Bin data
  ```typescript
  {
    latitude: number;
    longitude: number;
    fillPercentage: number;        // 0-100
    status: 'available' | 'nearly_full' | 'full';
    location?: string;
    capacity?: number;
  }
  ```

**Returns:** `Promise<string>` (bin ID)

```typescript
const binId = await binsService.create({
  latitude: 28.7041,
  longitude: 77.1025,
  fillPercentage: 0,
  status: 'available',
  location: 'Delhi, India',
});
console.log('Created bin:', binId);
```

---

#### `binsService.update(id, updates)`

Updates a bin's data.

**Parameters:**
- `id` (string): Bin document ID
- `updates` (object): Fields to update

**Returns:** `Promise<void>`

```typescript
await binsService.update('bin-123', {
  fillPercentage: 85,
  status: 'nearly_full',
});
```

---

#### `binsService.collect(binId)`

Marks a bin as collected (resets fill level).

**Parameters:**
- `binId` (string): Bin document ID

**Returns:** `Promise<void>`

```typescript
await binsService.collect('bin-123');
// Bin fill level reset to 0, status changed to 'available'
```

---

#### `binsService.subscribeToAll(callback)`

Listens for real-time changes to all bins.

**Parameters:**
- `callback` (function): Called with bins array on each change

**Returns:** `() => void` (unsubscribe function)

```typescript
const unsubscribe = binsService.subscribeToAll((bins) => {
  console.log('Bins updated:', bins.length);
  // Update UI with new bin data
});

// Later:
unsubscribe();
```

---

### Alerts Service

#### `alertsService.getUnresolved()`

Fetch all unresolved alerts.

**Returns:** `Promise<Alert[]>`

```typescript
const alerts = await alertsService.getUnresolved();
console.log('Critical alerts:', alerts.length);
```

---

#### `alertsService.create(alertData)`

Creates a new alert.

**Parameters:**
- `alertData` (object):
  ```typescript
  {
    binId: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
  }
  ```

**Returns:** `Promise<string>` (alert ID)

```typescript
const alertId = await alertsService.create({
  binId: 'bin-123',
  severity: 'critical',
  message: 'Bin is full and needs immediate collection',
});
```

---

#### `alertsService.resolve(alertId)`

Marks an alert as resolved.

**Parameters:**
- `alertId` (string): Alert document ID

**Returns:** `Promise<void>`

```typescript
await alertsService.resolve('alert-456');
```

---

#### `alertsService.subscribeToUnresolved(callback)`

Real-time listener for unresolved alerts.

**Parameters:**
- `callback` (function): Called with alerts array

**Returns:** `() => void`

```typescript
const unsubscribe = alertsService.subscribeToUnresolved((alerts) => {
  console.log('Unresolved alerts:', alerts.length);
});
```

---

### Users Service

#### `usersService.getProfile(uid)`

Gets a user's profile.

**Parameters:**
- `uid` (string): Firebase user ID

**Returns:** `Promise<UserProfile | null>`

```typescript
const profile = await usersService.getProfile('user-uid-123');
console.log('User role:', profile?.role);
```

---

#### `usersService.upsertProfile(uid, data)`

Creates or updates a user profile.

**Parameters:**
- `uid` (string): Firebase user ID
- `data` (object): Profile data

**Returns:** `Promise<void>`

```typescript
await usersService.upsertProfile('user-uid-123', {
  displayName: 'John Doe',
  role: 'admin',
  email: 'john@example.com',
});
```

---

#### `usersService.subscribeToProfile(uid, callback)`

Real-time listener for user profile changes.

**Parameters:**
- `uid` (string): Firebase user ID
- `callback` (function): Called with profile data

**Returns:** `() => void`

---

### Fleet Service

#### `fleetService.getVehicles()`

Fetch all fleet vehicles.

**Returns:** `Promise<FleetVehicle[]>`

```typescript
const vehicles = await fleetService.getVehicles();
console.log('Available vehicles:', vehicles.length);
```

---

#### `fleetService.updateLocation(vehicleId, lat, lng)`

Update vehicle GPS location.

**Parameters:**
- `vehicleId` (string): Vehicle ID
- `lat` (number): Latitude coordinate
- `lng` (number): Longitude coordinate

**Returns:** `Promise<void>`

```typescript
await fleetService.updateLocation('vehicle-1', 28.7041, 77.1025);
```

---

#### `fleetService.updateStatus(vehicleId, status)`

Update vehicle status.

**Parameters:**
- `vehicleId` (string): Vehicle ID
- `status` (string): `'available'`, `'on_route'`, or `'collecting'`

**Returns:** `Promise<void>`

```typescript
await fleetService.updateStatus('vehicle-1', 'on_route');
```

---

### Collection Events Service

#### `collectionEventsService.create(data)`

Log a waste collection event.

**Parameters:**
- `data` (object):
  ```typescript
  {
    binId: string;
    collectedByUserId: string;
    previousFillLevel: number;
    vehicleId?: string;
    weight?: number;
    notes?: string;
  }
  ```

**Returns:** `Promise<string>` (event ID)

```typescript
const eventId = await collectionEventsService.create({
  binId: 'bin-123',
  collectedByUserId: 'user-uid-456',
  previousFillLevel: 95,
  weight: 45,
  notes: 'Bin was overflowing',
});
```

---

#### `collectionEventsService.getByDateRange(startDate, endDate)`

Get collections within a date range.

**Parameters:**
- `startDate` (Date): Start date
- `endDate` (Date): End date

**Returns:** `Promise<CollectionEvent[]>`

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const todayEvents = await collectionEventsService.getByDateRange(today, tomorrow);
console.log('Collections today:', todayEvents.length);
```

---

## Utility Functions (`src/utils/helpers.ts`)

### `getBinStatusColor(fillPercentage)`

Returns Tailwind color class based on fill level.

**Parameters:**
- `fillPercentage` (number): Current fill level (0-100)

**Returns:** `string` (Tailwind color class)

```typescript
const color = getBinStatusColor(85);
// Returns: 'text-yellow-600' or similar
```

---

### `calculateDistance(lat1, lng1, lat2, lng2)`

Calculates distance between two coordinates using Haversine formula.

**Parameters:**
- `lat1, lng1` (number): First location
- `lat2, lng2` (number): Second location

**Returns:** `number` (distance in km)

```typescript
const distance = calculateDistance(28.7041, 77.1025, 28.7050, 77.1030);
console.log(`Distance: ${distance.toFixed(2)} km`);
```

---

### `formatDate(date)`

Formats a date for display.

**Parameters:**
- `date` (Date | Timestamp): Date to format

**Returns:** `string` (formatted date)

```typescript
const formatted = formatDate(new Date());
// Returns: "Jan 15, 2024"
```

---

### `getRelativeTime(date)`

Gets relative time string (e.g., "2 hours ago").

**Parameters:**
- `date` (Date | Timestamp): Date to calculate from

**Returns:** `string`

```typescript
const relative = getRelativeTime(new Date(Date.now() - 3600000));
// Returns: "1 hour ago"
```

---

### `clamp(value, min, max)`

Clamps a value between min and max.

**Parameters:**
- `value` (number): Value to clamp
- `min` (number): Minimum value
- `max` (number): Maximum value

**Returns:** `number`

```typescript
clamp(150, 0, 100);  // Returns: 100
clamp(-10, 0, 100);  // Returns: 0
clamp(50, 0, 100);   // Returns: 50
```

---

### `debounce(callback, delay)`

Creates a debounced function.

**Parameters:**
- `callback` (function): Function to debounce
- `delay` (number): Delay in milliseconds

**Returns:** `function` (debounced function)

```typescript
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

// Call multiple times, but only executes once after 300ms
handleSearch('test');
handleSearch('test2');
```

---

### `isServiceWorkerSupported()`

Checks if Service Workers are supported in browser.

**Returns:** `boolean`

```typescript
if (isServiceWorkerSupported()) {
  // Register service worker
}
```

---

### `isGeolocationSupported()`

Checks if Geolocation API is supported.

**Returns:** `boolean`

---

## Map Utilities (`src/utils/maps.ts`)

### `getCurrentLocation()`

Gets the user's current location.

**Returns:** `Promise<{latitude: number, longitude: number}>`

```typescript
try {
  const location = await getCurrentLocation();
  console.log('User location:', location);
} catch (error) {
  console.error('Geolocation denied');
}
```

---

### `watchLocation(callback, options)`

Watches for location changes continuously.

**Parameters:**
- `callback` (function): Called with location updates
- `options` (object): Geolocation options (optional)

**Returns:** `number` (watch ID)

```typescript
const watchId = watchLocation((location) => {
  console.log('Updated location:', location);
}, {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
});

// Later, stop watching:
navigator.geolocation.clearWatch(watchId);
```

---

### `encodePolyline(path)`

Encodes a path array as Google Maps polyline string.

**Parameters:**
- `path` (array): Array of coordinates [{lat, lng}, ...]

**Returns:** `string` (encoded polyline)

```typescript
const encoded = encodePolyline([
  {lat: 28.7041, lng: 77.1025},
  {lat: 28.7050, lng: 77.1030},
]);
// Can be used in Google Maps URLs
```

---

### `decodePolyline(encoded)`

Decodes a Google Maps polyline string.

**Parameters:**
- `encoded` (string): Encoded polyline string

**Returns:** `array` (coordinates)

```typescript
const path = decodePolyline('_glyEajzuO');
```

---

### `calculateCenter(coordinates)`

Calculates center point of coordinate array.

**Parameters:**
- `coordinates` (array): Array of [{lat, lng}, ...]

**Returns:** `{lat: number, lng: number}`

```typescript
const center = calculateCenter(binLocations);
// Use for map center on load
```

---

## Route Optimization (`src/utils/routeOptimization.ts`)

### `optimizeRoute(fullBins, currentLocation)`

Calculates optimal collection route using nearest-neighbor algorithm.

**Parameters:**
- `fullBins` (array): Array of Bin objects that need collection
- `currentLocation` (object): Current location {latitude, longitude}

**Returns:** 
```typescript
{
  waypoints: Array<{latitude, longitude, order}>;
  totalDistance: number;  // in km
  estimatedTime: number;  // in minutes
  sequence: Array<Bin>;   // bins in optimized order
}
```

**Example:**
```typescript
import { optimizeRoute } from '@/utils/routeOptimization';

const fullBins = bins.filter(b => b.status === 'full');
const route = optimizeRoute(fullBins, {
  latitude: 28.7041,
  longitude: 77.1025,
});

console.log('Total distance:', route.totalDistance, 'km');
console.log('Estimated time:', route.estimatedTime, 'minutes');
console.log('Collection sequence:', route.sequence.map(b => b.id));
```

---

## Sensor Simulation (`src/services/sensorSimulation.ts`)

### `startSensorSimulation()`

Starts the automated bin fill simulation.

**Returns:** `void`

**Notes:** 
- Runs every 10 seconds
- Automatically increments bin fill levels
- Triggers alerts when bins reach 95% full
- Plays sound and shows notifications

```typescript
import { startSensorSimulation } from '@/services/sensorSimulation';

// Start on dashboard load
useEffect(() => {
  startSensorSimulation();
}, []);
```

---

### `stopSensorSimulation()`

Stops the sensor simulation.

**Returns:** `void`

```typescript
stopSensorSimulation();  // Stop simulation
```

---

## State Management (Zustand Store)

### `useAppStore()`

Zustand store hook for global application state.

**State Properties:**

```typescript
// Auth
currentUser: User | null;
currentRole: 'admin' | 'field_worker' | null;
isAuthenticated: boolean;

// Data
bins: Bin[];
fullBins: Bin[];
alerts: Alert[];
unresolvedAlerts: Alert[];
fleetVehicles: FleetVehicle[];
collectionEvents: CollectionEvent[];

// UI
sidebarOpen: boolean;
isOnline: boolean;
theme: 'light' | 'dark' | 'auto';
notifications: Notification[];
selectedBin?: Bin;
selectedRoute?: OptimizedRoute;
loadingState: string;
```

**Action Methods:**

```typescript
// Auth actions
setCurrentUser(user)
setCurrentRole(role)
setIsAuthenticated(value)

// Data actions
setBins(bins)
setFullBins(bins)
setAlerts(alerts)
setUnresolvedAlerts(alerts)
setFleetVehicles(vehicles)
setCollectionEvents(events)

// UI actions
toggleSidebar()
setOnlineStatus(online)
setTheme(theme)
addNotification(notification)
clearNotification(id)
setSelectedBin(bin)
setSelectedRoute(route)
setLoadingState(state)
```

**Usage:**
```typescript
import { useAppStore } from '@/lib/store';

export const MyComponent = () => {
  const bins = useAppStore((state) => state.bins);
  const setBins = useAppStore((state) => state.setBins);
  const isOnline = useAppStore((state) => state.isOnline);

  return (
    <div>
      {isOnline ? 'Online' : 'Offline'}
      <p>Bins: {bins.length}</p>
    </div>
  );
};
```

---

## Type Definitions (`src/lib/types.ts`)

### `Bin`
```typescript
interface Bin {
  id?: string;
  latitude: number;
  longitude: number;
  fillPercentage: number;      // 0-100
  status: 'available' | 'nearly_full' | 'full';
  lastUpdated: any;            // Firestore Timestamp
  location?: string;
  capacity?: number;
}
```

### `Alert`
```typescript
interface Alert {
  id?: string;
  binId: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  createdAt: any;
  resolved: boolean;
  resolvedAt?: any;
  resolvedBy?: string;
}
```

### `UserProfile`
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'field_worker';
  photoURL?: string;
  createdAt: any;
  lastLogin: any;
}
```

### `FleetVehicle`
```typescript
interface FleetVehicle {
  id: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'on_route' | 'collecting';
  lastUpdated: any;
}
```

---

## Error Handling

All services include try-catch blocks and throw informative errors:

```typescript
try {
  await binsService.update('bin-123', {fillPercentage: 100});
} catch (error) {
  console.error('Failed to update bin:', error.message);
  // Handle error appropriately
}
```

---

## Best Practices

1. **Always unsubscribe from listeners** to prevent memory leaks:
   ```typescript
   const unsubscribe = binsService.subscribeToAll(callback);
   
   return () => {
     unsubscribe();  // In cleanup
   };
   ```

2. **Use useAppStore selectors** to prevent unnecessary re-renders:
   ```typescript
   const bins = useAppStore(state => state.bins);  // ✅ Good
   // NOT: const store = useAppStore(); store.bins  ❌ Bad
   ```

3. **Handle async operations** with proper loading states:
   ```typescript
   const [loading, setLoading] = useState(false);
   
   const handleClick = async () => {
     setLoading(true);
     try {
       await someAsyncAction();
     } finally {
       setLoading(false);
     }
   };
   ```

4. **Type your service calls** with TypeScript:
   ```typescript
   const bin: Bin = await binsService.getById('bin-123');
   ```

---

## Rate Limiting

Firestore free tier includes:
- 50,000 reads/month
- 20,000 writes/month
- 20,000 deletes/month

Optimize by:
- Batching operations
- Caching data where possible
- Using pagination for lists
- Setting appropriate listener refresh intervals

---

**Last Updated:** January 2024  
**Version:** 1.0.0
