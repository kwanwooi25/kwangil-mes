import React from 'react';

export default class ProductSearchExpand extends React.Component {
  /*=========================================================================
  >> props <<
  isDataReady
  onProductSearchChange
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onReset = this.onReset.bind(this);
  }

  onChange(e) {
    if (e.target.value !== "") {
      e.target.classList.add("hasValue");
    } else {
      e.target.classList.remove("hasValue");
    }
    
    const queryObj = {
      accountName: this.refs.searchByAccountName.value.trim().toLowerCase(),
      name: this.refs.searchByProductName.value.trim().toLowerCase(),
      thick: this.refs.searchByThick.value.trim().toLowerCase(),
      length: this.refs.searchByLength.value.trim().toLowerCase(),
      width: this.refs.searchByWidth.value.trim().toLowerCase(),
      extColor: this.refs.searchByExtColor.value.trim().toLowerCase(),
      printColor: this.refs.searchByPrintColor.value.trim().toLowerCase()
    };

    this.props.onProductSearchChange(queryObj);
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
      </div>
    )
  }
}
