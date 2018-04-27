import React from 'react';

import { exportCSV } from '../../api/exportCSV';

import AccountModal from './AccountModal';
import AccountNewMultiModal from './AccountNewMultiModal';

export default class AccountPageHeaderButtons extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  accountsData
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData,
      isModalNewOpen: false,
      isModalNewMultiOpen: false
    };

    this.onClickExportExcel = this.onClickExportExcel.bind(this);
    this.onClickNewMulti = this.onClickNewMulti.bind(this);
    this.onClickNew = this.onClickNew.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData
    });
  }

  onClickNew() {
    this.setState({ isModalNewOpen: true });
  }

  onClickNewMulti() {
    this.setState({ isModalNewMultiOpen: true });
  }

  onModalClose() {
    this.setState({ isModalNewOpen: false, isModalNewMultiOpen: false });
  }

  onClickExportExcel() {
    const list = document.getElementById('account-list');
    const filename = '광일_거래처목록.csv';
    const slice = Array.prototype.slice;

    // get account list
    const lis = list.querySelectorAll('li');
    const accounts = [];
    const keys = [
      '_id',
      'name',
      'phone_1',
      'phone_2',
      'fax',
      'email_1',
      'email_2',
      'address',
      'memo'
    ];

    for (let i = 0; i < lis.length; i++) {
      accounts.push(
        this.state.accountsData.find(account => account._id === lis[i].id)
      );
    }

    // generate header csv
    const headerCSV =
      '거래처ID,거래처명,전화번호,전화번호,팩스,이메일,이메일,주소,메모';
    // generate body csv from account list
    const bodyCSV = accounts
      .map(account => {
        return keys
          .map(key => {
            if (account[key] === undefined) {
              return '""';
            } else {
              return '"t"'.replace('t', account[key]);
            }
          })
          .join(',');
      })
      .join('\r\n');

    exportCSV(headerCSV, bodyCSV, filename);
  }

  render() {
    return (
      <div className="page-header__buttons">
        <button
          className="button button-with-icon-span page-header__button"
          onClick={this.onClickExportExcel}
        >
          <i className="fa fa-table fa-lg" />
          <span>엑셀</span>
        </button>
        {this.state.isAdmin && (
          <button
            className="button button-with-icon-span page-header__button"
            onClick={this.onClickNewMulti}
          >
            <i className="fa fa-plus-square fa-lg" />
            <span>대량등록</span>
          </button>
        )}
        {(this.state.isAdmin || this.state.isManager) && (
          <button
            className="button button-with-icon-span page-header__button"
            onClick={this.onClickNew}
          >
            <i className="fa fa-plus fa-lg" />
            <span>신규</span>
          </button>
        )}

        {this.state.isModalNewOpen && (
          <AccountModal
            isOpen={this.state.isModalNewOpen}
            onModalClose={this.onModalClose}
          />
        )}

        {this.state.isModalNewMultiOpen && (
          <AccountNewMultiModal
            isOpen={this.state.isModalNewMultiOpen}
            onModalClose={this.onModalClose}
          />
        )}
      </div>
    );
  }
}
