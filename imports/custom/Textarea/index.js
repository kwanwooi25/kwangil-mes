import React from "react";

export default class Textarea extends React.Component {
  /*=========================================================================
  >> props <<
  className
  id            : for id and name attribute
  value
  onInputChange : for onChange and onBlur function
  ==========================================================================*/

  componentDidMount() {
    const textarea = document.getElementById(this.props.id);
    textarea.style.cssText = "height: auto;";
    textarea.style.cssText = `height: ${textarea.scrollHeight - 10}px`;
    textarea.addEventListener("keydown", () => {
      setTimeout(() => {
        textarea.style.cssText = "height: auto;";
        textarea.style.cssText = `height: ${textarea.scrollHeight - 10}px`;
      }, 0);
    });
  }

  render() {
    return (
      <div className={this.props.className}>
        <textarea
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          onChange={this.props.onInputChange}
          onBlur={this.props.onInputChange}
          rows="1"
        />
      </div>
    );
  }
}
