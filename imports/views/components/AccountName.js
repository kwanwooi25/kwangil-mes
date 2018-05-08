import React from 'react';

import AccountDetailView from '../AccountsPage/AccountDetailView';

export default class AccountName extends React.Component {
  /*=========================================================================
  >> props <<
  className
  accountID
  accountName
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isDetailViewOpen: false,
      accountID: props.accountID
    };

    this.onClick = this.onClick.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
  }

  onClick(e) {
    this.setState({ isDetailViewOpen: true });
  }

  onModalClose() {
    this.setState({ isDetailViewOpen: false });
  }

  render() {
    return (
      <div className={this.props.className + '-container'}>
        <a className={'link ' + this.props.className} onClick={this.onClick}>
          {this.props.accountName}
        </a>

        {this.state.isDetailViewOpen && (
          <AccountDetailView
            isOpen={this.state.isDetailViewOpen}
            accountID={this.state.accountID}
            onModalClose={this.onModalClose}
          />
        )}
      </div>
    );
  }
}
