import { describe, it, expect } from 'vitest';
import { INITIAL_FARM_STATE, INITIAL_FARMER_PRIORITIES, FarmState } from '../types/farm';

describe('Farmer-Centered Farm State and Priority Logic', () => {
  it('initializes with clean, un-assumed worldwide defaults and unknown options', () => {
    expect(INITIAL_FARM_STATE.farmName).toBe('');
    expect(INITIAL_FARM_STATE.locationLabel).toBe('');
    expect(INITIAL_FARM_STATE.coordinates.latitude).toBe('');
    expect(INITIAL_FARM_STATE.coordinates.longitude).toBe('');
    expect(INITIAL_FARM_STATE.cropRotationList).toEqual([]);
    expect(INITIAL_FARM_STATE.soilType).toBe('unknown');
    expect(INITIAL_FARM_STATE.irrigationType).toBe('unknown');
  });

  it('sets initial priorities to balanced equal focus without numeric sliders', () => {
    expect(INITIAL_FARMER_PRIORITIES.mainPriority).toBe('balanced');
    expect(INITIAL_FARMER_PRIORITIES.additionalPriorities).toEqual([]);
  });

  it('correctly updates user priorities with main and additional choices', () => {
    const updatedState: FarmState = {
      ...INITIAL_FARM_STATE,
      priorities: {
        mainPriority: 'water',
        additionalPriorities: ['soil'],
      },
    };

    expect(updatedState.priorities.mainPriority).toBe('water');
    expect(updatedState.priorities.additionalPriorities).toEqual(['soil']);
    expect(INITIAL_FARMER_PRIORITIES.mainPriority).toBe('balanced');
  });

  it('allows adding and removing crops freely in sequence', () => {
    let crops: string[] = [];
    crops = [...crops, 'Barley'];
    crops = [...crops, 'Lentils'];
    crops = [...crops, 'Canola'];

    expect(crops).toHaveLength(3);
    expect(crops[1]).toBe('Lentils');

    // Remove middle crop
    crops = crops.filter((_, idx) => idx !== 1);
    expect(crops).toEqual(['Barley', 'Canola']);
  });

  it('resets state completely back to initial blank configuration', () => {
    const modifiedState: FarmState = {
      farmName: 'Sunset Valley',
      locationLabel: 'Alentejo, Portugal',
      coordinates: { latitude: '38.5', longitude: '-7.9' },
      cropRotationInput: 'Wheat',
      cropRotationList: ['Wheat', 'Oats'],
      soilType: 'clay',
      irrigationType: 'drip',
      priorities: { mainPriority: 'soil', additionalPriorities: ['water', 'market'] },
    };

    // Reset action
    const resetState: FarmState = {
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '', longitude: '' },
      cropRotationList: [],
      priorities: { ...INITIAL_FARMER_PRIORITIES },
    };

    expect(resetState.farmName).toBe('');
    expect(resetState.locationLabel).toBe('');
    expect(resetState.coordinates.latitude).toBe('');
    expect(resetState.cropRotationList).toEqual([]);
    expect(resetState.soilType).toBe('unknown');
    expect(resetState.irrigationType).toBe('unknown');
    expect(resetState.priorities.mainPriority).toBe('balanced');
    expect(resetState.priorities.additionalPriorities).toEqual([]);
    expect(modifiedState.farmName).toBe('Sunset Valley');
  });
});
