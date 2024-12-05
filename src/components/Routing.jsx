import React, { useRef, useEffect, useState } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import { services } from "@tomtom-international/web-sdk-services";
import axiosInstance from "../axiosInstance"; 
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { ScrollArea } from "@/components/ui/scroll-area";  
import { Separator } from "@/components/ui/separator";  
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import AddAddressButton from "./AddAddressButton";  
import { useAuth } from '../context/AuthContext';
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { handleRouteFast, handleRouteInOrder } from '../TypeofRoutings';

const API_KEY = "A7x2Co2slX6ap1HDQbdUUcG3rJyKYaRA";
const Zywiec = [19.19243, 49.68529];

function Routing() {
  const { user } = useAuth();
  const mapElement = useRef();
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [routeLayer, setRouteLayer] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  const fetchRoutes = async () => {
    try {
      const response = await axiosInstance.get(`/api/Routes/email/${user.email}`);
      setRoutes(response.data);
    } catch (error) {
      console.error("Error fetching routes from API:", error);
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
    if (user) {
      fetchRoutes();
    }
  }, [user]);

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

  const handleCompleteRoute = async () => {
    if (!selectedRoute) return;

    try {
      await axiosInstance.put(`/api/Routes/${selectedRoute.id}/complete`);
      window.location.reload();
    } finally {
      alert('Trasa została oznaczona jako ukończona');
    }
  };

  return (
    <>
      <div className="App">
        <div className="flex space-x-32 ml-20">
          <ScrollArea className="h-1/1 w-1/6 rounded-md border ml-14 mt-14">
            <div className="p-4">
              <div className=" text-center mb-5 space-x-5">
                <DropdownMenu>
                  <DropdownMenuTrigger className="bg-green-600 hover:bg-green-800 mt-5 rounded-sm h-10 w-60 text-white">
                    Wyznacz Trase <span className="bi bi-sign-turn-slight-right-fill"></span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Opcje Trasy</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleRouteFast(selectedRoute, map, routeLayer, setRouteLayer, markers, setMarkers, API_KEY, createMarker)}>Szybka</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRouteInOrder(selectedRoute, map, routeLayer, setRouteLayer, markers, setMarkers, API_KEY, createMarker)}>Po kolei</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Select onValueChange={(value) => {
                const route = routes.find((route) => route.id.toString() === value);
                console.log("Selected route:", route); 
                setSelectedRoute(route);
              }}>
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Wybierz trasę" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRoute && (
                <div key={selectedRoute.id} className="mb-6">
                  <div className="text-sm">
                    <p><b>Nazwa trasy:</b> {selectedRoute.name}</p>
                    <p><b>Status: </b>{selectedRoute.status}</p><br />
                    {selectedRoute.locations.map((location, index) => (
                      <div key={index} className="mb-4">
                        <p><b>Adres:</b> {location.address ? location.address : "brak"}</p>
                        <p><b>Miejscowość:</b> {location.city ? location.city : "brak"}</p>
                        <p><b>Kod Pocztowy:</b> {location.zipCode ? location.zipCode : "brak"}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <Button className="bg-green-700" onClick={() => setIsCompleteDialogOpen(true)}>
                      Oznacz jako ukończoną
                    </Button>
                    <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                      <DialogContent>
                        <VisuallyHidden>
                          <DialogTitle>My Dialog Title</DialogTitle>
                        </VisuallyHidden>
                        <DialogHeader>
                          <h3 className="text-lg font-semibold">Potwierdzenie</h3>
                        </DialogHeader>
                        <p>Czy na pewno chcesz oznaczyć tę trasę jako ukończoną?</p>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                            Anuluj
                          </Button>
                          <Button className="bg-orange-400 hover:bg-blue-800" onClick={handleCompleteRoute}>
                            Potwierdź
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Separator className="my-2" />
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="w-1/2 rounded-lg mt-10 RoutemapDiv" ref={mapElement}></div>
        </div>
      </div>
    </>
  );
}

export default Routing;