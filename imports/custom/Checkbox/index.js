import React from 'react';

export default class Checkbox extends React.Component {
  /*=========================================================================
  >> props <<
  name
  label
  checked
  disabled
  onInputChange      : for onChange and onBlur function
  ==========================================================================*/

  render() {
    return (
      <label className="checkbox-container">
        <input
          type="checkbox"
          name={this.props.name}
          checked={this.props.checked}
          disabled={this.props.disabled}
          onChange={this.props.onInputChange}
          onBlur={this.props.onInputChange}
        />
        <span className="checkmark" />
        {this.props.label}
      </label>
    )
  }
}
