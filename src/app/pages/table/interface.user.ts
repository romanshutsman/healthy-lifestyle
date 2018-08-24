export interface User {
  name: string;
  phone: string;
  subscription_from: Date;
  subscription_to: Date;
  type: string;
  role?: string;
}
