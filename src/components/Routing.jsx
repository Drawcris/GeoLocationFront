import { useRef, useEffect, useState } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import { services } from "@tomtom-international/web-sdk-services";
import axiosInstance from "../axiosInstance"; // Import axiosInstance
import "@tomtom-international/web-sdk-maps/dist/maps.css";

import { ScrollArea } from "@/components/ui/scroll-area";  
import { Separator } from "@/components/ui/separator";  
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import AddAddressButton from "./AddAddressButton";  

const API_KEY = "A7x2Co2slX6ap1HDQbdUUcG3rJyKYaRA";
const Zywiec = [19.19243, 49.68529];

function Routing() {
  const mapElement = useRef();
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [apiAddresses, setApiAddresses] = useState([]);
  const [routeLayer, setRouteLayer] = useState(null);

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get("/api/Adresses");
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

  const createMarker = (position, index, address, totalAddresses) => {
    let markerElement = document.createElement("div");

    if (index === 0) {
      markerElement.className = "custom-marker";
      markerElement.innerHTML = `<i class="bi bi-cursor-fill"></i>`;
    } else if (index === totalAddresses - 1) {
      markerElement.className = "custom-marker";
      markerElement.innerHTML = '<i class="bi bi-flag"></i>';
    } else {
      markerElement.className = "custom-marker";
      markerElement.innerHTML = `<i class="bi bi-pin-map-fill"></i>`;
    }

    const marker = new tt.Marker({
      element: markerElement,
    })
      .setLngLat([position.lng, position.lat])
      .addTo(map);

    const popup = new tt.Popup({ offset: 30 }).setText(`${address.address}, ${address.city}`);
    marker.setPopup(popup);

    setMarkers((prevMarkers) => [...prevMarkers, marker]);
  };

  const handleRouteFast = async () => {
    if (apiAddresses.length < 2) return;

    if (routeLayer) {
      map.removeLayer("route");
      map.removeSource("route");
      setRouteLayer(null);
    }

    markers.forEach((marker) => marker.remove());
    setMarkers([]);

    try {
      const coordinatesPromises = apiAddresses.map(async (address, index) => {
        if (index > 0) await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await services.fuzzySearch({
          key: API_KEY,
          query: `${address.address}, ${address.city}`,
        });
        const position = response.results[0]?.position;
        if (!position) {
          throw new Error(`Nie znaleziono współrzędnych dla adresu: ${address.address}`);
        }

        createMarker(position, index, address, apiAddresses.length);
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

  const handleRouteInOrder = async () => {
    if (apiAddresses.length < 2) return;

    if (routeLayer) {
      map.removeLayer("route");
      map.removeSource("route");
      setRouteLayer(null);
    }

    markers.forEach((marker) => marker.remove());
    setMarkers([]);

    try {
      const coordinatesPromises = apiAddresses.map(async (address, index) => {
        if (index > 0) await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await services.fuzzySearch({
          key: API_KEY,
          query: `${address.address}, ${address.city}`,
        });
        const position = response.results[0]?.position;
        if (!position) {
          throw new Error(`Nie znaleziono współrzędnych dla adresu: ${address.address}`);
        }

        createMarker(position, index, address, apiAddresses.length);
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

  const handleDeleteAddress = async (id) => {
    try {
      await axiosInstance.delete("/api/Adresses", { params: { id } });
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  return (
    <>
    <div className="App">
    <div className="flex space-x-32 ml-20">
        
      <ScrollArea className="h-1/1 rounded-md border ml-14 mt-14">
        <div className="p-4">
        <div className=" text-center mb-5 space-x-5">
        <AddAddressButton  fetchAddresses={fetchAddresses} /> 

        <DropdownMenu>
        <DropdownMenuTrigger className="bg-green-600 hover:bg-green-800 mt-5 rounded-sm h-10 w-22 text-white">
        Wyznacz Trase <span className="bi bi-sign-turn-slight-right-fill"></span>
        
        </DropdownMenuTrigger>
        <DropdownMenuContent>
        <DropdownMenuLabel>Opcje Trasy</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRouteFast}>Szybka</DropdownMenuItem>
        <DropdownMenuItem onClick={handleRouteInOrder}>Po kolei</DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
        </div>
          {apiAddresses.map((address) => (
            <div key={address.id}>
              <div className="text-sm">
                <p><b>Adres:</b> {address.address ? address.address : "brak"}</p>
                <p><b>Miejscowość:</b> {address.city ? address.city : "brak"}</p>
                <p><b>Kod Pocztowy:</b> {address.zipCode ? address.zipCode : "brak" }</p>
              </div>
              <div className="text-center">
              <button onClick={() => handleDeleteAddress(address.id)} >
                <i className="bi bi-trash "></i>
              </button>
              </div>
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="w-1/2 rounded-lg mt-10 RoutemapDiv" ref={mapElement}></div>
    </div>
  </div>
  </>
);
}

export default Routing;