// Geocoding API helper to resolve destination names (City + Country) to lat/lon coordinates

export const resolveDestinationCoordinates = async (destination) => {
  if (!destination || !destination.trim()) {
    throw new Error('Destination name is required.');
  }

  const cleanDest = destination.trim();
  let searchCity = cleanDest;
  let targetCountry = '';

  if (cleanDest.includes(',')) {
    const parts = cleanDest.split(',');
    searchCity = parts[0].trim();
    targetCountry = parts.slice(1).join(',').trim();
  }

  // Strategy 1: Search using Open-Meteo Geocoding API
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=10&language=en&format=json`;
    const response = await fetch(geoUrl);

    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const results = data.results;
        let matchedLocation = null;

        if (targetCountry) {
          const targetCountryLower = targetCountry.toLowerCase();
          matchedLocation = results.find((res) => {
            const cName = (res.country || '').toLowerCase();
            const cCode = (res.country_code || '').toLowerCase();
            const admin1 = (res.admin1 || '').toLowerCase();
            return (
              cName.includes(targetCountryLower) ||
              targetCountryLower.includes(cName) ||
              cCode === targetCountryLower ||
              admin1.includes(targetCountryLower)
            );
          });
        }

        // Fallback to exact city match or first result if no target country filter matched
        if (!matchedLocation) {
          matchedLocation = results.find((res) => res.name.toLowerCase() === searchCity.toLowerCase()) || results[0];
        }

        if (matchedLocation) {
          const { latitude, longitude, name, country } = matchedLocation;
          return {
            latitude: Number(latitude),
            longitude: Number(longitude),
            name: name || searchCity,
            country: country || targetCountry || '',
            displayName: country ? `${name}, ${country}` : (targetCountry ? `${name}, ${targetCountry}` : name)
          };
        }
      }
    }
  } catch (err) {
    console.warn('Open-Meteo geocoding failed, trying Nominatim fallback:', err);
  }

  // Strategy 2: Fallback to OpenStreetMap Nominatim API
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanDest)}&limit=1`;
    const nomResponse = await fetch(nomUrl, {
      headers: {
        'Accept-Language': 'en'
      }
    });

    if (nomResponse.ok) {
      const nomData = await nomResponse.json();
      if (nomData && nomData.length > 0) {
        const first = nomData[0];
        return {
          latitude: Number(first.lat),
          longitude: Number(first.lon),
          name: searchCity,
          country: targetCountry,
          displayName: first.display_name ? first.display_name.split(',').slice(0, 2).join(',') : cleanDest
        };
      }
    }
  } catch (err) {
    console.error('Nominatim geocoding failed:', err);
  }

  throw new Error(`Could not find map location for "${destination}". Please verify the city and country.`);
};
