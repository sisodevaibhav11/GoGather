const normalizeLocationName = (value = '') => value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseTimeToMinutes = (time = '') => {
    const [hours, minutes] = time.split(':').map(Number);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return null;
    }

    return (hours * 60) + minutes;
};

const isFutureOrToday = (dateString) => {
    const today = new Date();
    const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateString >= todayValue;
};

const isValidMobileNumber = (mobileNumber = '') => /^[+\d][\d\s-]{8,18}$/.test(mobileNumber.trim()) &&
    mobileNumber.replace(/\D/g, '').length >= 10 &&
    mobileNumber.replace(/\D/g, '').length <= 15;

const sanitizeMatchingWindow = (value) => {
    const parsed = Number(value);
    return [30, 45, 60].includes(parsed) ? parsed : 45;
};

module.exports = {
    normalizeLocationName,
    parseTimeToMinutes,
    isFutureOrToday,
    isValidMobileNumber,
    sanitizeMatchingWindow,
};
