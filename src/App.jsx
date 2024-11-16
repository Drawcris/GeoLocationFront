import { useRef, useEffect, useState } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import { services } from "@tomtom-international/web-sdk-services";
import axios from "axios";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import "./App.css";
import Search from "./components/Search";

const API_KEY = "A7x2Co2slX6ap1HDQbdUUcG3rJyKYaRA";
const Zywiec = [19.19243, 49.68529];

function App() {
  const mapElement = useRef();
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [apiAddresses, setApiAddresses] = useState([]);
  const [routeLayer, setRouteLayer] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newZipCode, setNewZipCode] = useState("");

  const fetchAddresses = async () => {
    try {
      const response = await axios.get("https://localhost:7213/api/Adresses");
      setApiAddresses(response.data);
    } catch (error) {
      console.error("Error fetching addresses from API:", error);
    }
  };

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = tt.map({
        key: API_KEY,
        container: mapElement.current,
        center: Zywiec,
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
    fetchAddresses();
  }, []);

  const handleRoute = async () => {
    if (apiAddresses.length < 2) return; 

    if (routeLayer) {
      map.removeLayer("route");
      map.removeSource("route");
      setRouteLayer(null);
    }

    try {
      const coordinatesPromises = apiAddresses.map(async (address, index) => {    
        if (index > 0) await new Promise(resolve => setTimeout(resolve, 5000)); 
        const response = await services.fuzzySearch({
          key: API_KEY,
          query: `${address.address}, ${address.city}`,
        });
        console.log("Fuzzy search response:", response);
        const position = response.results[0]?.position;
        if (!position) {
          throw new Error(`Nie znaleziono współrzędnych dla adresu: ${address.address}`);
        }
        
        return position;
      });
  
      const coordinates = await Promise.all(coordinatesPromises);
      
      
      coordinates.forEach((coord, index) => {
        if (!coord?.lat || !coord?.lng) {
          throw new Error(`Niepoprawne współrzędne dla adresu o indeksie ${index}`);
        }
      });
  
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

  const handleAddAddress = async () => {
    try {
      await axios.post("https://localhost:7213/api/Adresses", {
        address: newAddress,
        city: newCity,
        zipCode: newZipCode,
      });
      setNewAddress("");
      setNewCity("");
      setNewZipCode("");
      fetchAddresses(); 
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete("https://localhost:7213/api/Adresses", { params: { id } });
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  return (
    <div className="App">
      <Search map={map} markers={markers} setMarkers={setMarkers} API_KEY={API_KEY} />
      <div className="mapDiv" ref={mapElement}></div>

      <div className="new-address-container">
        <input
          type="text"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="Dodaj nowy adres..."
        />
        <input
          type="text"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          placeholder="Miasto..."
        />
        <input
          type="text"
          value={newZipCode}
          onChange={(e) => setNewZipCode(e.target.value)}
          placeholder="Kod pocztowy..."
        />
        <button onClick={handleAddAddress} className="button">Dodaj</button>
      </div>

      <div className="addresses-container">
        <h3>Adresy z API:</h3>
        {apiAddresses.map((address) => (
          <div key={address.id} className="result-item">
            <span>{address.address}, {address.city} {address.zipCode}</span>
            <button onClick={() => handleDeleteAddress(address.id)} className="delete-button">Usuń</button>
          </div>
        ))}
        <button onClick={handleRoute} className="button">Wyznacz Trasę</button>
      </div>
    </div>
  );
}

export default App;
