import { CityPreset, POI, RouteOption } from './types';

export const CITY_PRESETS: CityPreset[] = [
  {
    id: 'sf',
    name: 'San Francisco',
    country: 'United States',
    coordinates: [-122.4194, 37.7749],
    zoom: 13.8,
    pitch: 50,
    bearing: -20,
  },
  {
    id: 'nyc',
    name: 'New York City',
    country: 'United States',
    coordinates: [-73.9851, 40.7488],
    zoom: 14.2,
    pitch: 55,
    bearing: 25,
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    coordinates: [-0.1276, 51.5072],
    zoom: 13.5,
    pitch: 45,
    bearing: -10,
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    coordinates: [139.7671, 35.6812],
    zoom: 14.0,
    pitch: 50,
    bearing: 15,
  },
];

export const MOCK_POIS: POI[] = [
  // SAN FRANCISCO POIs
  {
    id: 'poi-sf-1',
    name: 'Sightglass Coffee & Roastery',
    category: 'coffee',
    categoryLabel: 'Artisanal Coffee & Roastery',
    coordinates: [-122.4087, 37.7766],
    address: '270 7th St, San Francisco, CA 94103',
    city: 'San Francisco',
    rating: 4.8,
    reviewCount: 1420,
    priceLevel: '$$',
    status: 'Open Now · Closes 6 PM',
    isOpen: true,
    closingTime: '6:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'Iconic multi-story flagship roastery featuring single-origin espresso bars, hand-poured brews, exposed timber beams, and an open-air mezzanine overlooking the vintage cast-iron roaster.',
    phone: '+1 (415) 861-1313',
    website: 'https://sightglasscoffee.com',
    verified: true,
    amenities: ['Gigabit Wi-Fi', 'Pour-Over Bar', 'Outdoor Seating', 'Pastries Baked Daily', 'Wheelchair Accessible'],
    reviews: [
      {
        id: 'rev-1',
        author: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '2 days ago',
        comment: 'Best Ethiopian pour-over in the city. The ambient light pouring into the roastery makes it the ultimate work haven.',
      },
      {
        id: 'rev-2',
        author: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '1 week ago',
        comment: 'Top tier cold brew and almond cardamom croissant. Fantastic acoustics and design aesthetic.',
      },
    ],
  },
  {
    id: 'poi-sf-2',
    name: 'Tesla Supercharger Hub - SOMA',
    category: 'ev_charger',
    categoryLabel: 'Ultra-Fast EV Charging',
    coordinates: [-122.4011, 37.7854],
    address: '833 Mission St (5th & Mission Garage), San Francisco, CA',
    city: 'San Francisco',
    rating: 4.9,
    reviewCount: 528,
    priceLevel: '$$',
    status: 'Open 24/7 · 16 Stalls Available',
    isOpen: true,
    photos: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1558441719-5a8a1a3641fb?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'V3 250kW Supercharging station with 24 dedicated stalls. Convenient covered parking with quick escalator access to Yerba Buena Gardens, Westfield, and fine dining.',
    phone: '+1 (877) 798-3752',
    website: 'https://tesla.com/supercharger',
    verified: true,
    amenities: ['V3 250kW Peak', 'CCS Compatibility', 'Restrooms Nearby', '24/7 Security Patrol', 'Covered Parking'],
    reviews: [
      {
        id: 'rev-3',
        author: 'David Chen',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: 'Yesterday',
        comment: 'Charged from 15% to 80% in 18 minutes flat! Easy in and out right next to Target and Metreon.',
      },
    ],
  },
  {
    id: 'poi-sf-3',
    name: 'Atelier Crenn',
    category: 'restaurant',
    categoryLabel: 'Three-Michelin-Starred French',
    coordinates: [-122.4348, 37.7983],
    address: '3127 Fillmore St, San Francisco, CA 94123',
    city: 'San Francisco',
    rating: 4.9,
    reviewCount: 980,
    priceLevel: '$$$$',
    status: 'Open · Closes 10:30 PM',
    isOpen: true,
    closingTime: '10:30 PM',
    photos: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      "Chef Dominique Crenn's three-Michelin-starred masterpiece, offering a multi-course culinary poem celebrating seafood, seasonality, and artistic gastronomy.",
    phone: '+1 (415) 440-0460',
    website: 'https://ateliercrenn.com',
    verified: true,
    amenities: ['3 Michelin Stars', 'Curated Wine Pairing', 'Tasting Menu', 'Sommelier Service', 'Valet Available'],
    reviews: [
      {
        id: 'rev-4',
        author: 'Julianne Hall',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '3 weeks ago',
        comment: 'An ethereal dining journey. Every course arrives like a piece of contemporary sculpture.',
      },
    ],
  },
  {
    id: 'poi-sf-4',
    name: 'Salesforce Park & Transit Center',
    category: 'park',
    categoryLabel: 'Urban Rooftop Park & Botanical Sanctuary',
    coordinates: [-122.3965, 37.7897],
    address: '425 Mission St, San Francisco, CA 94105',
    city: 'San Francisco',
    rating: 4.8,
    reviewCount: 2840,
    priceLevel: '$',
    status: 'Open Now · Closes 8 PM',
    isOpen: true,
    closingTime: '8:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'A 5.4-acre public rooftop botanical sanctuary perched four stories above downtown, featuring 600 trees, 16,000 plants, dancing water fountains, walking loops, and open-air amphitheater.',
    phone: '+1 (415) 597-5000',
    website: 'https://salesforcetransitcenter.com',
    verified: true,
    amenities: ['Free Public Wi-Fi', 'Botanical Walking Trail', 'Children Playground', 'Gondola Lift', 'Dog Friendly'],
    reviews: [
      {
        id: 'rev-5',
        author: 'Sophie Martin',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '4 days ago',
        comment: 'Unbelievable skyline views and peaceful bamboo groves right above the bustling bus terminal.',
      },
    ],
  },
  {
    id: 'poi-sf-5',
    name: 'The Jay Hotel, Autograph Collection',
    category: 'hotel',
    categoryLabel: 'Luxury Boutique Hotel',
    coordinates: [-122.4002, 37.7952],
    address: '433 Clay St, San Francisco, CA 94111',
    city: 'San Francisco',
    rating: 4.7,
    reviewCount: 420,
    priceLevel: '$$$$',
    status: 'Open 24/7 · Concierge Available',
    isOpen: true,
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'Refined urban sanctuary designed by AvroKO, celebrating San Francisco brutalist architecture with warm bronze, bespoke cocktails at The Third Floor terrace, and panoramic bay views.',
    phone: '+1 (415) 296-2900',
    website: 'https://thejayhotelsf.com',
    verified: true,
    amenities: ['Skyline Rooftop Lounge', 'State-of-the-Art Fitness Center', 'Valet Parking', 'Pet Friendly', 'Room Service'],
    reviews: [
      {
        id: 'rev-6',
        author: 'Nathaniel Reed',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Exquisite design details. The outdoor fire pits and rooftop cocktail bar are world class.',
      },
    ],
  },
  {
    id: 'poi-sf-6',
    name: 'Montgomery BART / Muni Station',
    category: 'transit',
    categoryLabel: 'Rapid Transit Hub',
    coordinates: [-122.4014, 37.7892],
    address: '598 Market St, San Francisco, CA 94104',
    city: 'San Francisco',
    rating: 4.3,
    reviewCount: 1650,
    priceLevel: '$',
    status: 'Open Now · Next Train in 3 min',
    isOpen: true,
    photos: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'Premier downtown multimodal subterranean subway station linking BART Transbay lines directly with Muni Metro subway lines J, K, L, M, N, and T.',
    phone: '+1 (510) 465-2278',
    website: 'https://bart.gov',
    verified: true,
    amenities: ['BART & Muni Direct Transfer', 'Clipper Card Contactless', 'Elevators & Escalators', 'Bike Stations'],
    reviews: [
      {
        id: 'rev-7',
        author: 'Rachel Lin',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
        rating: 4,
        date: '5 days ago',
        comment: 'Fast access straight to SFO airport or across the bay to Oakland and Berkeley.',
      },
    ],
  },
  {
    id: 'poi-sf-7',
    name: 'Ferry Building Marketplace',
    category: 'restaurant',
    categoryLabel: 'Artisan Food Hall & Farmers Market',
    coordinates: [-122.3937, 37.7955],
    address: '1 Ferry Building, San Francisco, CA 94111',
    city: 'San Francisco',
    rating: 4.8,
    reviewCount: 8900,
    priceLevel: '$$',
    status: 'Open Now · Closes 7 PM',
    isOpen: true,
    closingTime: '7:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'Historic 1898 waterfront clock tower landmark housing world-renowned food purveyors: Hog Island Oysters, Cowgirl Creamery, Blue Bottle Coffee, and acclaimed artisan bread bakeries.',
    phone: '+1 (415) 983-8030',
    website: 'https://ferrybuildingmarketplace.com',
    verified: true,
    amenities: ['Bay Views', 'Outdoor Promenade', 'Farmers Market Saturdays', 'Waterfront Dining', 'Ferry Terminal'],
    reviews: [
      {
        id: 'rev-8',
        author: 'Liam O’Connor',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '6 days ago',
        comment: 'Fresh oysters while watching the ferry arrive at golden hour. Absolute perfection.',
      },
    ],
  },
  {
    id: 'poi-sf-8',
    name: 'Yerba Buena Gardens',
    category: 'park',
    categoryLabel: 'Cultural Arts & Sculpture Park',
    coordinates: [-122.4025, 37.7858],
    address: '750 Howard St, San Francisco, CA 94103',
    city: 'San Francisco',
    rating: 4.7,
    reviewCount: 3120,
    priceLevel: '$',
    status: 'Open · Closes 10 PM',
    isOpen: true,
    closingTime: '10:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'Award-winning landscaped green space with a 50-foot cascading Martin Luther King Jr. memorial waterfall, outdoor performance lawns, and immediate proximity to SFMOMA.',
    phone: '+1 (415) 820-3550',
    website: 'https://yerbabuenagardens.com',
    verified: true,
    amenities: ['Memorial Waterfall', 'Public Art Sculptures', 'Adjacent Ice Skating Rink', 'Wheelchair Accessible'],
    reviews: [
      {
        id: 'rev-9',
        author: 'Chloe Bennet',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '1 week ago',
        comment: 'The sound of the waterfall drowns out all city traffic noise. Great spot for lunch.',
      },
    ],
  },
  {
    id: 'poi-sf-9',
    name: 'Electrify America Fast Charging - Embarcadero',
    category: 'ev_charger',
    categoryLabel: 'DC Fast EV Charging',
    coordinates: [-122.3968, 37.7981],
    address: '100 The Embarcadero, San Francisco, CA 94105',
    city: 'San Francisco',
    rating: 4.6,
    reviewCount: 310,
    priceLevel: '$$',
    status: 'Open 24/7 · 8 Stalls Active',
    isOpen: true,
    photos: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      '350kW CCS and CHAdeMO hyper-fast charging station located along the historic Embarcadero promenade.',
    phone: '+1 (833) 632-2778',
    website: 'https://electrifyamerica.com',
    verified: true,
    amenities: ['350kW Hyper-Fast', 'Illuminated Canopies', 'Contactless Tap-to-Pay', 'Waterfront Views'],
    reviews: [
      {
        id: 'rev-10',
        author: 'Kenji Sato',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '3 days ago',
        comment: 'Pulled 230kW on my Taycan without any thermal throttling. Clean and bright.',
      },
    ],
  },
  {
    id: 'poi-sf-10',
    name: 'Blue Bottle Coffee - Mint Plaza',
    category: 'coffee',
    categoryLabel: 'Single-Origin Coffee Bar',
    coordinates: [-122.4069, 37.7818],
    address: '66 Mint Plaza, San Francisco, CA 94103',
    city: 'San Francisco',
    rating: 4.7,
    reviewCount: 2200,
    priceLevel: '$$',
    status: 'Open Now · Closes 5 PM',
    isOpen: true,
    closingTime: '5:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'Charming pedestrian plaza cafe equipped with vintage Japanese Oji siphon bars, Kyoto-style iced drip towers, and fresh liege waffles.',
    phone: '+1 (510) 653-3394',
    website: 'https://bluebottlecoffee.com',
    verified: true,
    amenities: ['Kyoto Iced Coffee', 'Siphon Brew Bar', 'Outdoor Plaza Tables', 'Fresh Belgian Waffles'],
    reviews: [
      {
        id: 'rev-11',
        author: 'Claire Dufresne',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: 'Yesterday',
        comment: 'The 12-hour cold drip extraction produces unmatched chocolate and fruit notes.',
      },
    ],
  },
  {
    id: 'poi-sf-11',
    name: '1 Hotel San Francisco',
    category: 'hotel',
    categoryLabel: 'Sustainable Waterfront Luxury',
    coordinates: [-122.3929, 37.7932],
    address: '8 Mission St, San Francisco, CA 94105',
    city: 'San Francisco',
    rating: 4.8,
    reviewCount: 780,
    priceLevel: '$$$$',
    status: 'Open 24/7',
    isOpen: true,
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'Biophilic luxury retreat crafted with reclaimed redwood timbers, native greenery, spa suites overlooking the Bay Bridge, and farm-to-table cuisine at Terrene.',
    phone: '+1 (415) 278-3700',
    website: 'https://1hotels.com/san-francisco',
    verified: true,
    amenities: ['Bamford Wellness Spa', 'House Electric Audi e-tron', 'Pet Friendly Amenities', 'Rooftop Soaking Tubs'],
    reviews: [
      {
        id: 'rev-12',
        author: 'Harrison Forde',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '1 week ago',
        comment: 'The bay views and living plant walls throughout the lobby create an unmatched serene vibe.',
      },
    ],
  },
];

