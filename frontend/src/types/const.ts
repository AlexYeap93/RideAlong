import { Home, Users, User, Car, Shield } from "lucide-react";

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// Available time slots for the ride
export const timeSlots = [
  "8:00 AM", "8:15 AM", "8:30 AM", "8:45 AM", "9:00 AM",
  "9:15 AM", "9:30 AM", "9:45 AM", "10:00 AM", "10:15 AM",
  "10:30 AM", "10:45 AM", "11:00 AM", "11:15 AM", "11:30 AM",
  "11:45 AM", "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
  "1:00 PM", "1:15 PM", "1:30 PM", "1:45 PM", "2:00 PM",
  "2:15 PM", "2:30 PM", "2:45 PM", "3:00 PM", "3:15 PM",
  "3:30 PM", "3:45 PM", "4:00 PM", "4:15 PM", "4:30 PM",
  "4:45 PM", "5:00 PM", "5:15 PM", "5:30 PM", "5:45 PM",
  "6:00 PM", "6:15 PM", "6:30 PM", "6:45 PM", "7:00 PM",
  "7:15 PM", "7:30 PM", "7:45 PM", "8:00 PM"
];

export const allTimeSlots = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM",
  "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM",
  "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"
];
export const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM",
  "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM",
  "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"
];

export const BASE_NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: Home
  },
  {
    id: "drivers",
    label: "For Drivers",
    icon: Car
  },
  {
    id: "users",
    label: "For Riders",
    icon: Users
  },
  {
    id: "profile",
    label: "Profile",
    icon: User
  }
];

export const ADMIN_NAV_ITEM = {
  id: "admin",
  label: "Admin",
  icon: Shield
};

export const UNIVERSITY_DESTINATION = {
  id: "uofcalgary",
  name: "University of Calgary",
  description: "Main Campus"
};

export const DESTINATIONS = [
  "University of Calgary",
  "DT",
  "Airport",
  "Chinook Centre",
  "Southcentre Mall",
  "Market Mall"
];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const TOTAL_SEATS: Record<string, number> = {
  "5-seater": 4,
  "7-seater": 6
};
