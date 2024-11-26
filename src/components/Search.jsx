import React, { useState, useEffect, useRef } from "react"; 
import { services } from "@tomtom-international/web-sdk-services";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import "../App.css";

const API_KEY = "A7x2Co2slX6ap1HDQbdUUcG3rJyKYaRA";
const Zywiec = [19.19243, 49.68529];


const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]); 
  const mapElement = useRef();
  

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = tt.map({
        key: API_KEY,
        container: mapElement.current,
        zoom: 12,
        center: Zywiec,
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

  // Funkcja do wyszukiwania lokalizacji
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

        // Usuń istniejące markery
        markers.forEach((marker) => marker.remove());
        setMarkers([]);

        // Dodaj nowe markery
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

    // Usuń wszystkie markery
    markers.forEach((marker) => marker.remove());
    setMarkers([]);
  };

  return (
    <>
    <div className="search-container mt-20">
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
      <div className="flex space-x-4">
      <button onClick={handleSearch}  >
      <i class="bi bi-search"></i>
      </button>
      <button onClick={handleClearSearch} >
      <i class="bi bi-x-square"></i>
      </button>
      </div>
    </div>
    <div className="SearchmapDiv" ref={mapElement}></div>

    </>
  );
};

export default Search;
