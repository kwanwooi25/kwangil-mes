import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';

import Spinner from '../../custom/Spinner';

export default class AddProductModal extends React.Component {
  /*========================================================================
  >> props <<
  isOpen       : if modal is open
  onModalClose : function to execute on modal close
  ========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      productsData: [],
      filteredProducts: [],
      isDataReady: false,
      selectedProductID: '',
      printContent: ''
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onListItemClick = this.onListItemClick.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
  }

  componentDidMount() {
    // tracks data change
    subsCache = new SubsCache(-1, -1);
    subsCache.subscribe('accounts');
    subsCache.subscribe('products');
    this.tracker = Tracker.autorun(() => {
      const isDataReady = subsCache.ready();
      const productsData = ProductsData.find(
        { isPrint: true },
        {
          sort: { name: 1, thick: 1, length: 1, width: 1 }
        }
      ).fetch();

      this.setState({
        productsData,
        filteredProducts: productsData,
        isDataReady
      });
    });
  }

  componentWillUnmount() {
    this.tracker.stop();
  }

  onInputChange(e) {
    if (e.target.name === 'searchByProductName') {
      const query = e.target.value.trim().toLowerCase();
      let filteredProducts = [];

      this.state.productsData.map(product => {
        if (product.name.toLowerCase().indexOf(query) > -1) {
          filteredProducts.push(product);
        }
      });

      this.setState({ filteredProducts });
    } else if (e.target.name === 'printContent') {
      if (e.target.value === '') {
        e.target.classList.add('error');
        this.setState({
          printContent: e.target.value,
          error: '인쇄 내용을 입력하세요. (ex. 전면글씨)'
        });
      } else {
        e.target.classList.remove('error');
        this.setState({ printContent: e.target.value, error: '' });
      }
    }
  }

  onListItemClick(e) {
    let selectedLi = '';
    if (e.target.tagName === 'SPAN') {
      selectedLi = e.target.parentNode;
    } else if (e.target.tagName === 'LI') {
      selectedLi = e.target;
    }
    const productLis = document.querySelectorAll(
      '#plate-addProduct-modal__productList li'
    );

    productLis.forEach(productLi => {
      productLi.classList.remove('selected');
    });

    selectedLi.classList.add('selected');
    this.setState({ selectedProductID: selectedLi.id });
  }

  onClickOK(e) {
    e.preventDefault();
    if (!this.state.selectedProductID) {
      this.setState({ error: '목록에서 제품을 선택하세요' });
    } else if (!this.state.printContent) {
      this.setState({ error: '인쇄 내용을 입력하세요. (ex. 전면글씨)' });
      this.refs.printContent.focus();
      this.refs.printContent.classList.add('error');
    } else {
      this.props.onModalClose(
        this.state.selectedProductID,
        this.state.printContent
      );
    }
  }

  onClickCancel(e) {
    e.preventDefault();
    this.props.onModalClose();
  }

  displayProducts() {
    return this.state.filteredProducts.map(product => {
      const productSize = `
          ${product.thick} x ${product.length} x ${product.width}
        `;
      const account = AccountsData.findOne({ _id: product.accountID });

      return (
        <li
          id={product._id}
          key={product._id}
          className="plate-addProduct-modal__productList__item"
          onClick={this.onListItemClick}
        >
          <span>{account ? account.name : '[삭제된 업체]'}</span>
          <span>{product.name}</span>
          <span>{productSize}</span>
        </li>
      );
    });
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onAfterOpen={() => {
          this.refs.searchByProductName.focus();
        }}
        onRequestClose={this.props.onModalClose}
        ariaHideApp={false}
        className="boxed-view__box plate-addProduct-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>동판 사용 품목 등록</h1>
        </div>
        <form className="boxed-view__content">
          <input
            className="input"
            type="text"
            placeholder="제품명으로 검색"
            ref="searchByProductName"
            name="searchByProductName"
            onChange={this.onInputChange}
            onFocus={e => {
              e.target.select();
            }}
          />

          <ul
            id="plate-addProduct-modal__productList"
            className="plate-addProduct-modal__productList"
          >
            {this.state.isDataReady ? this.displayProducts() : <Spinner />}
          </ul>

          <input
            className="input"
            type="text"
            placeholder="인쇄내용"
            ref="printContent"
            name="printContent"
            onChange={this.onInputChange}
            onFocus={e => {
              e.target.select();
            }}
          />

          {this.state.error ? (
            <p className="plate-modal__error">{this.state.error}</p>
          ) : (
            undefined
          )}

          <div className="button-group">
            <button className="button" onClick={this.onClickOK}>
              저장
            </button>
            <button
              className="button button-cancel"
              onClick={this.onClickCancel}
            >
              취소
            </button>
          </div>
        </form>
      </Modal>
    );
  }
}
