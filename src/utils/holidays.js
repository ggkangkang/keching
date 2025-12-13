// Common holidays and special days
export const holidays = [
    {
        name: "New Year's Day",
        month: 0, // January
        day: 1,
        emoji: '🎉',
        type: 'holiday'
    },
    {
        name: "Valentine's Day",
        month: 1, // February
        day: 14,
        emoji: '💝',
        type: 'holiday'
    },
    {
        name: "Easter",
        month: null, // Calculated
        day: null,
        emoji: '🐰',
        type: 'holiday',
        calculated: true
    },
    {
        name: "Mother's Day",
        month: 4, // May
        day: null, // 2nd Sunday
        emoji: '👩',
        type: 'holiday',
        calculated: true,
        rule: 'secondSundayOfMay'
    },
    {
        name: "Father's Day",
        month: 5, // June
        day: null, // 3rd Sunday
        emoji: '👨',
        type: 'holiday',
        calculated: true,
        rule: 'thirdSundayOfJune'
    },
    {
        name: "Halloween",
        month: 9, // October
        day: 31,
        emoji: '🎃',
        type: 'holiday'
    },
    {
        name: "Thanksgiving",
        month: 10, // November
        day: null, // 4th Thursday
        emoji: '🦃',
        type: 'holiday',
        calculated: true,
        rule: 'fourthThursdayOfNovember'
    },
    {
        name: "Christmas Eve",
        month: 11, // December
        day: 24,
        emoji: '🎄',
        type: 'holiday'
    },
    {
        name: "Christmas",
        month: 11, // December
        day: 25,
        emoji: '🎄',
        type: 'holiday'
    },
    {
        name: "New Year's Eve",
        month: 11, // December
        day: 31,
        emoji: '🎉',
        type: 'holiday'
    }
];

// Calculate Easter Sunday for a given year (using Computus algorithm)
function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month, day);
}

// Get nth weekday of month (e.g., 2nd Sunday of May)
function getNthWeekdayOfMonth(year, month, weekday, n) {
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();

    // Calculate days until first occurrence of target weekday
    let daysUntilWeekday = (weekday - firstWeekday + 7) % 7;

    // Calculate date of nth occurrence
    const targetDate = 1 + daysUntilWeekday + (n - 1) * 7;

    return new Date(year, month, targetDate);
}

// Calculate dynamic holiday dates
function calculateHolidayDate(holiday, year) {
    if (!holiday.calculated) {
        // Fixed date holiday
        return new Date(year, holiday.month, holiday.day);
    }

    // Calculated holidays
    switch (holiday.rule) {
        case 'secondSundayOfMay':
            return getNthWeekdayOfMonth(year, 4, 0, 2); // May, Sunday, 2nd
        case 'thirdSundayOfJune':
            return getNthWeekdayOfMonth(year, 5, 0, 3); // June, Sunday, 3rd
        case 'fourthThursdayOfNovember':
            return getNthWeekdayOfMonth(year, 10, 4, 4); // November, Thursday, 4th
        default:
            if (holiday.name === 'Easter') {
                return calculateEaster(year);
            }
            return null;
    }
}

// Get next occurrence of a holiday
export function getNextHolidayDate(holiday) {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Try current year
    let holidayDate = calculateHolidayDate(holiday, currentYear);

    // If holiday has passed, get next year's date
    if (holidayDate && holidayDate < today) {
        holidayDate = calculateHolidayDate(holiday, currentYear + 1);
    }

    return holidayDate;
}

// Get all holidays for a specific year
export function getHolidaysForYear(year) {
    return holidays.map(holiday => {
        const date = calculateHolidayDate(holiday, year);
        return {
            ...holiday,
            date
        };
    }).filter(h => h.date !== null);
}

// Get upcoming holidays
export function getUpcomingHolidays() {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Get holidays for current and next year
    const currentYearHolidays = getHolidaysForYear(currentYear);
    const nextYearHolidays = getHolidaysForYear(currentYear + 1);

    const allHolidays = [...currentYearHolidays, ...nextYearHolidays];

    // Filter for upcoming only
    return allHolidays
        .filter(h => h.date >= today)
        .sort((a, b) => a.date - b.date);
}