// Pre-computed realistic routes
export const MOCK_ROUTES: Record<string, RouteOption[]> = {
  sf_primary: [
    {
      id: 'route-fastest',
      title: 'Via Market St & 3rd St',
      subtitle: 'Fastest route · Typical traffic',
      mode: 'driving',
      distanceKm: 4.2,
      durationMin: 14,
      trafficDelayMin: 2,
      isRecommended: true,
      coordinates: [
        [-122.4194, 37.7749],
        [-122.415, 37.7778],
        [-122.41, 37.781],
        [-122.405, 37.7845],
        [-122.401, 37.7885],
        [-122.3937, 37.7955],
      ],
      steps: [
        {
          id: 's1',
          instruction: 'Head northeast on Civic Center Plaza toward Van Ness Ave',
          distance: '0.4 km',
          duration: '2 min',
          maneuver: 'straight',
        },
        {
          id: 's2',
          instruction: 'Turn right onto Market St and continue for 2.1 km',
          distance: '2.1 km',
          duration: '6 min',
          maneuver: 'turn-right',
        },
        {
          id: 's3',
          instruction: 'Slight left onto 3rd St toward Mission Bay & Financial District',
          distance: '1.1 km',
          duration: '4 min',
          maneuver: 'slight-left',
        },
        {
          id: 's4',
          instruction: 'Turn right onto The Embarcadero; Ferry Building will be on the left',
          distance: '0.6 km',
          duration: '2 min',
          maneuver: 'arrive',
        },
      ],
    },
    {
      id: 'route-alt-folsom',
      title: 'Via Folsom St & Embarcadero',
      subtitle: '+4 min · Avoids Market transit corridor',
      mode: 'driving',
      distanceKm: 4.8,
      durationMin: 18,
      trafficDelayMin: 5,
      coordinates: [
        [-122.4194, 37.7749],
        [-122.416, 37.771],
        [-122.408, 37.778],
        [-122.398, 37.786],
        [-122.391, 37.792],
        [-122.3937, 37.7955],
      ],
      steps: [
        {
          id: 's10',
          instruction: 'Head south on 9th St toward Folsom St',
          distance: '0.8 km',
          duration: '3 min',
          maneuver: 'straight',
        },
        {
          id: 's11',
          instruction: 'Turn left onto Folsom St with coordinated signals',
          distance: '2.6 km',
          duration: '8 min',
          maneuver: 'turn-left',
        },
        {
          id: 's12',
          instruction: 'Turn left onto The Embarcadero northbound',
          distance: '1.4 km',
          duration: '7 min',
          maneuver: 'turn-left',
        },
      ],
    },
  ],
  sf_transit: [
    {
      id: 'route-transit-subway',
      title: 'BART Yellow / Red Line',
      subtitle: 'Departs every 6 min from Civic Center',
      mode: 'transit',
      distanceKm: 3.8,
      durationMin: 11,
      isRecommended: true,
      coordinates: [
        [-122.4194, 37.7749],
        [-122.4137, 37.7798],
        [-122.407, 37.7845],
        [-122.4014, 37.7892],
        [-122.3965, 37.7936],
        [-122.3937, 37.7955],
      ],
      steps: [
        {
          id: 't1',
          instruction: 'Walk 2 min to Civic Center / UN Plaza BART Station Platform 1',
          distance: '150 m',
          duration: '2 min',
          maneuver: 'straight',
        },
        {
          id: 't2',
          instruction: 'Board BART Yellow Line (Antioch) or Red Line (Richmond) for 3 stops',
          distance: '3.2 km',
          duration: '6 min',
          maneuver: 'straight',
        },
        {
          id: 't3',
          instruction: 'Exit at Embarcadero Station via Market & Main St escalators',
          distance: '200 m',
          duration: '3 min',
          maneuver: 'arrive',
        },
      ],
    },
  ],
  sf_cycling: [
    {
      id: 'route-cycling-protected',
      title: 'Market St Protected Bikeway',
      subtitle: 'Flat profile · Dedicated green bike lane',
      mode: 'cycling',
      distanceKm: 4.0,
      durationMin: 16,
      elevationGainM: 12,
      calories: 145,
      isRecommended: true,
      coordinates: [
        [-122.4194, 37.7749],
        [-122.414, 37.779],
        [-122.408, 37.783],
        [-122.401, 37.789],
        [-122.396, 37.793],
        [-122.3937, 37.7955],
      ],
      steps: [
        {
          id: 'c1',
          instruction: 'Enter protected two-way bike lane on Market St',
          distance: '3.4 km',
          duration: '13 min',
          maneuver: 'straight',
        },
        {
          id: 'c2',
          instruction: 'Follow waterfront cycle track to the Ferry Building plaza',
          distance: '0.6 km',
          duration: '3 min',
          maneuver: 'arrive',
        },
      ],
    },
  ],
  sf_walking: [
    {
      id: 'route-walking-scenic',
      title: 'Historic Market St Walk',
      subtitle: 'Flat sidewalk · Bustling shopping & architectural landmarks',
      mode: 'walking',
      distanceKm: 3.9,
      durationMin: 48,
      calories: 220,
      isRecommended: true,
      coordinates: [
        [-122.4194, 37.7749],
        [-122.414, 37.779],
        [-122.408, 37.783],
        [-122.401, 37.789],
        [-122.396, 37.793],
        [-122.3937, 37.7955],
      ],
      steps: [
        {
          id: 'w1',
          instruction: 'Walk northeast along Market St past Westfield and Palace Hotel',
          distance: '3.5 km',
          duration: '42 min',
          maneuver: 'straight',
        },
        {
          id: 'w2',
          instruction: 'Cross Embarcadero at pedestrian signals directly into Ferry Building',
          distance: '0.4 km',
          duration: '6 min',
          maneuver: 'arrive',
        },
      ],
    },
  ],
};

