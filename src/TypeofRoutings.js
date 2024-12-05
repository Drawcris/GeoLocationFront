import { services } from "@tomtom-international/web-sdk-services";
import tt from "@tomtom-international/web-sdk-maps";


const handleRouteFast = async (selectedRoute, map, routeLayer, setRouteLayer, markers, setMarkers, API_KEY, createMarker) => {
  if (!selectedRoute) return;

  if (routeLayer) {
    map.removeLayer("route");
    map.removeSource("route");
    setRouteLayer(null);
  }

  markers.forEach((marker) => marker.remove());
  setMarkers([]);

  try {
    const coordinatesPromises = selectedRoute.locations.map(async (location, index) => {
      if (index > 0) await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await services.fuzzySearch({
        key: API_KEY,
        query: `${location.address}, ${location.city}`,
      });
      const position = response.results[0]?.position;
      if (!position) {
        throw new Error(`Nie znaleziono współrzędnych dla adresu: ${location.address}`);
      }

      createMarker(position, index, location, selectedRoute.locations.length);
      return position;
    });

    const coordinates = await Promise.all(coordinatesPromises);

    services
      .calculateRoute({
        key: API_KEY,
        locations: coordinates.map((coord) => `${coord.lng},${coord.lat}`),
        computeBestOrder: true,
        routeType: "fastest",
      })
      .then((response) => {
        const geojson = response.toGeoJson();
        map.addSource("route", {
          type: "geojson",
          data: geojson,
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#4a90e2",
            "line-width": 5,
          },
        });
        setRouteLayer("route");

        const bounds = new tt.LngLatBounds();
        coordinates.forEach((coord) => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 50 });
      })
      .catch((err) => console.error("Błąd przy obliczaniu trasy:", err));
  } catch (err) {
    console.error("Błąd przy pozyskiwaniu współrzędnych:", err);
  }
};

const handleRouteInOrder = async (selectedRoute, map, routeLayer, setRouteLayer, markers, setMarkers, API_KEY, createMarker) => {
  if (!selectedRoute) return;

  if (routeLayer) {
    map.removeLayer("route");
    map.removeSource("route");
    setRouteLayer(null);
  }

  markers.forEach((marker) => marker.remove());
  setMarkers([]);

  try {
    const coordinatesPromises = selectedRoute.locations.map(async (location, index) => {
      if (index > 0) await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await services.fuzzySearch({
        key: API_KEY,
        query: `${location.address}, ${location.city}`,
      });
      const position = response.results[0]?.position;
      if (!position) {
        throw new Error(`Nie znaleziono współrzędnych dla adresu: ${location.address}`);
      }

      createMarker(position, index, location, selectedRoute.locations.length);
      return position;
    });

    const coordinates = await Promise.all(coordinatesPromises);

    services
      .calculateRoute({
        key: API_KEY,
        locations: coordinates.map((coord) => `${coord.lng},${coord.lat}`),
        computeBestOrder: false,
        routeType: "fastest",
      })
      .then((response) => {
        const geojson = response.toGeoJson();
        map.addSource("route", {
          type: "geojson",
          data: geojson,
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#4a90e2",
            "line-width": 5,
          },
        });
        setRouteLayer("route");

        const bounds = new tt.LngLatBounds();
        coordinates.forEach((coord) => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 50 });
      })
      .catch((err) => console.error("Błąd przy obliczaniu trasy:", err));
  } catch (err) {
    console.error("Błąd przy pozyskiwaniu współrzędnych:", err);
  }
};

export { handleRouteFast, handleRouteInOrder };