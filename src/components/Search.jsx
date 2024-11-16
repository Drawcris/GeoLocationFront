// src/components/Search.js
import { useState } from "react";
import { services } from "@tomtom-international/web-sdk-services";
import tt from "@tomtom-international/web-sdk-maps";

const Search = ({ map, markers, setMarkers, API_KEY }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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
      <button onClick={handleSearch} className="button">
        Szukaj
      </button>
      <button onClick={handleClearSearch} className="button">
        Wyczyść
      </button>
    </div>
  );
};

export default Search;
