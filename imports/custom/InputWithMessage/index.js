import React from 'react';

export default class InputWithMessage extends React.Component {
  /*=========================================================================
  >> props <<
  inputType
  id                 : for id and name attribute
  label
  value
  checked
  onInputChange      : for onChange and onBlur function
  listID             : datalist id for autocomplete
  errorMessage
  ==========================================================================*/

  render() {
    return (
      <div className="input-with-message">
        <input
          type={this.props.inputType}
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          checked={this.props.checked}
          onChange={this.props.onInputChange}
          onBlur={this.props.onInputChange}
          list={this.props.listID}
        />
        {this.props.errorMessage ? (
          <span>{this.props.errorMessage}</span>
        ) : (
          undefined
        )}
      </div>
    );
  }
}
