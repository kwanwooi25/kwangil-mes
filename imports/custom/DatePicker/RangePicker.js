import React from "react";

import moment from "moment";
import { DateRangePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";

// for documentation, go to http://airbnb.io/react-dates

export default class RangePicker extends React.Component {
  /*=========================================================================
  >> props <<
  startDateId
  startDate
  startDatePlaceholderText
  endDateId
  endDate
  endDatePlaceholderText
  isOutsideRange
  onDatesChange
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    return (
      <DateRangePicker
        startDate={this.props.startDate}
        startDateId={this.props.startDateId}
        startDatePlaceholderText={this.props.startDatePlaceholderText}
        endDate={this.props.endDate}
        endDateId={this.props.endDateId}
        endDatePlaceholderText={this.props.endDatePlaceholderText}
        isOutsideRange={this.props.isOutsideRange}
        onDatesChange={this.props.onDatesChange}
        isDayBlocked={date => {
          if (date.day() === 6 || date.day() === 0) {
            return true;
          } else {
            return false;
          }
        }}
        focusedInput={this.state.focusedInput}
        onFocusChange={focusedInput => this.setState({ focusedInput })}
        noBorder
        small
        daySize={30}
        numberOfMonths={1}
        displayFormat="YYYY-MM-DD"
        monthFormat="YYYY[년] MM[월]"
        hideKeyboardShortcutsPanel
        customArrowIcon={<i className="fa fa-angle-right"></i>}
      />
    );
  }
}
