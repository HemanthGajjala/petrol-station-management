// Test script to verify lib imports work correctly
import { cn } from './frontend/src/lib/utils.js';
import { 
  getCurrentBusinessDay, 
  formatBusinessDayInfo, 
  TANK_CAPACITIES 
} from './frontend/src/lib/constants.js';

console.log('Testing utils.js import...');
console.log('cn function:', typeof cn);
console.log('cn("test", "class"):', cn("test", "class"));

console.log('\nTesting constants.js imports...');
console.log('getCurrentBusinessDay:', typeof getCurrentBusinessDay);
console.log('formatBusinessDayInfo:', typeof formatBusinessDayInfo);
console.log('TANK_CAPACITIES:', Object.keys(TANK_CAPACITIES).length, 'tanks defined');

console.log('\nAll lib imports working correctly!');
