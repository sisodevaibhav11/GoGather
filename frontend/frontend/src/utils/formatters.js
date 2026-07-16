export function formatTripLabel(trip) {
  return `${trip.arrivalLocation?.name || 'Arrival'} on ${trip.travelDate} at ${trip.arrivalTime}`;
}

export function formatStatus(status) {
  return status
    .replace('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildShareUrl(shareCode) {
  return `${window.location.origin}/trip/${shareCode}`;
}
