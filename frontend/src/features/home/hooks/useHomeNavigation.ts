import { useReducer, useEffect, useRef } from "react";
import { useRides } from "../hooks/useRides";
import { UseHomeNavigationProps } from "../../../serviceInterface";
import type { HomeNavigationState } from "../../../serviceInterface";

type HomeNavigationAction =
  | { type: 'SET_SELECTED_DESTINATION'; payload: string }
  | { type: 'SET_SELECTED_TIME_SLOT'; payload: string }
  | { type: 'SET_SHOW_TIME_SLOTS'; payload: boolean }
  | { type: 'SET_SHOW_RIDES'; payload: boolean }
  | { type: 'SET_SELECTED_DRIVER'; payload: any }
  | { type: 'SET_SELECTED_SEAT'; payload: number | null }
  | { type: 'RESET_TO_DESTINATION' }
  | { type: 'SET_TIMESLOTS_VIEW'; payload: { destination: string } }
  | { type: 'SET_RIDES_VIEW'; payload: { destination: string; timeSlot: string } };

const initialState: HomeNavigationState = {
  selectedDestination: "",
  selectedTimeSlot: "",
  showTimeSlots: false,
  showRides: false,
  selectedDriver: null,
  selectedSeat: null,
};

function homeNavigationReducer(state: HomeNavigationState, action: HomeNavigationAction): HomeNavigationState {
  switch (action.type) {
    case 'SET_SELECTED_DESTINATION':
      return { ...state, selectedDestination: action.payload };
    case 'SET_SELECTED_TIME_SLOT':
      return { ...state, selectedTimeSlot: action.payload };
    case 'SET_SHOW_TIME_SLOTS':
      return { ...state, showTimeSlots: action.payload };
    case 'SET_SHOW_RIDES':
      return { ...state, showRides: action.payload };
    case 'SET_SELECTED_DRIVER':
      return { ...state, selectedDriver: action.payload };
    case 'SET_SELECTED_SEAT':
      return { ...state, selectedSeat: action.payload };
    case 'RESET_TO_DESTINATION':
      return {
        ...initialState,
      };
    case 'SET_TIMESLOTS_VIEW':
      return {
        ...state,
        selectedDestination: action.payload.destination,
        showTimeSlots: true,
        showRides: false,
        selectedTimeSlot: "",
        selectedDriver: null,
        selectedSeat: null,
      };
    case 'SET_RIDES_VIEW':
      return {
        ...state,
        selectedDestination: action.payload.destination,
        selectedTimeSlot: action.payload.timeSlot,
        showTimeSlots: false,
        showRides: true,
        selectedDriver: null,
        selectedSeat: null,
      };
    default:
      return state;
  }
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
  const [state, dispatch] = useReducer(homeNavigationReducer, initialState);

  const isUpdatingHashRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const lastFetchRef = useRef<{ timeSlot: string; destination: string } | null>(null);
  const { fetchRidesForTimeSlot } = useRides(new Date());

  // Auto-show time slots when navigating from Users tab
  useEffect(() => {
    if (autoSelectDestination && !state.selectedDestination && !state.showTimeSlots) {
      dispatch({ type: 'SET_TIMESLOTS_VIEW', payload: { destination: "University of Calgary" } });
      isUpdatingHashRef.current = true;
      window.location.hash = `home/timeslots/${encodeURIComponent("University of Calgary")}`;
    }
  }, [autoSelectDestination, state.selectedDestination, state.showTimeSlots]);

  // Initialize from URL hash on mount (only once)
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const hash = window.location.hash.slice(1);
    if (hash.startsWith("home/")) {
      const parts = hash.split("/");
      if (parts[1] === "destination" || hash === "home") {
        // Default destination state
        dispatch({ type: 'RESET_TO_DESTINATION' });
        setShowSeatSelection(false);
        setShowPayment(false);
        setShowConfirmation(false);
      } else if (parts[1] === "timeslots") {
        const dest = decodeURIComponent(parts[2] || "University of Calgary");
        dispatch({ type: 'SET_TIMESLOTS_VIEW', payload: { destination: dest } });
        setShowSeatSelection(false);
        setShowPayment(false);
        setShowConfirmation(false);
      } else if (parts[1] === "rides") {
        const dest = decodeURIComponent(parts[2] || "University of Calgary");
        const timeSlot = decodeURIComponent(parts[3] || "");
        dispatch({ type: 'SET_RIDES_VIEW', payload: { destination: dest, timeSlot } });
        setShowSeatSelection(false);
        setShowPayment(false);
        setShowConfirmation(false);
        if (timeSlot) {
          lastFetchRef.current = { timeSlot, destination: dest };
          fetchRidesForTimeSlot(timeSlot, dest);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      if (!isUpdatingHashRef.current) {
        const hash = window.location.hash.slice(1);
        if (hash.startsWith("home/")) {
          const parts = hash.split("/");
          if (parts[1] === "destination" || parts.length === 1 || hash === "home") {
            dispatch({ type: 'RESET_TO_DESTINATION' });
            setShowSeatSelection(false);
            setShowPayment(false);
            setShowConfirmation(false);
            lastFetchRef.current = null;
          } else if (parts[1] === "timeslots") {
            const dest = decodeURIComponent(parts[2] || "University of Calgary");
            dispatch({ type: 'SET_TIMESLOTS_VIEW', payload: { destination: dest } });
            setShowSeatSelection(false);
            setShowPayment(false);
            setShowConfirmation(false);
            lastFetchRef.current = null;
          } else if (parts[1] === "rides") {
            const dest = decodeURIComponent(parts[2] || "University of Calgary");
            const timeSlot = decodeURIComponent(parts[3] || "");
            dispatch({ type: 'SET_RIDES_VIEW', payload: { destination: dest, timeSlot } });
            setShowSeatSelection(false);
            setShowPayment(false);
            setShowConfirmation(false);
            // Only fetch if this is a different timeSlot/destination combination
            if (timeSlot && (!lastFetchRef.current || 
                lastFetchRef.current.timeSlot !== timeSlot || 
                lastFetchRef.current.destination !== dest)) {
              lastFetchRef.current = { timeSlot, destination: dest };
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
    if (state.showTimeSlots && state.selectedDestination) {
      hash = `home/timeslots/${encodeURIComponent(state.selectedDestination)}`;
    } else if (state.showRides && state.selectedDestination && state.selectedTimeSlot) {
      hash = `home/rides/${encodeURIComponent(state.selectedDestination)}/${encodeURIComponent(state.selectedTimeSlot)}`;
    } else if (!state.showTimeSlots && !state.showRides) {
      hash = "home/destination";
    }

    // Don't update hash if booking flow is active
    if (showSeatSelection || showPayment || showConfirmation) return;

    const currentHash = window.location.hash.slice(1);
    if (currentHash !== hash) {
      isUpdatingHashRef.current = true;
      window.location.hash = hash;
    }
  }, [state.showTimeSlots, state.showRides, state.selectedDestination, state.selectedTimeSlot, showSeatSelection, showPayment, showConfirmation]);

  return {
    selectedDestination: state.selectedDestination,
    setSelectedDestination: (value: string) => dispatch({ type: 'SET_SELECTED_DESTINATION', payload: value }),
    selectedTimeSlot: state.selectedTimeSlot,
    setSelectedTimeSlot: (value: string) => dispatch({ type: 'SET_SELECTED_TIME_SLOT', payload: value }),
    showTimeSlots: state.showTimeSlots,
    setShowTimeSlots: (value: boolean) => dispatch({ type: 'SET_SHOW_TIME_SLOTS', payload: value }),
    showRides: state.showRides,
    setShowRides: (value: boolean) => dispatch({ type: 'SET_SHOW_RIDES', payload: value }),
    selectedDriver: state.selectedDriver,
    setSelectedDriver: (value: any) => dispatch({ type: 'SET_SELECTED_DRIVER', payload: value }),
    selectedSeat: state.selectedSeat,
    setSelectedSeat: (value: number | null) => dispatch({ type: 'SET_SELECTED_SEAT', payload: value }),
    isUpdatingHashRef
  };
}