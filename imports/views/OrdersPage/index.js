import React from 'react';
import moment from 'moment';

import OrderList from './OrderList';

import Checkbox from '../../custom/Checkbox';
import RangePicker from '../../custom/DatePicker/RangePicker';

export default class OrdersPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      searchFrom: moment().subtract(2, 'weeks'),
      searchTo: moment(),
      isPrintQuery: 'both',
      searchByAccountName: '',
      searchByProductName: '',
      showCompletedOrder: false,
      queryObj: {
        searchFrom: moment()
          .subtract(2, 'weeks')
          .format('YYYY-MM-DD'),
        searchTo: moment().format('YYYY-MM-DD'),
        isPrintQuery: 'both',
        accountName: '',
        productName: '',
        showCompletedOrder: false
      }
    };

    this.onOrderSearchChange = this.onOrderSearchChange.bind(this);
    this.onOrderSearchReset = this.onOrderSearchReset.bind(this);
    // this.onClickExportExcel = this.onClickExportExcel.bind(this);
    // this.onModalClose = this.onModalClose.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    this.setLayout();
    window.addEventListener('resize', () => {
      this.setLayout();
    });

    // tracks if the user logged in is admin or manager
    this.authTracker = Tracker.autorun(() => {
      if (Meteor.user()) {
        this.setState({
          isAdmin: Meteor.user().profile.isAdmin,
          isManager: Meteor.user().profile.isManager
        });
      }
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
  }

  // dynamically adjust height
  setLayout() {
    const headerHeight = document
      .querySelector('.header')
      .getBoundingClientRect().height;
    const pageHeaderHeight = document
      .querySelector('.page-header')
      .getBoundingClientRect().height;
    const main = document.querySelector('.main');
    const pageContent = document.querySelector('.page-content');
    const mainHeight = `calc(100vh - ${headerHeight + 10}px)`;
    const contentHeight = `calc(100vh - ${headerHeight +
      25 +
      pageHeaderHeight}px)`;
    main.style.height = mainHeight;
    main.style.marginTop = `${headerHeight + 5}px`;
    pageContent.style.height = contentHeight;
  }

  onOrderSearchChange(e) {
    if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
      if (e.target.type === 'checkbox') {
        this.setState({ [e.target.name]: e.target.checked }, () => {
          this.refresh();
        });
      } else {
        this.setState({ [e.target.name]: e.target.value }, () => {
          this.refresh();
        });
      }
    }

    if (e.target.tagName === 'BUTTON') {
      switch (e.target.name) {
        case 'order-range__2weeks':
          this.setState(
            { searchFrom: moment().subtract(2, 'weeks'), searchTo: moment() },
            () => {
              this.refresh();
            }
          );
          break;
        case 'order-range__1month':
          this.setState(
            { searchFrom: moment().subtract(1, 'months'), searchTo: moment() },
            () => {
              this.refresh();
            }
          );
          break;
        case 'order-range__3months':
          this.setState(
            { searchFrom: moment().subtract(3, 'months'), searchTo: moment() },
            () => {
              this.refresh();
            }
          );
          break;
        case 'order-range__6months':
          this.setState(
            { searchFrom: moment().subtract(6, 'months'), searchTo: moment() },
            () => {
              this.refresh();
            }
          );
          break;
      }
    }
  }

  refresh() {
    if (this.state.searchFrom !== null && this.state.searchTo !== null) {
      const queryObj = {
        searchFrom: this.state.searchFrom.format('YYYY-MM-DD'),
        searchTo: this.state.searchTo.format('YYYY-MM-DD'),
        isPrintQuery: this.state.isPrintQuery,
        accountName: this.state.searchByAccountName,
        productName: this.state.searchByProductName,
        showCompletedOrder: this.state.showCompletedOrder
      };

      this.setState({ queryObj });
    }
  }

  onOrderSearchReset() {
    this.setState({
      searchFrom: moment().subtract(2, 'weeks'),
      searchTo: moment(),
      isPrintQuery: 'both',
      accountName: '',
      productName: '',
      showCompletedOrder: false
    });
  }
  //
  // onClickExportExcel() {
  //   const list = document.getElementById("product-list");
  //   const filename = "광일지퍼백.csv";
  //   const slice = Array.prototype.slice;
  //
  //   // get account list
  //   const lis = list.querySelectorAll("li");
  //   const products = [];
  //   const keys = [
  //     "accountID",
  //     "accountName",
  //     "_id",
  //     "name",
  //     "thick",
  //     "length",
  //     "width",
  //     "isPrint",
  //     "extColor",
  //     "extAntistatic",
  //     "extPretreat",
  //     "extMemo",
  //     "printImageURL",
  //     "printFrontColorCount",
  //     "printFrontColor",
  //     "printFrontPosition",
  //     "printBackColorCount",
  //     "printBackColor",
  //     "printBackPosition",
  //     "printMemo",
  //     "cutPosition",
  //     "utUltrasonic",
  //     "cutPowderPack",
  //     "cutPunches",
  //     "cutPunchCount",
  //     "cutPunchSize",
  //     "cutPunchPosition",
  //     "cutMemo",
  //     "packMaterial",
  //     "packQuantity",
  //     "packDeliverAll",
  //     "packMemo",
  //     "stockQuantity"
  //   ];
  //
  //   for (let i = 0; i < lis.length; i++) {
  //     products.push(ProductsData.findOne({ _id: lis[i].id }));
  //   }
  //
  //   // generate header csv
  //   let headerCSV =
  //     "업체ID,업체명,제품ID,제품명,두께,길이,너비,무지_인쇄,원단색상,대전방지,처리,압출메모,도안URL,전면도수,전면색상,전면위치,후면도수,후면색상,후면위치,인쇄메모,가공위치,초음파가공,가루포장,바람구멍,바람구멍개수,바람구멍크기,바람구멍위치,가공메모,포장방법,포장수량,전량납품,포장메모,재고수량";
  //
  //   // for managers
  //   if (this.state.isAdmin || this.state.isManager) {
  //     keys.push(["price", "history", "memo"]);
  //     headerCSV += ",가격,작업이력,메모";
  //   }
  //
  //   // generate body csv from account list
  //   const bodyCSV = products
  //     .map(product => {
  //       return keys
  //         .map(key => {
  //           if (product[key] === undefined) {
  //             return '""';
  //           } else {
  //             return '"t"'.replace("t", product[key]);
  //           }
  //         })
  //         .join(",");
  //     })
  //     .join("\r\n");
  //
  //   // function to generate download anchor
  //   const downloadAnchor = content => {
  //     const anchor = document.createElement("a");
  //     anchor.style = "display:none !important";
  //     anchor.id = "downloadanchor";
  //     document.body.appendChild(anchor);
  //
  //     if ("download" in anchor) {
  //       anchor.download = filename;
  //     }
  //     anchor.href = content;
  //     anchor.click();
  //     anchor.remove();
  //   };
  //
  //   // ** must add '\ueff' to prevent broken korean font
  //   const blob = new Blob(["\ufeff" + headerCSV + "\r\n" + bodyCSV], {
  //     type: "text/csv;charset=utf-8;"
  //   });
  //   if (navigator.msSaveOrOpenBlob) {
  //     navigator.msSaveOrOpenBlob(blob, filename);
  //   } else {
  //     downloadAnchor(URL.createObjectURL(blob));
  //   }
  // }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">작업지시목록</h1>

            <div className="page-header__buttons">
              <button
                className="button-circle page-header__button"
                // onClick={this.onClickExportExcel}
              >
                <i className="fa fa-table fa-lg" />
                <span>엑셀</span>
              </button>
            </div>
          </div>
          <div id="order-search" className="page-header__row">
            <div className="order-search__input-container">
              <RangePicker
                startDate={this.state.searchFrom}
                startDateId="searchFrom"
                startDatePlaceholderText="부터"
                endDate={this.state.searchTo}
                endDateId="searchTo"
                endDatePlaceholderText="까지"
                isOutsideRange={date => {
                  return false;
                }}
                onDatesChange={({ startDate, endDate }) => {
                  this.setState(
                    { searchFrom: startDate, searchTo: endDate },
                    () => {
                      this.refresh();
                    }
                  );
                }}
              />
              <button
                name="order-range__2weeks"
                className="button order-range-button"
                onClick={this.onOrderSearchChange}
              >
                2주
              </button>
              <button
                name="order-range__1month"
                className="button order-range-button"
                onClick={this.onOrderSearchChange}
              >
                1개월
              </button>
              <button
                name="order-range__3months"
                className="button order-range-button"
                onClick={this.onOrderSearchChange}
              >
                3개월
              </button>
              <button
                name="order-range__6months"
                className="button order-range-button"
                onClick={this.onOrderSearchChange}
              >
                6개월
              </button>
              <input
                className="input search-by-account-name"
                type="text"
                placeholder="업체명"
                ref="searchByAccountName"
                name="searchByAccountName"
                onChange={this.onOrderSearchChange}
                onFocus={e => {
                  e.target.select();
                }}
              />
              <input
                className="input search-by-product-name"
                type="text"
                placeholder="품명"
                ref="searchByProductName"
                name="searchByProductName"
                onChange={this.onOrderSearchChange}
                onFocus={e => {
                  e.target.select();
                }}
              />
              <select
                className="select order-isPrint-select"
                name="isPrintQuery"
                value={this.state.isPrintQuery}
                onChange={this.onOrderSearchChange}
              >
                <option value="both">둘다</option>
                <option value="false">무지</option>
                <option value="true">인쇄</option>
              </select>
              <Checkbox
                name="showCompletedOrder"
                label="완료품목 표시"
                checked={this.state.showCompletedOrder}
                onInputChange={this.onOrderSearchChange}
              />
            </div>
            <div className="order-search__button-container">
              <button
                className="button order-search-reset-button"
                onClick={this.onOrderSearchReset}
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        <div className="page-content">
          <OrderList queryObj={this.state.queryObj} />
        </div>
      </div>
    );
  }
}
