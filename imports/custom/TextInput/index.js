import React from "react";

export default class TextInput extends React.Component {
  /*=========================================================================
  >> props <<
  className
  inputType
  id                 : for id and name attribute
  value
  onInputChange      : for onChange and onBlur function
  listID             : datalist id for autocomplete
  errorMessage
  ==========================================================================*/
  render() {
    return (
      <div className={this.props.className}>
        <input
          type={this.props.inputType}
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          onChange={this.props.onInputChange}
          onBlur={this.props.onInputChange}
          list={this.props.listID}
        />
        <span>{this.props.errorMessage}</span>
      </div>
    );
  }
}
