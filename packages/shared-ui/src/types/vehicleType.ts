export interface Vehicle {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  pricePerDay: number;
  image: string;
  passengers: number;
  transmission: string;
  fuelType: string;
  rating: number;
  available: boolean;
  features: string[];
  location: string;
  mileage?: number;
  airConditioning: boolean;
  gps: boolean;
  description?: string;
}