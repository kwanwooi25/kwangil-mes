import React from 'react';

export default class PlateSearchExpand extends React.Component {
  /*=========================================================================
  >> props <<
  onPlateSearchChange
  =========================================================================*/

  constructor(props) {
    super(props);

    this.state = {
      searchByProductName: '',
      searchByPlateName: '',
      searchByRound: '',
      searchByLength: '',
      searchByMaterial: 'both'
    }

    this.onChange = this.onChange.bind(this);
    this.onReset = this.onReset.bind(this);
  }

  onChange() {
    const queryObj = {
      productName: this.state.searchByProductName,
      name: this.state.searchByPlateName,
      round: this.state.searchByRound,
      length: this.state.searchByLength,
      plateMaterial: this.state.searchByMaterial
    };

    this.props.onPlateSearchChange(queryObj);
  }

  onReset() {
    this.setState({
      productName: '',
      name: '',
      round: '',
      length: '',
      plateMaterial: 'both'
    }, () => { this.onChange() });
  }

  render() {
    return (
      <div id="plate-search-expand" className="page-header__row hidden">
        <div className="plate-search__input-container">
          <input
            className="input search-by-product-name"
            type="text"
            placeholder="제품명"
            ref="searchByProductName"
            name="searchByProductName"
            onChange={this.onChange}
            onFocus={e => {
              e.target.select();
            }}
          />
          <input
            className="input search-by-plate-name"
            type="text"
            placeholder="동판명"
            ref="searchByPlateName"
            name="searchByPlateName"
            onChange={this.onChange}
            onFocus={e => {
              e.target.select();
            }}
          />
          <input
            className="input search-by-size"
            type="text"
            placeholder="둘레"
            ref="searchByRound"
            name="searchByRound"
            onChange={this.onChange}
            onFocus={e => {
              e.target.select();
            }}
          />
          <input
            className="input search-by-size"
            type="text"
            placeholder="기장"
            ref="searchByLength"
            name="searchByLength"
            onChange={this.onChange}
            onFocus={e => {
              e.target.select();
            }}
          />
          <select
            className="select search-by-material"
            name="searchByMaterial"
            value={this.state.searchByMaterial}
            onChange={this.onChange}
          >
            <option value="both">둘다</option>
            <option value="brass">신주</option>
            <option value="iron">데스</option>
          </select>
        </div>
        <div className="plate-search__button-container">
          <button
            className="button plate-search-button"
            onClick={this.onReset}
          >
            초기화
          </button>
        </div>
      </div>
    )
  }
}
