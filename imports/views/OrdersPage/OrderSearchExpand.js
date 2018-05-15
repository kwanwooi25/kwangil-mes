import React from 'react';
import moment from 'moment';

import Checkbox from '../../custom/Checkbox';
import RangePicker from '../../custom/DatePicker/RangePicker';

export default class OrderSearchExpand extends React.Component {
  /*=========================================================================
  >> props <<
  onOrderSearchChange
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      searchFrom: moment().subtract(2, 'weeks'),
      searchTo: moment(),
      isPrintQuery: 'both',
      searchByAccountName: '',
      searchByProductName: '',
      searchByThick: '',
      searchByLength: '',
      searchByWidth: '',
      showCompletedOrder: false
    };

    this.onChange = this.onChange.bind(this);
    this.onReset = this.onReset.bind(this);
  }

  getQueryObj() {
    if (this.state.searchFrom !== null && this.state.searchTo !== null) {
      return {
        searchFrom: this.state.searchFrom.format('YYYY-MM-DD'),
        searchTo: this.state.searchTo.format('YYYY-MM-DD'),
        isPrintQuery: this.state.isPrintQuery,
        accountName: this.state.searchByAccountName.trim().toLowerCase(),
        productName: this.state.searchByProductName.trim().toLowerCase(),
        thick: this.state.searchByThick,
        length: this.state.searchByLength,
        width: this.state.searchByWidth,
        showCompletedOrder: this.state.showCompletedOrder
      };
    }
  }

  toggleClass(node) {
    if (node.value !== '') {
      node.classList.add('hasValue');
    } else {
      node.classList.remove('hasValue');
    }
  }

  onChange(e) {
    for (let ref in this.refs) {
      if (this.refs[ref].tagName === 'INPUT') {
        this.toggleClass(this.refs[ref]);
      }
    }

    if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
      if (e.target.type === 'checkbox') {
        this.setState({ [e.target.name]: e.target.checked }, () => {
          this.props.onOrderSearchChange(this.getQueryObj());
        });
      } else {
        this.setState({ [e.target.name]: e.target.value }, () => {
          this.props.onOrderSearchChange(this.getQueryObj());
        });
      }
    }

    if (e.target.tagName === 'BUTTON') {
      switch (e.target.name) {
        case 'order-range__2weeks':
          this.setState(
            { searchFrom: moment().subtract(2, 'weeks'), searchTo: moment() },
            () => {
              this.props.onOrderSearchChange(this.getQueryObj());
            }
          );
          break;
        case 'order-range__1month':
          this.setState(
            { searchFrom: moment().subtract(1, 'months'), searchTo: moment() },
            () => {
              this.props.onOrderSearchChange(this.getQueryObj());
            }
          );
          break;
        case 'order-range__3months':
          this.setState(
            { searchFrom: moment().subtract(3, 'months'), searchTo: moment() },
            () => {
              this.props.onOrderSearchChange(this.getQueryObj());
            }
          );
          break;
        case 'order-range__6months':
          this.setState(
            { searchFrom: moment().subtract(6, 'months'), searchTo: moment() },
            () => {
              this.props.onOrderSearchChange(this.getQueryObj());
            }
          );
          break;
      }
    }
  }

  onReset() {
    this.refs.searchByAccountName.value = '';
    this.refs.searchByProductName.value = '';
    this.refs.searchByThick.value = '';
    this.refs.searchByLength.value = '';
    this.refs.searchByWidth.value = '';
    this.refs.isPrintQuery = 'both';

    for (let ref in this.refs) {
      if (this.refs[ref].tagName === 'INPUT') {
        this.toggleClass(this.refs[ref]);
      }
    }

    this.setState(
      {
        searchFrom: moment().subtract(2, 'weeks'),
        searchTo: moment(),
        isPrintQuery: 'both',
        searchByAccountName: '',
        searchByProductName: '',
        searchByThick: '',
        searchByLength: '',
        searchByWidth: '',
        showCompletedOrder: false
      },
      () => {
        this.props.onOrderSearchChange(this.getQueryObj());
      }
    );
  }

  render() {
    return (
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
                  if (startDate !== null && endDate !== null) {
                    this.props.onOrderSearchChange(this.getQueryObj());
                  }
                }
              );
            }}
          />
          <button
            name="order-range__2weeks"
            className="button order-range-button"
            onClick={this.onChange}
          >
            2주
          </button>
          <button
            name="order-range__1month"
            className="button order-range-button"
            onClick={this.onChange}
          >
            1개월
          </button>
          <button
            name="order-range__3months"
            className="button order-range-button"
            onClick={this.onChange}
          >
            3개월
          </button>
          <button
            name="order-range__6months"
            className="button order-range-button"
            onClick={this.onChange}
          >
            6개월
          </button>
          <input
            className="input search-by-account-name"
            type="text"
            placeholder="업체명"
            ref="searchByAccountName"
            name="searchByAccountName"
            onChange={this.onChange}
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
            onChange={this.onChange}
            onFocus={e => {
              e.target.select();
            }}
          />
          <input
            className="input search-by-size"
            type="number"
            placeholder="두께"
            ref="searchByThick"
            name="searchByThick"
            onChange={this.onChange}
            onFocus={e => {
              e.target.select();
            }}
          />
          <input
            className="input search-by-size"
            type="number"
            placeholder="길이"
            ref="searchByLength"
            name="searchByLength"
            onChange={this.onChange}
            onFocus={e => {
              e.target.select();
            }}
          />
          <input
            className="input search-by-size"
            type="number"
            placeholder="너비"
            ref="searchByWidth"
            name="searchByWidth"
            onChange={this.onChange}
            onFocus={e => {
              e.target.select();
            }}
          />
          <select
            className="select order-isPrint-select"
            ref="isPrintQuery"
            name="isPrintQuery"
            value={this.state.isPrintQuery}
            onChange={this.onChange}
          >
            <option value="both">둘다</option>
            <option value="false">무지</option>
            <option value="true">인쇄</option>
          </select>
          <Checkbox
            name="showCompletedOrder"
            label="완료품목 표시"
            checked={this.state.showCompletedOrder}
            onInputChange={this.onChange}
          />
        </div>
        <div className="order-search__button-container">
          <button
            className="button order-search-reset-button"
            onClick={this.onReset}
          >
            초기화
          </button>
        </div>
      </div>
    );
  }
}
