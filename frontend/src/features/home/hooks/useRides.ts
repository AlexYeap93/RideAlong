import { useState, useCallback } from "react";
import { ridesAPI, transformRideData } from "../../../services/api";
import { toast } from "sonner";

export const useRides = (selectedDate: Date) => {
  const [rides, setRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to fetch rides for a time slot (memoized to prevent infinite loops)
  const fetchRidesForTimeSlot = useCallback(async (timeSlot: string, destination: string) => {
    setIsLoading(true);

    try {
      // Convert time slot to 24-hour format for backend
      const time24 = convertTo24Hour(timeSlot);
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Fetch available rides from backend
      const response = await ridesAPI.getAvailableRides({
        destination: destination || "University of Calgary",
        date: dateStr,
      });

      const transformedRides = response.data.map(transformRideData);
      
      // Filter by time slot (approximate match)
      const filteredRides = transformedRides.filter(ride => {
        const rawRide = response.data.find((r: any) => r.id === ride.id);
        if (!rawRide) return false;
        
        const backendTime = rawRide.ride_time || rawRide.time || '12:00:00';
        const backendTimeHM = backendTime.split(':').slice(0, 2).join(':');
        const selectedTimeHM = time24.split(':').slice(0, 2).join(':');
        
        return Math.abs(getTimeDifference(backendTimeHM, selectedTimeHM)) <= 30;
      });

      setRides(filteredRides);
    } catch (error: any) {
      toast.error("Failed to load rides", {
        description: error.message || "Please try again.",
      });
      setRides([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  return { rides, isLoading, fetchRidesForTimeSlot };
};

// Helper functions (can move to utils)
const convertTo24Hour = (time12h: string) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = String(parseInt(hours) + 12);
  return `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}:00`;
};

// Helper function to get time difference in minutes
  const getTimeDifference = (time1: string, time2: string): number => {
    // Handle both "HH:MM" and "HH:MM:SS" formats
    const parts1 = time1.split(':').map(Number);
    const parts2 = time2.split(':').map(Number);
    const h1 = parts1[0] || 0;
    const m1 = parts1[1] || 0;
    const h2 = parts2[0] || 0;
    const m2 = parts2[1] || 0;
    return Math.abs((h1 * 60 + m1) - (h2 * 60 + m2));
  };