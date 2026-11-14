export type SoilType =
  | 'unknown'
  | 'clay'
  | 'silt'
  | 'sand'
  | 'loam'
  | 'peat'
  | 'chalk'
  | 'other';

export type IrrigationType =
  | 'unknown'
  | 'rainfed'
  | 'drip'
  | 'sprinkler'
  | 'flood'
  | 'other';

export type PriorityChoice = 'water' | 'soil' | 'market';

export interface FarmerPriorities {
  mainPriority: PriorityChoice | 'balanced';
  additionalPriorities: PriorityChoice[];
}

export interface Coordinates {
  latitude: string;
  longitude: string;
}

export interface CoordinateValidationResult {
  isValid: boolean;
  isComplete: boolean;
  parsedLat: number | null;
  parsedLon: number | null;
  latitudeError?: string;
  longitudeError?: string;
}

export interface FarmState {
  farmName: string;
  locationLabel: string;
  coordinates: Coordinates;
  cropRotationInput: string;
  cropRotationList: string[];
  soilType: SoilType;
  irrigationType: IrrigationType;
  priorities: FarmerPriorities;
}

export interface RotationDemonstrationCard {
  id: string;
  title: string;
  tag: string;
  summary: string;
  crops: string[];
  whatChanges: string[];
  whatToInvestigate: string[];
  whatNeedsLocalChecking: string[];
  whatInformationIsMissing: string[];
}

export const INITIAL_FARMER_PRIORITIES: FarmerPriorities = {
  mainPriority: 'balanced',
  additionalPriorities: [],
};

export const INITIAL_FARM_STATE: FarmState = {
  farmName: '',
  locationLabel: '',
  coordinates: {
    latitude: '',
    longitude: '',
  },
  cropRotationInput: '',
  cropRotationList: [],
  soilType: 'unknown',
  irrigationType: 'unknown',
  priorities: { ...INITIAL_FARMER_PRIORITIES },
};

export function validateCoordinates(latStr: string, lonStr: string): CoordinateValidationResult {
  const trimmedLat = latStr.trim();
  const trimmedLon = lonStr.trim();

  // If both empty, return clean incomplete state (no errors, no silent defaults)
  if (!trimmedLat && !trimmedLon) {
    return {
      isValid: false,
      isComplete: false,
      parsedLat: null,
      parsedLon: null,
    };
  }

  let latitudeError: string | undefined;
  let longitudeError: string | undefined;
  let parsedLat: number | null = null;
  let parsedLon: number | null = null;

  if (!trimmedLat) {
    latitudeError = 'Please enter a latitude, or leave both coordinate fields blank.';
  } else {
    const latNum = Number(trimmedLat);
    if (isNaN(latNum) || !isFinite(latNum)) {
      latitudeError = 'Latitude must be a valid number (for example: -33.86 or 52.52).';
    } else if (latNum < -90 || latNum > 90) {
      latitudeError = 'Latitude must be a number between -90 and 90.';
    } else {
      parsedLat = latNum;
    }
  }

  if (!trimmedLon) {
    longitudeError = 'Please enter a longitude, or leave both coordinate fields blank.';
  } else {
    const lonNum = Number(trimmedLon);
    if (isNaN(lonNum) || !isFinite(lonNum)) {
      longitudeError = 'Longitude must be a valid number (for example: 151.20 or -122.08).';
    } else if (lonNum < -180 || lonNum > 180) {
      longitudeError = 'Longitude must be a number between -180 and 180.';
    } else {
      parsedLon = lonNum;
    }
  }

  const isComplete = trimmedLat.length > 0 && trimmedLon.length > 0;
  const isValid = isComplete && !latitudeError && !longitudeError;

  return {
    isValid,
    isComplete,
    parsedLat,
    parsedLon,
    latitudeError,
    longitudeError,
  };
}
