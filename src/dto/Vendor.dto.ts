export interface CreateVendorInput {
  name: string;
  ownerName: string;
  foodTypes: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}

export interface VendorLoginInput {
  email: string;
  password: string;
}

export interface VendorPayload {
  email: string;
  phone: string;
  _id: string;
  id: string;
  name: string;
  foodTypes: [string];
}

export interface EditVendorInputs {
  phone: string;
  id: string;
  name: string;
  foodTypes: [string];
  address: string;
}

export interface CreateOfferInputs {
  offerType: string;
  vendors: [any];
  title: string;
  description: string;
  minValue: number;
  offerAmount: number;
  startValidity: Date;
  endValidaity: Date;
  promoCode: string;
  promoType: string;
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}
