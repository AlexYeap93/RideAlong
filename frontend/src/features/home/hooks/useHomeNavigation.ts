import { useState, useEffect, useRef } from "react";
import { useRides } from "../hooks/useRides";

interface UseHomeNavigationProps {
  autoSelectDestination?: string;
  showSeatSelection?: boolean;
  showPayment?: boolean;
  showConfirmation?: boolean;
  setShowSeatSelection: (value: boolean) => void;
  setShowPayment: (value: boolean) => void;
  setShowConfirmation: (value: boolean) => void;
  isUpdatingHashRef: React.RefObject<boolean>; 

}

export function useHomeNavigation({
  autoSelectDestination,
  showSeatSelection,
  showPayment,
  showConfirmation,
  setShowSeatSelection,
  setShowPayment,
  setShowConfirmation
}: UseHomeNavigationProps) {
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [showRides, setShowRides] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const isUpdatingHashRef = useRef(false);
  const { fetchRidesForTimeSlot } = useRides(new Date());

  // Auto-show time slots when navigating from Users tab
  useEffect(() => {
    if (autoSelectDestination && !selectedDestination && !showTimeSlots) {
      setSelectedDestination("University of Calgary");
      setShowTimeSlots(true);
      setShowRides(false);
      isUpdatingHashRef.current = true;
      window.location.hash = `home/timeslots/${encodeURIComponent("University of Calgary")}`;
    }
  }, [autoSelectDestination, selectedDestination, showTimeSlots]);

  // Initialize from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith("home/")) {
      const parts = hash.split("/");
      if (parts[1] === "destination" || hash === "home") {
        // Default destination state
        setShowTimeSlots(false);
        setShowRides(false);
        setShowSeatSelection(false);
        setShowPayment(false);
        setShowConfirmation(false);
        setSelectedDestination("");
        setSelectedTimeSlot("");
        setSelectedDriver(null);
        setSelectedSeat(null);
      } else if (parts[1] === "timeslots") {
        const dest = decodeURIComponent(parts[2] || "University of Calgary");
        setSelectedDestination(dest);
        setShowTimeSlots(true);
        setShowRides(false);
        setShowSeatSelection(false);
        setShowPayment(false);
        setShowConfirmation(false);
        setSelectedTimeSlot("");
        setSelectedDriver(null);
        setSelectedSeat(null);
      } else if (parts[1] === "rides") {
        const dest = decodeURIComponent(parts[2] || "University of Calgary");
        const timeSlot = decodeURIComponent(parts[3] || "");
        setSelectedDestination(dest);
        setSelectedTimeSlot(timeSlot);
        setShowTimeSlots(false);
        setShowRides(true);
        setShowSeatSelection(false);
        setShowPayment(false);
        setShowConfirmation(false);
        setSelectedDriver(null);
        setSelectedSeat(null);
        if (timeSlot) {
          fetchRidesForTimeSlot(timeSlot, dest);
        }
      }
    }
  }, [fetchRidesForTimeSlot, setShowSeatSelection, setShowPayment, setShowConfirmation]);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      if (!isUpdatingHashRef.current) {
        const hash = window.location.hash.slice(1);
        if (hash.startsWith("home/")) {
          const parts = hash.split("/");
          if (parts[1] === "destination" || parts.length === 1 || hash === "home") {
            setShowTimeSlots(false);
            setShowRides(false);
            setShowSeatSelection(false);
            setShowPayment(false);
            setShowConfirmation(false);
            setSelectedDestination("");
            setSelectedTimeSlot("");
            setSelectedDriver(null);
            setSelectedSeat(null);
          } else if (parts[1] === "timeslots") {
            const dest = decodeURIComponent(parts[2] || "University of Calgary");
            setSelectedDestination(dest);
            setShowTimeSlots(true);
            setShowRides(false);
            setShowSeatSelection(false);
            setShowPayment(false);
            setShowConfirmation(false);
            setSelectedTimeSlot("");
            setSelectedDriver(null);
            setSelectedSeat(null);
          } else if (parts[1] === "rides") {
            const dest = decodeURIComponent(parts[2] || "University of Calgary");
            const timeSlot = decodeURIComponent(parts[3] || "");
            setSelectedDestination(dest);
            setSelectedTimeSlot(timeSlot);
            setShowTimeSlots(false);
            setShowRides(true);
            setShowSeatSelection(false);
            setShowPayment(false);
            setShowConfirmation(false);
            setSelectedDriver(null);
            setSelectedSeat(null);
            if (timeSlot) {
              fetchRidesForTimeSlot(timeSlot, dest);
            }
          }
        }
      }
      isUpdatingHashRef.current = false;
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [fetchRidesForTimeSlot, setShowSeatSelection, setShowPayment, setShowConfirmation]);

  // Update URL hash when navigation state changes
  useEffect(() => {
    let hash = "home";
    if (showTimeSlots && selectedDestination) {
      hash = `home/timeslots/${encodeURIComponent(selectedDestination)}`;
    } else if (showRides && selectedDestination && selectedTimeSlot) {
      hash = `home/rides/${encodeURIComponent(selectedDestination)}/${encodeURIComponent(selectedTimeSlot)}`;
    } else if (!showTimeSlots && !showRides) {
      hash = "home/destination";
    }

    // Don't update hash if booking flow is active
    if (showSeatSelection || showPayment || showConfirmation) return;

    const currentHash = window.location.hash.slice(1);
    if (currentHash !== hash) {
      isUpdatingHashRef.current = true;
      window.location.hash = hash;
    }
  }, [showTimeSlots, showRides, selectedDestination, selectedTimeSlot, showSeatSelection, showPayment, showConfirmation]);

  return {
    selectedDestination,
    setSelectedDestination,
    selectedTimeSlot,
    setSelectedTimeSlot,
    showTimeSlots,
    setShowTimeSlots,
    showRides,
    setShowRides,
    selectedDriver,
    setSelectedDriver,
    selectedSeat,
    setSelectedSeat,
    isUpdatingHashRef
  };
}