// Simulated Traffic overlay polylines
export const MOCK_TRAFFIC_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    // Heavy traffic red line
    {
      type: 'Feature',
      properties: { level: 'heavy', color: '#EF4444', speed: '14 km/h' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-122.408, 37.781],
          [-122.403, 37.786],
          [-122.398, 37.791],
        ],
      },
    },
    // Moderate traffic amber line
    {
      type: 'Feature',
      properties: { level: 'moderate', color: '#F59E0B', speed: '32 km/h' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-122.42, 37.77],
          [-122.415, 37.774],
          [-122.41, 37.779],
        ],
      },
    },
    // Fast freeflow green lines
    {
      type: 'Feature',
      properties: { level: 'freeflow', color: '#10B981', speed: '55 km/h' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-122.395, 37.78],
          [-122.39, 37.788],
          [-122.388, 37.796],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { level: 'freeflow', color: '#10B981', speed: '65 km/h' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-122.428, 37.765],
          [-122.422, 37.768],
          [-122.415, 37.771],
        ],
      },
    },
  ],
};

// Simulated Transit Network overlay (BART & Muni subway lines)
export const MOCK_TRANSIT_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    // Market St Subway (Blue/Yellow lines)
    {
      type: 'Feature',
      properties: { name: 'Market St Subway Trunk', line: 'BART Transbay', color: '#06B6D4' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-122.422, 37.772],
          [-122.4137, 37.7798],
          [-122.407, 37.7845],
          [-122.4014, 37.7892],
          [-122.3965, 37.7936],
          [-122.38, 37.805],
        ],
      },
    },
    // Central Subway (T-Third line)
    {
      type: 'Feature',
      properties: { name: 'T Third Central Subway', line: 'Muni Metro', color: '#EF4444' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-122.407, 37.795],
          [-122.406, 37.788],
          [-122.401, 37.78],
          [-122.39, 37.772],
          [-122.388, 37.765],
        ],
      },
    },
  ],
};

