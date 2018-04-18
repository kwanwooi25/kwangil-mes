import React from "react";

export default class AccountSearch extends React.Component {
  /*=========================================================================
  >> props <<
  onInputSearchChange
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }
  onChange(e) {
    if (e.target.value !== "") {
      e.target.classList.add("hasValue");
    } else {
      e.target.classList.remove("hasValue");
    }

    const query = e.target.value.trim().toLowerCase();
    this.props.onInputSearchChange(query);
  }

  render() {
    return (
      <input
        className="page-header__search"
        type="text"
        placeholder="&#xf002;"
        onChange={this.onChange}
        onFocus={e => {
          e.target.select();
        }}
      />
    );
  }
}
