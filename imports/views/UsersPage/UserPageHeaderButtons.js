import React from "react";

import UserModal from "./UserModal";

export default class UserPageHeaderButtons extends React.Component {
  /*=========================================================================
  >> props <<
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isUserModalOpen: false
    };

    this.onClickNew = this.onClickNew.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
  }

  onClickNew() {
    this.setState({ isUserModalOpen: true });
  }

  onModalClose() {
    this.setState({ isUserModalOpen: false });
  }

  render() {
    return (
      <div className="page-header__buttons">
        <button
          className="button button-with-icon-span page-header__button"
          onClick={this.onClickNew}
        >
          <i className="fa fa-plus fa-lg" />
          <span>신규</span>
        </button>

        {this.state.isUserModalOpen ? (
          <UserModal
            isOpen={this.state.isUserModalOpen}
            onModalClose={this.onModalClose}
          />
        ) : (
          undefined
        )}
      </div>
    );
  }
}
