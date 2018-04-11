import React from "react";

import moment from "moment";
import { SingleDatePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";

// for documentation, go to http://airbnb.io/react-dates

export default class App extends React.Component {
  /*=========================================================================
  >> props <<
  className
  id
  date
  onDateChange
  onFocusChange
  isOutsideRange : allows past days
  errorMessage
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    return (
      <div className={this.props.className}>
        <SingleDatePicker
          id={this.props.id}
          date={this.props.date} // momentPropTypes.momentObj or null
          onDateChange={this.props.onDateChange}
          focused={this.state.focused}
          onFocusChange={({ focused }) => {
            this.setState({ focused });
          }}
          noBorder
          numberOfMonths={1}
          verticalSpacing={0}
          daySize={30}
          hideKeyboardShortcutsPanel
          displayFormat="YYYY-MM-DD"
          small
          placeholder="날짜입력"
          monthFormat="YYYY[년] MM[월]"
          isOutsideRange={this.props.isOutsideRange}
          isDayBlocked={date => {
            if (date.day() === 6 || date.day() === 0) {
              return true;
            } else {
              return false;
            }
          }}
        />
        <span>{this.props.errorMessage}</span>
      </div>
    );
  }
}
