import moment from 'moment';

// passes moment() object
export const avoidWeekend = date => {
  if (date.day() === 6) {
    date = date.subtract(1, 'days');
  } else if (date.day() === 0) {
    date = date.add(1, 'days');
  }
  return date;
}
