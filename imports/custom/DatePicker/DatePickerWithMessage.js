import React from "react";

import DatePicker from './DatePicker';

export default class DatePickerWithMessage extends React.Component {
  /*=========================================================================
  >> props <<
  className
  id
  placeholder
  date
  onDateChange
  isOutsideRange : allows past days
  disabled
  errorMessage
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    return (
      <div className={this.props.className}>
        <DatePicker
          id={this.props.id}
          placehoder={this.props.placeholder}
          date={this.props.date}
          onDateChange={this.props.onDateChange}
          disabled={this.props.disabled}
          isOutsideRange={this.props.isOutsideRange}
        />
        <span>{this.props.errorMessage}</span>
      </div>
    );
  }
}
