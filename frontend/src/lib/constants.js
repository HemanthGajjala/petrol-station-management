// Tank capacities in kiloliters (KL)
export const TANK_CAPACITIES = {
  hsd1_tank: 16000,
  hsd2_tank: 22000,
  ms1_tank: 9000,
  ms2_tank: 9000,
  power1_tank: 9000
};

// Business Day Utilities
export const getBusinessDayFromDateTime = (dt) => {
  /**
   * Convert a datetime to the corresponding business day.
   * Business day runs from 8:30 AM to 8:30 AM next day.
   * Returns the date of the business day.
   */
  const businessDayStartHour = 8;
  const businessDayStartMinute = 30;
  
  const hour = dt.getHours();
  const minute = dt.getMinutes();
  
  // If time is 8:30 AM or later, it belongs to current date's business day
  if (hour > businessDayStartHour || (hour === businessDayStartHour && minute >= businessDayStartMinute)) {
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  } else {
    // If time is before 8:30 AM, it belongs to previous date's business day
    const prevDay = new Date(dt);
    prevDay.setDate(dt.getDate() - 1);
    return new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate());
  }
};

export const getCurrentBusinessDay = () => {
  /**Get the current business day based on current time.*/
  return getBusinessDayFromDateTime(new Date());
};

export const isNightShiftTime = () => {
  /**Check if current time is during night shift (8:30 PM to 8:30 AM).*/
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  const nightStartHour = 20; // 8:30 PM
  const nightStartMinute = 30;
  const dayStartHour = 8;     // 8:30 AM
  const dayStartMinute = 30;
  
  // Night shift spans midnight, so check if current time is after 8:30 PM or before 8:30 AM
  return (hour > nightStartHour || (hour === nightStartHour && minute >= nightStartMinute)) ||
         (hour < dayStartHour || (hour === dayStartHour && minute < dayStartMinute));
};

export const formatBusinessDayInfo = (businessDate) => {
  /**Format business day information for display.*/
  const startDateTime = new Date(businessDate);
  startDateTime.setHours(8, 30, 0, 0);
  
  const endDateTime = new Date(businessDate);
  endDateTime.setDate(businessDate.getDate() + 1);
  endDateTime.setHours(8, 30, 0, 0);
  
  return {
    businessDate: businessDate.toLocaleDateString('en-IN'),
    startTime: startDateTime.toLocaleString('en-IN'),
    endTime: endDateTime.toLocaleString('en-IN'),
    dayShiftPeriod: `${businessDate.toLocaleDateString('en-IN')} 8:30 AM - 8:30 PM`,
    nightShiftPeriod: `${businessDate.toLocaleDateString('en-IN')} 8:30 PM - ${endDateTime.toLocaleDateString('en-IN')} 8:30 AM`
  };
};

// Utility function to calculate tank fill percentage
export const calculateTankFillPercentage = (currentLevel, tankName) => {
  const capacity = TANK_CAPACITIES[tankName];
  if (!capacity || !currentLevel) return 0;
  
  const percentage = (currentLevel / capacity) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100%
};

// Helper function to get appropriate color class based on fill percentage
export const getTankFillColorClass = (percentage) => {
  if (percentage <= 20) return 'text-red-600 bg-red-50';
  if (percentage <= 40) return 'text-orange-600 bg-orange-50';
  if (percentage <= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
};
