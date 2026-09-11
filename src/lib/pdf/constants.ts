export const COMPANY = {
  name: "José Alejandro Luna de León",
  brand: "NorthPeak Digital",
  whatsapp: "+52 812 198 0008",
  email: "a.luna@northpeakdigital.com.mx",
  web: "northpeakdigital.com.mx",
  pilotPrice: 2900,
  city: "Monterrey, Nuevo León",
};

export const COLORS = {
  green: [0, 229, 160] as [number, number, number],
  greenHex: "#00E5A0",
  dark: [5, 6, 10] as [number, number, number],
  darkCard: [12, 13, 18] as [number, number, number],
  text: [30, 30, 35] as [number, number, number],
  textMuted: [100, 100, 110] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  tableHeader: [5, 150, 105] as [number, number, number],
  tableRowAlt: [245, 247, 250] as [number, number, number],
  border: [220, 225, 230] as [number, number, number],
};

export const BUSINESS_TYPES = [
  "Salón de uñas",
  "Florería",
  "Inmobiliaria",
  "Autos",
  "Pilates",
  "Otro",
];

export interface EditableConfig {
  pilotPrice: number;
  pilotDays: number;
  adBudgetMin: number;
  adBudgetMax: number;
  ivaPercent: number;
  quoteValidDays: number;
}

export const DEFAULT_CONFIG: EditableConfig = {
  pilotPrice: 2900,
  pilotDays: 7,
  adBudgetMin: 1000,
  adBudgetMax: 2000,
  ivaPercent: 16,
  quoteValidDays: 15,
};

export interface ClientFormData {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  businessType: string;
  zone: string;
  startDate: string;
  clientId?: string;
  config: EditableConfig;
}
