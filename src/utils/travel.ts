import moment from 'moment';
import { Budget, Destination, Trip, TripItem } from '@/models/travel';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const calculateTotalBudget = (budget: Budget): number => {
  return (
    budget.food +
    budget.accommodation +
    budget.transportation +
    budget.activities +
    budget.other
  );
};

export const calculateTripDuration = (startDate: string, endDate: string): number => {
  const start = moment(startDate);
  const end = moment(endDate);
  return end.diff(start, 'days') + 1; // Include both start and end days
};

export const generateDatesArray = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = moment(startDate);
  const end = moment(endDate);
  
  for (let date = moment(start); date.isSameOrBefore(end); date.add(1, 'days')) {
    dates.push(date.format('YYYY-MM-DD'));
  }
  
  return dates;
};

export const generateTripId = (): string => {
  return `trip-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const generateItemId = (): string => {
  return `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const getTripItemsByDate = (trip: Trip, date: string): TripItem[] => {
  return trip.items
    .filter((item) => item.date === date)
    .sort((a, b) => a.order - b.order);
};

export const getDestinationById = (destinations: Destination[], id: string): Destination | undefined => {
  return destinations.find((dest) => dest.id === id);
};

export const calculateTravelTime = (fromId: string, toId: string): number => {
  // In a real application, this would be calculated based on actual distances
  // For now, we'll return a mock travel time between 30 minutes and 3 hours
  return Math.floor(Math.random() * (180 - 30 + 1) + 30);
};

export const createDefaultBudget = (): Budget => {
  return {
    food: 0,
    accommodation: 0,
    transportation: 0,
    activities: 0,
    other: 0,
  };
};

export const createDefaultTrip = (): Trip => {
  // Để người dùng tự chọn ngày, không đặt mặc định
  return {
    id: generateTripId(),
    name: 'Chuyến đi mới',
    startDate: '',
    endDate: '',
    items: [],
    budget: createDefaultBudget(),
  };
}; 