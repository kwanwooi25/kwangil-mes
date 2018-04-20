import moment from 'moment';

export const countWeekdays = (startDate, endDate) => {
  startDate = moment(startDate).startOf('day');
  endDate = moment(endDate).startOf('day');
  let difference = endDate.diff(startDate, 'days');
  let weekendCounter = 0;

  for (let i = 0; i < difference; i++) {
    if (startDate.day() === 6 || startDate.day() === 0) {
      weekendCounter++;
    }
    startDate = startDate.add(1, 'days');
  }

  difference -= weekendCounter;

  return difference;
}
