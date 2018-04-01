import React from 'react';

export default class RadioButton extends React.Component {
  /*=========================================================================
  >> props <<
  name
  label
  value
  disabled
  checked
  onInputChange      : for onChange and onBlur function
  ==========================================================================*/

  render() {
    return (
      <label className="radio-container">
        <input
          type="radio"
          name={this.props.name}
          value={this.props.value}
          checked={this.props.checked}
          disabled={this.props.disabled}
          onChange={this.props.onInputChange}
          onBlur={this.props.onInputChange}
        />
        <span className="radiomark" />
        {this.props.label}
      </label>
    )
  }
}
