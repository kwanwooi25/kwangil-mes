import React from 'react';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';

import Checkbox from '../../custom/Checkbox';

export default class OrderList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query string to filter account list
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      accountList: [],
      productList: [],
      data: [],
      queryObj: props.queryObj,
      isAdmin: false,
      isManager: false,
      isProductModalOpen: false,
      isDetailViewOpen: false,
      isDeleteConfirmModalOpen: false,
      selectedID: '',
      selectedName: '',
      ordersCount: 0
    };

    // this.onInputChange = this.onInputChange.bind(this);
    // this.onNameClick = this.onNameClick.bind(this);
    // this.onDetailViewClose = this.onDetailViewClose.bind(this);
    // this.onEditClick = this.onEditClick.bind(this);
    // this.onProductModalClose = this.onProductModalClose.bind(this);
    // this.onDeleteClick = this.onDeleteClick.bind(this);
    // this.onDeleteConfirmModalClose = this.onDeleteConfirmModalClose.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({ queryObj: props.queryObj });
  }

  componentDidMount() {
    // tracks data change
    this.databaseTracker = Tracker.autorun(() => {
      Meteor.subscribe('accounts');
      Meteor.subscribe('products');
      Meteor.subscribe('orders');
      const accountList = AccountsData.find(
        {},
        { fields: { _id: 1, name: 1 } }
      ).fetch();
      const productList = ProductsData.find(
        {},
        {
          fields: {
            _id: 1,
            accountID: 1,
            name: 1,
            thick: 1,
            length: 1,
            width: 1,
            isPrint: 1
          }
        }
      ).fetch();
      const orderList = OrdersData.find({}, { sort: { _id: 1 } }).fetch();

      this.setState({
        accountList,
        productList,
        data: orderList,
        ordersCount: orderList.length
      });
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
    this.databaseTracker.stop();
    this.authTracker.stop();
  }

  comma(str) {
    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
  }

  uncomma(str) {
    str = String(str);
    return str.replace(/[^\d]+/g, '');
  }

  // onInputChange(e) {
  //   if (e.target.name === "selectAll") {
  //     const checkboxes = document.querySelectorAll(
  //       '#product-list input[type="checkbox"]'
  //     );
  //
  //     for (let i = 0; i < checkboxes.length; i++) {
  //       checkboxes[i].checked = e.target.checked;
  //     }
  //   }
  // }
  //
  // // show detail view modal
  // onNameClick(e) {
  //   const selectedID = e.target.parentNode.parentNode.parentNode.id;
  //   this.setState({
  //     isDetailViewOpen: true,
  //     selectedID
  //   });
  // }
  //
  // onDetailViewClose() {
  //   this.setState({ isDetailViewOpen: false });
  // }
  //
  // // show account modal (EDIT mode)
  // onEditClick(e) {
  //   let selectedID = "";
  //   if (e.target.tagName === "SPAN") {
  //     selectedID = e.target.parentNode.parentNode.parentNode.id;
  //   } else if (e.target.tagName === "BUTTON") {
  //     selectedID = e.target.parentNode.parentNode.id;
  //   }
  //
  //   this.setState({
  //     isProductModalOpen: true,
  //     selectedID
  //   });
  // }
  //
  // onProductModalClose() {
  //   this.setState({ isProductModalOpen: false });
  // }
  //
  // // show confirmation modal before delete
  // onDeleteClick(e) {
  //   let selectedID = "";
  //   if (e.target.tagName === "SPAN") {
  //     selectedID = e.target.parentNode.parentNode.parentNode.id;
  //     selectedName = e.target.parentNode.parentNode.parentNode.querySelector(
  //       ".product-name"
  //     ).textContent;
  //   } else if (e.target.tagName === "BUTTON") {
  //     selectedID = e.target.parentNode.parentNode.id;
  //     selectedName = e.target.parentNode.parentNode.querySelector(
  //       ".product-name"
  //     ).textContent;
  //   }
  //
  //   this.setState({
  //     isDeleteConfirmModalOpen: true,
  //     selectedID,
  //     selectedName
  //   });
  // }
  //
  // onDeleteConfirmModalClose(answer) {
  //   this.setState({ isDeleteConfirmModalOpen: false });
  //
  //   if (answer) {
  //     Meteor.call("products.remove", this.state.selectedID);
  //   }
  // }
  //
  getOrderList(queryObj) {
    return this.state.data.map(({ _id, data }) => {
      const order = data;
      const product = this.state.productList.find(
        product => product._id === order.productID
      );
      const account = this.state.accountList.find(
        account => account._id === product.accountID
      );
      console.log(_id, order, product, account);

      let isPrintText = '무지';
      if (product.isPrint) {
        isPrintText = '인쇄';
        switch (order.plateStatus) {
          case 'confirm':
            isPrintText += '(확인)';
            break;
          case 'new':
            isPrintText += '(신규)';
            break;
          case 'edit':
            isPrintText += '(수정)';
            break;
        }
      }
      // 납기일
      // 납기엄수/지급

      let matchQuery = true;

      // only show product that has matching query text
      if (matchQuery) {
        return (
          <li className="order" key={_id} id={_id}>
            <div className="order-checkbox-container">
              <Checkbox name={_id} onInputChange={this.onInputChange} />
            </div>
            <div className="order-container">
              <div className="order-orderedAt-container">
                <span className="order-orderedAt">{order.orderedAt}</span>
              </div>
              <div className="order-names-container">
                <a className="order-accountName">{account.name}</a>
                <a className="order-productName">{product.name}</a>
              </div>
              <div className="order-product-details-container">
                <div className="order-product-size-container">
                  <span className="order-product-size__thick">
                    {product.thick}
                  </span>
                  <i className="fa fa-times" />
                  <span className="order-product-size__length">
                    {product.length}
                  </span>
                  <i className="fa fa-times" />
                  <span className="order-product-size__width">
                    {product.width}
                  </span>
                </div>
                <div className="order-product-isPrint-container">
                  <span className="order-product-isPrint">{isPrintText}</span>
                </div>
              </div>
              <div className="order-details-container">
                <span className="order-orderQuantity">
                  {this.comma(order.orderQuantity) + '매'}
                </span>
                <span className="order-deliverBefore">{order.deliverBefore}</span>
                <span className="order-deliverIcons">
                  {order.deliverFast ? (
                    <i className="fa fa-shipping-fast" />
                  ) : order.deliverDateStrict ? (
                    <i className="fa fa-exclamation-circle" />
                  ) : (
                    undefined
                  )}
                </span>
              </div>
            </div>

            {/* {this.state.isAdmin || this.state.isManager ? (
              <div className="order-buttons-container">
                <button
              className="button-circle order-button"
              onClick={this.onEditClick}
                >
              <i className="fa fa-edit fa-lg" />
              <span>수정</span>
                </button>
                <button
              className="button-circle order-button"
              onClick={this.onDeleteClick}
                >
              <i className="fa fa-trash fa-lg" />
              <span>삭제</span>
                </button>
              </div>
              ) : (
              undefined
            )} */}
          </li>
        );
      }
    });
  }

  render() {
    return (
      <ul id="order-list">
        {/* {this.state.ordersCount &&
          (this.state.isAdmin || this.state.isManager) ? (
            <div className="product-select-all">
          <Checkbox
          name="selectAll"
          label="전체선택"
          onInputChange={this.onInputChange}
          />
            </div>
          ) : (
            undefined
        )} */}

        {this.getOrderList(this.state.queryObj)}
        {/* {this.state.isDetailViewOpen ? (
          <ProductDetailView
            isOpen={this.state.isDetailViewOpen}
            selectedID={this.state.selectedID}
            onDetailViewClose={this.onDetailViewClose}
          />
          ) : (
          undefined
          )}
          {this.state.isProductModalOpen ? (
          <ProductModal
            isOpen={this.state.isProductModalOpen}
            selectedID={this.state.selectedID}
            onModalClose={this.onProductModalClose}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
          ) : (
          undefined
          )}
          {this.state.isDeleteConfirmModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmModalOpen}
            title="품목 삭제"
            description={`[${
          this.state.selectedName
            }] 품목을 삭제하시겠습니까?`}
            onModalClose={this.onDeleteConfirmModalClose}
          />
          ) : (
          undefined
        )} */}
      </ul>
    );
  }
}
