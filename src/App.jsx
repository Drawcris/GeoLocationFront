import { useRef, useEffect, useState } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import { services } from "@tomtom-international/web-sdk-services";
import axios from "axios";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import "./App.css";

const API_KEY = "A7x2Co2slX6ap1HDQbdUUcG3rJyKYaRA";
const WARSAW = [21.0122, 52.2297];

function App() {
  const mapElement = useRef();
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [apiAddresses, setApiAddresses] = useState([]);
  const [routeLayer, setRouteLayer] = useState(null);

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = tt.map({
        key: API_KEY,
        container: mapElement.current,
        center: WARSAW,
        zoom: 12,
      });

      setMap(mapInstance);
    };

    initializeMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Pobieranie adresów z API po załadowaniu komponentu
    axios.get("https://localhost:7213/api/Adresses")
      .then((response) => {
        setApiAddresses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching addresses from API:", error);
      });
  }, []);

  const handleSearch = () => {
    if (!searchQuery) return;

    services
      .fuzzySearch({
        key: API_KEY,
        query: searchQuery,
      })
      .then((response) => {
        const results = response.results;
        setSearchResults(results);

        markers.forEach((marker) => marker.remove());
        setMarkers([]);

        const newMarkers = results.map((result) => {
          const marker = new tt.Marker().setLngLat(result.position).addTo(map);

          const popup = new tt.Popup({ offset: [0, -30], closeButton: true })
            .setHTML(`
              <div>
                <strong>${result.poi?.name || "Brak nazwy"}</strong>
                <p>${result.address.freeformAddress}</p>
              </div>
            `);

          marker.setPopup(popup);

          marker.getElement().addEventListener("click", () => {
            map.flyTo({ center: result.position, zoom: 14 });
            popup.addTo(map);
          });

          return marker;
        });
        setMarkers(newMarkers);

        if (results.length > 0) {
          map.flyTo({ center: results[0].position, zoom: 14 });
        }
      })
      .catch((err) => console.error(err));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);

    markers.forEach((marker) => marker.remove());
    setMarkers([]);
  };

  const handleAddressClick = (address) => {
    services
      .fuzzySearch({
        key: API_KEY,
        query: address.adress,
      })
      .then((response) => {
        const result = response.results[0];
        if (result) {
          const position = result.position;
          map.flyTo({ center: position, zoom: 14 });

          const popup = new tt.Popup({ offset: [0, -30], closeButton: true })
            .setHTML(`
              <div>
                <strong>${address.adress}</strong>
              </div>
            `);

          const marker = new tt.Marker().setLngLat(position).addTo(map);
          marker.setPopup(popup).togglePopup();

          setMarkers((prevMarkers) => {
            prevMarkers.forEach((marker) => marker.remove());
            return [marker];
          });
        }
      })
      .catch((err) => console.error("Error fetching coordinates for address:", err));
  };

  const handleRoute = async () => {
    if (apiAddresses.length < 2) return; // Potrzebujemy co najmniej 2 punktów do wyznaczenia trasy

    if (routeLayer) {
      map.removeLayer(routeLayer);
      setRouteLayer(null);
    }

    try {
      const coordinatesPromises = apiAddresses.map(async (address) => {
        const response = await services.fuzzySearch({
          key: API_KEY,
          query: address.adress,
        });
        const position = response.results[0]?.position;
        if (!position) {
          throw new Error(`Nie znaleziono współrzędnych dla adresu: ${address.adress}`);
        }
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
          const routeSource = map.getSource("route");

          if (routeSource) {
            routeSource.setData(geojson);
          } else {
            const newRouteLayer = {
              id: "route",
              type: "line",
              source: {
                type: "geojson",
                data: geojson,
              },
              paint: {
                "line-color": "#4a90e2",
                "line-width": 5,
              },
            };
            map.addLayer(newRouteLayer);
            setRouteLayer(newRouteLayer);
          }

          const bounds = new tt.LngLatBounds();
          coordinates.forEach((coord) => bounds.extend(coord));
          map.fitBounds(bounds, { padding: 50 });
        })
        .catch((err) => console.error("Error calculating route:", err));
    } catch (err) {
      console.error("Error fetching coordinates:", err);
    }
  };

  return (
    <div className="App">
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj lokalizacji..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <div className="flex space-x-2 w-14">
          <button onClick={handleSearch} className="w-10 hover:bg-white">
            <img src="search.svg" alt="" />
          </button>
          <button onClick={handleClearSearch} className="w-10 hover:bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="bi bi-x-square fill-red-600 hover:fill-blue-500"
              viewBox="0 0 16 16"
            >
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mapDiv" ref={mapElement}></div>
      <div className="addresses-container">
        <h3>Adresy z API:</h3>
        {apiAddresses.map((address, index) => (
          <div key={index} className="result-item" onClick={() => handleAddressClick(address)}>
            {address.adress}
          </div>
        ))}
        <button onClick={handleRoute} className="route-button">
          Trasa
        </button>
      </div>
    </div>
  );
}

export default App;
