import React from 'react';

import AccountDetailView from '../AccountsPage/AccountDetailView';

export default class AccountName extends React.Component {
  /*=========================================================================
  >> props <<
  className
  accountID
  accountName
  query
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
    const query = this.props.query;
    let accountName = this.props.accountName;

    if (query && accountName.toLowerCase().indexOf(query) > -1) {
      const index = accountName.toLowerCase().indexOf(query);
      const matchingText = accountName.substring(index, index + query.length);
      accountName = accountName.replace(
        matchingText,
        `<span class="highlight">${matchingText}</span>`
      );
    }
    
    return (
      <div className={this.props.className + '-container'}>
        <a
          className={'link ' + this.props.className}
          onClick={this.onClick}
          dangerouslySetInnerHTML={{ __html: accountName }}
        />

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
