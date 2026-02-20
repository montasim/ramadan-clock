/**
 * Location Configuration
 * Bangladesh districts for location selection
 */

export const BANGLADESH_DISTRICTS = [
  // Barisal Division
  'Barguna',
  'Barisal',
  'Bhola',
  'Jhalokati',
  'Patuakhali',
  'Pirojpur',
  // Chittagong Division
  'Bandarban',
  'Brahmanbaria',
  'Chandpur',
  'Chittagong',
  'Comilla',
  "Cox's Bazar",
  'Feni',
  'Khagrachari',
  'Lakshmipur',
  'Noakhali',
  'Rangamati',
  // Dhaka Division
  'Dhaka',
  'Faridpur',
  'Gazipur',
  'Gopalganj',
  'Kishoreganj',
  'Madaripur',
  'Manikganj',
  'Munshiganj',
  'Narayanganj',
  'Narsingdi',
  'Rajbari',
  'Shariatpur',
  'Tangail',
  // Khulna Division
  'Bagerhat',
  'Chuadanga',
  'Jessore',
  'Jhenaidah',
  'Khulna',
  'Kushtia',
  'Magura',
  'Meherpur',
  'Narail',
  'Satkhira',
  // Mymensingh Division
  'Jamalpur',
  'Mymensingh',
  'Netrokona',
  'Sherpur',
  // Rajshahi Division
  'Bogra',
  'Chapainawabganj',
  'Joypurhat',
  'Naogaon',
  'Natore',
  'Pabna',
  'Rajshahi',
  'Sirajganj',
  // Rangpur Division
  'Dinajpur',
  'Gaibandha',
  'Kurigram',
  'Lalmonirhat',
  'Nilphamari',
  'Panchagarh',
  'Rangpur',
  'Thakurgaon',
  // Sylhet Division
  'Habiganj',
  'Moulvibazar',
  'Sunamganj',
  'Sylhet',
] as const;

export type District = typeof BANGLADESH_DISTRICTS[number];

export function isValidDistrict(value: string): value is District {
  return BANGLADESH_DISTRICTS.includes(value as District);
}

/**
 * Geographic coordinates for Bangladesh districts
 * Used for prayer time API requests
 */
export const LOCATION_COORDINATES: Record<District, { lat: number; lng: number }> = {
  // Barisal Division
  'Barguna': { lat: 22.4583, lng: 90.1333 },
  'Barisal': { lat: 22.7010, lng: 90.3531 },
  'Bhola': { lat: 22.6833, lng: 90.6667 },
  'Jhalokati': { lat: 22.6333, lng: 90.1833 },
  'Patuakhali': { lat: 22.3583, lng: 90.3167 },
  'Pirojpur': { lat: 22.5833, lng: 89.9833 },
  // Chittagong Division
  'Bandarban': { lat: 22.2000, lng: 92.2167 },
  'Brahmanbaria': { lat: 23.9667, lng: 90.7500 },
  'Chandpur': { lat: 23.2333, lng: 90.6667 },
  'Chittagong': { lat: 22.3569, lng: 91.7832 },
  'Comilla': { lat: 23.4667, lng: 91.1833 },
  "Cox's Bazar": { lat: 21.4333, lng: 92.0000 },
  'Feni': { lat: 23.0167, lng: 91.3833 },
  'Khagrachari': { lat: 23.1167, lng: 91.9833 },
  'Lakshmipur': { lat: 22.9333, lng: 90.8333 },
  'Noakhali': { lat: 22.8667, lng: 91.1000 },
  'Rangamati': { lat: 22.6333, lng: 92.1833 },
  // Dhaka Division
  'Dhaka': { lat: 23.8103, lng: 90.4125 },
  'Faridpur': { lat: 23.6000, lng: 89.8333 },
  'Gazipur': { lat: 23.9933, lng: 90.3833 },
  'Gopalganj': { lat: 23.0000, lng: 89.8333 },
  'Kishoreganj': { lat: 24.4333, lng: 90.7667 },
  'Madaripur': { lat: 23.1667, lng: 90.2000 },
  'Manikganj': { lat: 23.8667, lng: 89.9333 },
  'Munshiganj': { lat: 23.5333, lng: 90.5333 },
  'Narayanganj': { lat: 23.6167, lng: 90.5000 },
  'Narsingdi': { lat: 23.9167, lng: 90.7167 },
  'Rajbari': { lat: 23.7500, lng: 89.6500 },
  'Shariatpur': { lat: 23.2000, lng: 90.3500 },
  'Tangail': { lat: 24.2500, lng: 89.9167 },
  // Khulna Division
  'Bagerhat': { lat: 22.6500, lng: 89.7833 },
  'Chuadanga': { lat: 23.6333, lng: 89.0667 },
  'Jessore': { lat: 23.1667, lng: 89.2167 },
  'Jhenaidah': { lat: 23.5333, lng: 89.1500 },
  'Khulna': { lat: 22.8206, lng: 89.5404 },
  'Kushtia': { lat: 23.9000, lng: 89.1167 },
  'Magura': { lat: 23.4833, lng: 89.4167 },
  'Meherpur': { lat: 23.7667, lng: 88.9333 },
  'Narail': { lat: 23.1667, lng: 89.5000 },
  'Satkhira': { lat: 22.7167, lng: 89.0667 },
  // Mymensingh Division
  'Jamalpur': { lat: 24.9333, lng: 89.9333 },
  'Mymensingh': { lat: 24.7333, lng: 90.4000 },
  'Netrokona': { lat: 24.8833, lng: 90.7333 },
  'Sherpur': { lat: 25.0167, lng: 90.0167 },
  // Rajshahi Division
  'Bogra': { lat: 24.8500, lng: 89.3667 },
  'Chapainawabganj': { lat: 24.5667, lng: 88.2833 },
  'Joypurhat': { lat: 25.1000, lng: 89.0333 },
  'Naogaon': { lat: 24.8000, lng: 88.9333 },
  'Natore': { lat: 24.4167, lng: 88.9833 },
  'Pabna': { lat: 24.0000, lng: 89.2333 },
  'Rajshahi': { lat: 24.3733, lng: 88.5833 },
  'Sirajganj': { lat: 24.4500, lng: 89.7000 },
  // Rangpur Division
  'Dinajpur': { lat: 25.6333, lng: 88.6500 },
  'Gaibandha': { lat: 25.3167, lng: 89.5333 },
  'Kurigram': { lat: 25.8000, lng: 89.6500 },
  'Lalmonirhat': { lat: 25.9167, lng: 89.4500 },
  'Nilphamari': { lat: 25.9333, lng: 88.8667 },
  'Panchagarh': { lat: 26.3333, lng: 88.5500 },
  'Rangpur': { lat: 25.7333, lng: 89.2333 },
  'Thakurgaon': { lat: 26.0333, lng: 88.4667 },
  // Sylhet Division
  'Habiganj': { lat: 24.3833, lng: 91.4167 },
  'Moulvibazar': { lat: 24.4667, lng: 91.7667 },
  'Sunamganj': { lat: 24.9167, lng: 91.3833 },
  'Sylhet': { lat: 24.9036, lng: 91.8605 },
} as const;

/**
 * Get coordinates for a district
 */
export function getLocationCoordinates(district: District): { lat: number; lng: number } {
  return LOCATION_COORDINATES[district];
}
