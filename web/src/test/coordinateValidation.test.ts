import { describe, it, expect } from 'vitest';
import { validateCoordinates } from '../types/farm';

describe('Farmer-Friendly Coordinate Validation Logic', () => {
  it('returns clean incomplete state when both coordinate fields are blank', () => {
    const result = validateCoordinates('', '');
    expect(result.isValid).toBe(false);
    expect(result.isComplete).toBe(false);
    expect(result.latitudeError).toBeUndefined();
    expect(result.longitudeError).toBeUndefined();
  });

  it('validates equator and prime meridian (0, 0)', () => {
    const result = validateCoordinates('0', '0');
    expect(result.isValid).toBe(true);
    expect(result.isComplete).toBe(true);
    expect(result.parsedLat).toBe(0);
    expect(result.parsedLon).toBe(0);
    expect(result.latitudeError).toBeUndefined();
    expect(result.longitudeError).toBeUndefined();
  });

  it('validates decimal zeroes with positive and negative signs (0.0, -0.0)', () => {
    const result = validateCoordinates('0.0', '-0.0');
    expect(result.isValid).toBe(true);
    expect(result.isComplete).toBe(true);
    expect(result.parsedLat).toBe(0);
    expect(result.parsedLon).toBe(-0);
  });

  it('validates Southern and Western hemisphere coordinates (negative values)', () => {
    // Santiago, Chile: -33.4489, -70.6693
    const result = validateCoordinates('-33.4489', '-70.6693');
    expect(result.isValid).toBe(true);
    expect(result.isComplete).toBe(true);
    expect(result.parsedLat).toBeCloseTo(-33.4489);
    expect(result.parsedLon).toBeCloseTo(-70.6693);
  });

  it('validates exact boundary coordinates (-90, 90, -180, 180)', () => {
    const northPole = validateCoordinates('90', '0');
    expect(northPole.isValid).toBe(true);
    expect(northPole.parsedLat).toBe(90);

    const southPole = validateCoordinates('-90', '0');
    expect(southPole.isValid).toBe(true);
    expect(southPole.parsedLat).toBe(-90);

    const antimeridianEast = validateCoordinates('0', '180');
    expect(antimeridianEast.isValid).toBe(true);
    expect(antimeridianEast.parsedLon).toBe(180);

    const antimeridianWest = validateCoordinates('0', '-180');
    expect(antimeridianWest.isValid).toBe(true);
    expect(antimeridianWest.parsedLon).toBe(-180);
  });

  it('returns friendly error for latitude out of bounds (> 90 or < -90)', () => {
    const tooHigh = validateCoordinates('90.0001', '0');
    expect(tooHigh.isValid).toBe(false);
    expect(tooHigh.latitudeError).toBe('Latitude must be a number between -90 and 90.');

    const tooLow = validateCoordinates('-90.0001', '0');
    expect(tooLow.isValid).toBe(false);
    expect(tooLow.latitudeError).toBe('Latitude must be a number between -90 and 90.');
  });

  it('returns friendly error for longitude out of bounds (> 180 or < -180)', () => {
    const tooEast = validateCoordinates('0', '180.001');
    expect(tooEast.isValid).toBe(false);
    expect(tooEast.longitudeError).toBe('Longitude must be a number between -180 and 180.');

    const tooWest = validateCoordinates('0', '-180.001');
    expect(tooWest.isValid).toBe(false);
    expect(tooWest.longitudeError).toBe('Longitude must be a number between -180 and 180.');
  });

  it('returns friendly error for non-numeric string values', () => {
    const invalidLat = validateCoordinates('forty', '12.5');
    expect(invalidLat.isValid).toBe(false);
    expect(invalidLat.latitudeError).toBe('Latitude must be a valid number (for example: -33.86 or 52.52).');

    const invalidLon = validateCoordinates('12.5', 'NaN');
    expect(invalidLon.isValid).toBe(false);
    expect(invalidLon.longitudeError).toBe('Longitude must be a valid number (for example: 151.20 or -122.08).');
  });

  it('prompts user if only one coordinate is provided', () => {
    const missingLon = validateCoordinates('45.0', '');
    expect(missingLon.isValid).toBe(false);
    expect(missingLon.longitudeError).toBe('Please enter a longitude, or leave both coordinate fields blank.');

    const missingLat = validateCoordinates('', '45.0');
    expect(missingLat.isValid).toBe(false);
    expect(missingLat.latitudeError).toBe('Please enter a latitude, or leave both coordinate fields blank.');
  });
});
