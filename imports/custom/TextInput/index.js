import React from "react";

export default class TextInput extends React.Component {
  /*=========================================================================
  >> props <<
  className
  inputType
  id                 : for id and name attribute
  value
  disabled
  onInputChange      : for onChange and onBlur function
  listID             : datalist id for autocomplete
  errorMessage
  min
  max
  step
  ==========================================================================*/
  render() {
    return (
      <div className={this.props.className}>
        <input
          type={this.props.inputType}
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          disabled={this.props.disabled}
          onChange={this.props.onInputChange}
          onBlur={this.props.onInputChange}
          list={this.props.listID}
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
        />
        <span>{this.props.errorMessage}</span>
      </div>
    );
  }
}
