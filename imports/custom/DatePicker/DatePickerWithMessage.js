import React from "react";

import DatePicker from './index';

export default class DatePickerWithMessage extends React.Component {
  /*=========================================================================
  >> props <<
  className
  id
  placeholder
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
        <DatePicker
          id={this.props.id}
          placehoder={this.props.placeholder}
          date={this.props.date}
          onDateChange={this.props.onDateChange}
          isOutsideRange={this.props.isOutsideRange}
        />
        <span>{this.props.errorMessage}</span>
      </div>
    );
  }
}
