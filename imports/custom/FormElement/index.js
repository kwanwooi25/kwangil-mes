import React from 'react';

import Textarea from '../Textarea';

export default class FormElement extends React.Component {
  /*=========================================================================
  >> props <<
  containerClassName : default="form-element-container"
  tagName
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
    const TagName = this.props.tagName;
    return (
      <div
        className={
          this.props.containerClassName
            ? this.props.containerClassName
            : 'form-element-container'
        }
      >
        <div className="form-element__label">
          <label htmlFor={this.props.id}>{this.props.label}</label>
        </div>
        <div className="form-element">
          {TagName === 'Textarea' ? (
            <Textarea
              id={this.props.id}
              value={this.props.value}
              onInputChange={this.props.onInputChange}
            />
          ) : (
            <TagName
              type={this.props.inputType}
              id={this.props.id}
              name={this.props.id}
              value={this.props.value}
              checked={this.props.checked}
              onChange={this.props.onInputChange}
              onBlur={this.props.onInputChange}
              list={this.props.listID}
            />
          )}
          {this.props.errorMessage ? (
            <span>{this.props.errorMessage}</span>
          ) : (
            undefined
          )}
        </div>
      </div>
    );
  }
}
