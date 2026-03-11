# Google Maps Setup Guide

## Prerequisites
- Google Cloud Project
- Billing enabled on Google Cloud
- Google Maps API credentials

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project:
   - Click project dropdown → "New Project"
   - Name: `SmartDustbin Maps`
   - Organization: Select yours
   - Create

3. Wait for project to initialize
4. Select the new project from dropdown

## Step 2: Enable Google Maps APIs

1. Go to **APIs & Services** → **Library**

2. Search for and enable these APIs:
   - **Maps JavaScript API**
   - **Maps Static API**
   - **Distance Matrix API**
   - **Directions API**
   - **Geocoding API**

   For each API:
   - Click the API name
   - Click "Enable"
   - Wait for activation

## Step 3: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. An API key will be created
4. Copy it (you'll need it soon)

### Restrict the API Key (Recommended)

1. Click on the key or go to **Credentials**
2. Find your newly created key
3. Click on it to edit
4. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add valid domains/IPs:
     ```
     localhost
     localhost:3000
     yourdomain.com
     *.yourdomain.com
     ```

5. Under **API restrictions**:
   - Select **Restrict key**
   - Choose only the APIs you use:
     - Maps JavaScript API
     - Distance Matrix API
     - Directions API
     - Geocoding API

6. Click **Save**

## Step 4: Add API Key to Environment Variables

Update `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

## Step 5: Load Google Maps in Your App

The `MapPage` component will use this setup. The code already includes placeholder for loading:

**In your HTML/page:**
```html
<script
  async
  defer
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=marker"
></script>
```

Or import in React component:
```typescript
useEffect(() => {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=marker`;
  script.async = true;
  document.body.appendChild(script);
}, []);
```

## Step 6: Implement Map Features

### Basic Map Display
```typescript
useEffect(() => {
  if (!window.google) return;

  const map = new window.google.maps.Map(mapRef.current, {
    zoom: 13,
    center: { lat: 28.7041, lng: 77.1025 }, // Default: Delhi
  });

  setMapInstance(map);
}, []);
```

### Add Bin Markers
```typescript
const addBinMarkers = (map, bins) => {
  bins.forEach((bin) => {
    const marker = new window.google.maps.Marker({
      position: { lat: bin.latitude, lng: bin.longitude },
      map: map,
      title: `Bin ${bin.id}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: getBinStatusColor(bin.fillPercentage),
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      },
    });

    marker.addListener('click', () => {
      setSelectedBin(bin);
      map.setCenter(marker.getPosition());
      map.setZoom(15);
    });
  });
};
```

### Display Route Polyline
```typescript
const displayRoute = (map, waypoints) => {
  const polyline = new window.google.maps.Polyline({
    path: waypoints.map(wp => ({ lat: wp.latitude, lng: wp.longitude })),
    geodesic: true,
    strokeColor: '#3b82f6',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    map: map,
  });

  return polyline;
};
```

### Calculate Distance/Routes
```typescript
const calculateRoute = async (origin, destination) => {
  const service = new window.google.maps.DistanceMatrixService();
  
  const response = await service.getDistanceMatrix({
    origins: [origin],
    destinations: [destination],
    travelMode: 'DRIVING',
  });

  return response;
};
```

## Step 7: Configure Advanced Features

### Geocoding (Address to Coordinates)
```typescript
const geocodeAddress = async (address) => {
  const geocoder = new window.google.maps.Geocoder();
  
  const result = await geocoder.geocode({ address });
  
  if (result.results.length > 0) {
    return {
      lat: result.results[0].geometry.location.lat(),
      lng: result.results[0].geometry.location.lng(),
    };
  }
};
```

### Reverse Geocoding (Coordinates to Address)
```typescript
const getReverseGeocode = async (lat, lng) => {
  const geocoder = new window.google.maps.Geocoder();
  
  const result = await geocoder.geocode({
    location: { lat, lng },
  });
  
  if (result.results.length > 0) {
    return result.results[0].formatted_address;
  }
};
```

### Info Windows (Popup on Click)
```typescript
const showBinInfo = (map, bin, marker) => {
  const infoWindow = new window.google.maps.InfoWindow({
    content: `
      <div style="padding: 10px; font-family: Arial;">
        <strong>Bin ${bin.id}</strong>
        <br/>Fill: ${bin.fillPercentage.toFixed(1)}%
        <br/>Status: ${bin.status}
      </div>
    `,
  });

  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });
};
```

## Cost Estimation

### Free Tier
- $200 free monthly credit
- Covers ~2,000,000 requests

### Pricing (After free tier)
- Maps Static API: $1.33 per 1,000 requests
- Distance Matrix: $0.005 per element
- Directions: $0.05 per request
- Geocoding: $0.005 per request

**Estimated monthly cost for 1000 bins:**
- 500 route calculations: $25
- 2,000 distance requests: $10
- Total: ~$35/month

## Alternative: Mapbox (No Cost Upfront)

If Google Maps costs are high, consider Mapbox:

1. Create account at [Mapbox](https://www.mapbox.com)
2. Get access token
3. Update environment variables
4. Replace Google Maps with Mapbox GL JS

Mapbox pricing:
- Free: 50,000 requests/month
- Paid: $0.50 per 1,000 requests above free

## Testing Maps Locally

Without actual API key, maps won't display. For development:

1. Create free trial Google Cloud project
2. Use temporary API key
3. Restrict to `localhost:3000` only
4. Replace before production

## Production Deployment

### Before Going Live
- ✅ Replace temporary API key with production key
- ✅ Update domain restrictions
- ✅ Enable billing alerts in Google Cloud Console
- ✅ Set up monitoring and logging
- ✅ Test all map features thoroughly
- ✅ Configure proper error handling

### Monitoring
Monitor in Google Cloud Console:
- **APIs & Services** → **Quotas**
- Set alerts if usage spikes
- Review costs weekly

## Common Issues

### Map Not Displaying
```javascript
// Check: Is API key valid?
console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

// Check: Is window.google available?
console.log(typeof window.google);

// Check: Are libraries loaded?
console.log(window.google.maps.SymbolPath);
```

### CORS Errors
- ✅ Verify HTTP referrer restrictions
- ✅ Add current domain to allowed list
- ✅ Wait 5-10 minutes for restrictions to take effect

### Quota Exceeded
- ✅ Check usage in Google Cloud Console
- ✅ Reduce API call frequency
- ✅ Implement caching
- ✅ Upgrade quota limits

## Next Steps

1. ✅ Integrate actual bin location data
2. ✅ Implement real-time marker updates
3. ✅ Add route preview with distance calculation
4. ✅ Implement custom map styles
5. ✅ Add heatmaps for waste density areas

## Resources

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Distance Matrix API Guide](https://developers.google.com/maps/documentation/distance-matrix)
- [Directions API Guide](https://developers.google.com/maps/documentation/directions)
- [Geocoding API Guide](https://developers.google.com/maps/documentation/geocoding)
