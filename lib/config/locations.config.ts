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
