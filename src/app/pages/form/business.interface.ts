export interface Business {
  name: string;
  type: string;
  webSite?: string;
  owner: string;
  description: string;
  id: number;
  key?: string;
  discountPercent?: number;
  lat: number;
  lng: number;
  photos: string[];
  premiumDiscount: {[key: string]: number};
  schedule: Schedule[];
}

export interface Schedule {
  from: string | null;
  from_h: string | 'am';
  to: string | null;
  to_h: string | 'pm';
  isOpen: boolean;
}
