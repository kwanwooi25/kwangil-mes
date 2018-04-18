import React from 'react';

import { AccountsData } from "../../api/accounts";

import AccountModal from './AccountModal';
import AccountNewMultiModal from './AccountNewMultiModal';

export default class AccountPageHeaderButtons extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      isModalNewOpen: false,
      isModalNewMultiOpen: false,
    }

    this.onClickExportExcel = this.onClickExportExcel.bind(this);
    this.onClickNewMulti = this.onClickNewMulti.bind(this);
    this.onClickNew = this.onClickNew.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      isAdmin: props.isAdmin,
      isManager: props.isManager
    })
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
    const filename = '광일거래처.csv';
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
      accounts.push(AccountsData.findOne({ _id: lis[i].id }));
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

    // function to generate download anchor
    const downloadAnchor = content => {
      const anchor = document.createElement('a');
      anchor.style = 'display:none !important';
      anchor.id = 'downloadanchor';
      document.body.appendChild(anchor);

      if ('download' in anchor) {
        anchor.download = filename;
      }
      anchor.href = content;
      anchor.click();
      anchor.remove();
    };

    // ** must add '\ueff' to prevent broken korean font
    const blob = new Blob(['\ufeff' + headerCSV + '\r\n' + bodyCSV], {
      type: 'text/csv;charset=utf-8;'
    });
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      downloadAnchor(URL.createObjectURL(blob));
    }
  }


  render() {
    return (
      <div className="page-header__buttons">
        <button
          className="button-circle page-header__button"
          onClick={this.onClickExportExcel}
        >
          <i className="fa fa-table fa-lg" />
          <span>엑셀</span>
        </button>
        {this.state.isAdmin ? (
          <button
            className="button-circle page-header__button"
            onClick={this.onClickNewMulti}
          >
            <i className="fa fa-plus-square fa-lg" />
            <span>대량등록</span>
          </button>
        ) : (
          undefined
        )}
        {this.state.isAdmin || this.state.isManager ? (
          <button
            className="button-circle page-header__button"
            onClick={this.onClickNew}
          >
            <i className="fa fa-plus fa-lg" />
            <span>신규</span>
          </button>
        ) : (
          undefined
        )}

        {this.state.isModalNewOpen ? (
          <AccountModal
            isOpen={this.state.isModalNewOpen}
            onModalClose={this.onModalClose}
          />
        ) : (
          undefined
        )}

        {this.state.isModalNewMultiOpen ? (
          <AccountNewMultiModal
            isOpen={this.state.isModalNewMultiOpen}
            onModalClose={this.onModalClose}
          />
        ) : (
          undefined
        )}
      </div>
    )
  }
}