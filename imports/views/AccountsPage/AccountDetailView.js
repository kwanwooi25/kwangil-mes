import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';

export default class AccountDetailView extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen            : if modal is open
  accountID         : account ID to display
  onDetailViewClose : function to execute on modal close
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onClickOK = this.onClickOK.bind(this);
  }

  onClickOK(e) {
    e.preventDefault();
    this.props.onDetailViewClose();
  }

  getAccountDetails() {
    const account = AccountsData.findOne({ _id: this.props.accountID });
    return Object.keys(account).map(key => {
      const value = account[key];
      let icon = '';
      let href = '';
      switch (key) {
        case 'phone_1':
          icon = 'fa fa-phone';
          href = `tel:${value}`;
          break;
        case 'phone_2':
          icon = 'fa fa-phone';
          href = `tel:${value}`;
          break;
        case 'fax':
          icon = 'fa fa-fax';
          break;
        case 'email_1':
          icon = 'fa fa-envelope';
          href = `mailto:${value}`;
          break;
        case 'email_2':
          icon = 'fa fa-envelope';
          href = `mailto:${value}`;
          break;
        case 'address':
          icon = 'fa fa-map-marker';
          break;
        case 'memo':
          icon = 'fa fa-sticky-note';
          break;
      }

      if (key !== '_id' && account[key]) {
        return (
          <div className="account-detail__item" key={key} id={key}>
            <i className={icon}> </i>
            {href ? <a href={href}>{value}</a> : <p href={href}>{value}</p>}
          </div>
        );
      }
    });
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onDetailViewClose}
        ariaHideApp={false}
        className="boxed-view__box account-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>거래처 상세정보</h1>
        </div>
        <div className="boxed-view__content">
          <div className="account-detail__container">
            {this.getAccountDetails()}
          </div>
        </div>
        <div className="account-modal__button-group">
          <button className="button" onClick={this.onClickOK}>
            확인
          </button>
        </div>
      </Modal>
    );
  }
}
