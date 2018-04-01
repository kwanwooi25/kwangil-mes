import React from 'react';

export default class Accordion extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    e.preventDefault();

    e.target.classList.toggle('open');
    e.target.nextElementSibling.classList.toggle('open');
  }

  render() {
    return (
      <button className="accordion open" onClick={this.onClick}>
        {this.props.title}
      </button>
    );
  }
}
