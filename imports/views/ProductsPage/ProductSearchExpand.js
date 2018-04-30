import React from 'react';

export default class ProductSearchExpand extends React.Component {
  /*=========================================================================
  >> props <<
  onProductSearchChange
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      queryObj: {
        accountName: '',
        name: '',
        thick: '',
        length: '',
        width: '',
        extColor: '',
        printColor: ''
      },
      error: '하나 이상의 검색 조건을 입력해야 합니다.'
    }

    this.onChange = this.onChange.bind(this);
    this.onReset = this.onReset.bind(this);
  }

  onChange() {
    const queryObj = {
      accountName: this.refs.searchByAccountName.value.trim().toLowerCase(),
      name: this.refs.searchByProductName.value.trim().toLowerCase(),
      thick: this.refs.searchByThick.value.trim().toLowerCase(),
      length: this.refs.searchByLength.value.trim().toLowerCase(),
      width: this.refs.searchByWidth.value.trim().toLowerCase(),
      extColor: this.refs.searchByExtColor.value.trim().toLowerCase(),
      printColor: this.refs.searchByPrintColor.value.trim().toLowerCase()
    };

    let error = '';

    if (
      queryObj.accountName === '' &&
      queryObj.name === '' &&
      queryObj.thick === '' &&
      queryObj.length === '' &&
      queryObj.width === '' &&
      queryObj.extColor === '' &&
      queryObj.printColor === ''
    ) {
      error = '하나 이상의 검색 조건을 입력해야 합니다.';
      this.setState({ queryObj, error }, () => {
        this.props.onProductSearchChange(this.state.queryObj);
      });
    } else {
      this.setState({ queryObj, error }, () => {
        this.props.onProductSearchChange(this.state.queryObj);
      });
    }
  }

  onReset() {
    this.refs.searchByAccountName.value = '';
    this.refs.searchByProductName.value = '';
    this.refs.searchByThick.value = '';
    this.refs.searchByLength.value = '';
    this.refs.searchByWidth.value = '';
    this.refs.searchByExtColor.value = '';
    this.refs.searchByPrintColor.value = '';
    this.onChange();
  }

  render() {
    return (
      <div id="product-search-expand" className="page-header__row">
        <div className="product-search__input-container">
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
            type="text"
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
            type="text"
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
            type="text"
            placeholder="너비"
            ref="searchByWidth"
            name="searchByWidth"
            onChange={this.onChange}
            onFocus={e => {
              e.target.select();
            }}
          />
          <input
            className="input search-by-color"
            type="text"
            placeholder="압출색상"
            ref="searchByExtColor"
            name="searchByExtColor"
            onChange={this.onChange}
            onFocus={e => {
              e.target.select();
            }}
          />
          <input
            className="input search-by-color"
            type="text"
            placeholder="인쇄색상"
            ref="searchByPrintColor"
            name="searchByPrintColor"
            onChange={this.onChange}
            onFocus={e => {
              e.target.select();
            }}
          />
        </div>
        <div className="product-search__button-container">
          <button
            className="button product-search-button"
            onClick={this.onReset}
          >
            초기화
          </button>
        </div>

        {this.state.error && (
          <p className="product-search-error">{this.state.error}</p>
        )}
      </div>
    )
  }
}