// Simulated AQI heat points / regions
export const MOCK_AQI_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { aqi: 24, status: 'Good', color: '#10B981' },
      geometry: { type: 'Point', coordinates: [-122.435, 37.78] },
    },
    {
      type: 'Feature',
      properties: { aqi: 38, status: 'Good', color: '#10B981' },
      geometry: { type: 'Point', coordinates: [-122.41, 37.79] },
    },
    {
      type: 'Feature',
      properties: { aqi: 62, status: 'Moderate', color: '#FBBF24' },
      geometry: { type: 'Point', coordinates: [-122.395, 37.775] },
    },
    {
      type: 'Feature',
      properties: { aqi: 45, status: 'Good', color: '#10B981' },
      geometry: { type: 'Point', coordinates: [-122.419, 37.76] },
    },
  ],
};

// Simulated 3D Isometric Buildings for downtown core
export const MOCK_3D_BUILDINGS_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Salesforce Tower', height: 326, min_height: 0, color: '#38BDF8' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-122.3975, 37.7895],
            [-122.3965, 37.7895],
            [-122.3965, 37.7905],
            [-122.3975, 37.7905],
            [-122.3975, 37.7895],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Transamerica Pyramid', height: 260, min_height: 0, color: '#94A3B8' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-122.4035, 37.7948],
            [-122.4023, 37.7948],
            [-122.4023, 37.7958],
            [-122.4035, 37.7958],
            [-122.4035, 37.7948],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Millennium Tower', height: 197, min_height: 0, color: '#60A5FA' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-122.3962, 37.7902],
            [-122.3952, 37.7902],
            [-122.3952, 37.791],
            [-122.3962, 37.791],
            [-122.3962, 37.7902],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: '181 Fremont', height: 245, min_height: 0, color: '#818CF8' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-122.396, 37.7892],
            [-122.395, 37.7892],
            [-122.395, 37.79],
            [-122.396, 37.79],
            [-122.396, 37.7892],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: '555 California', height: 237, min_height: 0, color: '#64748B' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-122.4042, 37.7925],
            [-122.403, 37.7925],
            [-122.403, 37.7936],
            [-122.4042, 37.7936],
            [-122.4042, 37.7925],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Embarcadero Center 4', height: 174, min_height: 0, color: '#475569' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-122.3965, 37.7955],
            [-122.3952, 37.7955],
            [-122.3952, 37.7965],
            [-122.3965, 37.7965],
            [-122.3965, 37.7955],
          ],
        ],
      },
    },
  ],
};
