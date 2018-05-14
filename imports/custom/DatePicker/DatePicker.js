import React from "react";

import moment from "moment";
import { SingleDatePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";

// for documentation, go to http://airbnb.io/react-dates

export default class DatePicker extends React.Component {
  /*=========================================================================
  >> props <<
  id
  placeholder
  date
  onDateChange
  isOutsideRange : allows past days
  disabled
  anchorDirection
  openDirection
  withPortal
  displayFormat
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    return (
      <SingleDatePicker
        id={this.props.id}
        placeholder={this.props.placeholder || "날짜입력"}
        date={this.props.date} // momentPropTypes.momentObj or null
        onDateChange={this.props.onDateChange}
        focused={this.state.focused}
        onFocusChange={({ focused }) => {
          this.setState({ focused });
        }}
        isOutsideRange={this.props.isOutsideRange}
        disabled={this.props.disabled}
        anchorDirection={this.props.anchorDirection}
        openDirection={this.props.openDirection}
        withPortal={this.props.withPortal}
        displayFormat={this.props.displayFormat || "YYYY-MM-DD"}
        noBorder
        numberOfMonths={1}
        verticalSpacing={0}
        daySize={30}
        hideKeyboardShortcutsPanel
        small
        monthFormat="YYYY[년] MM[월]"
        isDayBlocked={date => {
          if (date.day() === 6 || date.day() === 0) {
            return true;
          } else {
            return false;
          }
        }}
      />
    );
  }
}
