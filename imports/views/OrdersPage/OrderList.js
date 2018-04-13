import React from "react";
import moment from "moment";

import { AccountsData } from "../../api/accounts";
import { ProductsData } from "../../api/products";
import { OrdersData } from "../../api/orders";

import Checkbox from "../../custom/Checkbox";

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
      selectedID: "",
      selectedName: "",
      ordersCount: 0
    };

    // this.onInputChange = this.onInputChange.bind(this);
    this.onStatusChange = this.onStatusChange.bind(this);
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
      Meteor.subscribe("accounts");
      Meteor.subscribe("products");
      Meteor.subscribe("orders");
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
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
  }

  uncomma(str) {
    str = String(str);
    return str.replace(/[^\d]+/g, "");
  }

  onInputChange(e) {
    if (e.target.name === "selectAll") {
      const checkboxes = document.querySelectorAll(
        '#order-list input[type="checkbox"]'
      );

      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = e.target.checked;
      }
    }
  }

  onStatusChange(e) {
    const targetID = e.target.parentNode.parentNode.parentNode.id;
    const statusValue = e.target.value;
    const order = this.state.data.find(order => order._id === targetID);
    let data = order.data;
    data.status = statusValue;

    console.log(targetID, statusValue, data);

    Meteor.call("orders.update", targetID, data, (err, res) => {
      if (!err) {
        console.log("status updated");
      } else {
        this.setState({ error: err.error });
      }
    });
  }
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

      let isPrintText = "무지";
      if (product.isPrint) {
        isPrintText = "인쇄";
        switch (order.plateStatus) {
          case "confirm":
            isPrintText += " (동판확인)";
            break;
          case "new":
            isPrintText += " (동판신규)";
            break;
          case "edit":
            isPrintText += " (동판수정)";
            break;
        }
      }

      const weight =
        Number(product.thick) *
        (Number(product.length) + 5) *
        Number(product.width) /
        100 *
        0.0184 *
        Number(data.orderQuantity);

      let matchQuery = false;

      const orderedAt = moment(order.orderedAt);
      const searchFrom = moment(queryObj.searchFrom);
      const searchTo = moment(queryObj.searchTo);

      if (
        searchFrom <= orderedAt &&
        orderedAt <= searchTo &&
        account.name.indexOf(queryObj.accountName) > -1 &&
        product.name.indexOf(queryObj.productName) > -1
      ) {
        if (queryObj.isPrintQuery === 'both') {
          matchQuery = true;
        }
        if (queryObj.isPrintQuery === 'false' && !product.isPrint) {
          matchQuery = true;
        }
        if (queryObj.isPrintQuery === 'true' && product.isPrint) {
          matchQuery = true;
        }
      }

      // only show product that has matching query text
      if (matchQuery) {
        return (
          <li className="order" key={_id} id={_id}>
            <div className="order-checkbox-container">
              <Checkbox name={_id} onInputChange={this.onInputChange} />
            </div>
            <div className="order-container">
              <div className="order-deliver-remark-container">
                {order.deliverFast ? (
                  <span className="order-list__text">
                    <i className="fa fa-star" /> 지급
                  </span>
                ) : (
                  undefined
                )}
                {order.deliverDateStrict ? (
                  <span className="order-list__text">
                    <i className="fa fa-star" /> 납기엄수
                  </span>
                ) : (
                  undefined
                )}
              </div>
              <div className="order-status-select-container">
                <select
                  className="select order-list__select"
                  value={order.status}
                  onChange={this.onStatusChange}
                >
                  <option value="extruding">압출중</option>
                  <option value="printing">인쇄중</option>
                  <option value="cutting">가공중</option>
                </select>
              </div>

              <div className="order-id-container">
                <p className="order-list__text">{_id}</p>
              </div>

              <div className="order-dates-container">
                <p className="order-list__text">발주일: {order.orderedAt}</p>
                <p className="order-list__text">
                  납기일: {order.deliverBefore}
                </p>
              </div>

              <div className="order-product-details-container">
                <div className="order-names-container">
                  <a className="order-list__subtitle">{account.name}</a>
                  <a className="order-list__title">{product.name}</a>
                </div>
                <div className="order-product-size-container">
                  <span className="order-list__text">{product.thick}</span>
                  <i className="fa fa-times" />
                  <span className="order-list__text">{product.length}</span>
                  <i className="fa fa-times" />
                  <span className="order-list__text">{product.width}</span>
                </div>
                <div className="order-product-isPrint-container">
                  <p className="order-list__text">{isPrintText}</p>
                </div>
                <div className="order-orderQuantity-container">
                  <p className="order-list__text">
                    {this.comma(order.orderQuantity) +
                      "매 (" +
                      this.comma(weight.toFixed(0)) +
                      "kg)"}
                  </p>
                </div>
              </div>
            </div>

            {this.state.isAdmin || this.state.isManager ? (
              <div className="order-buttons-container">
                <button
                  className="button-circle order-button"
                  onClick={this.onCompleteClick}
                >
                  <i className="fa fa-check fa-lg" />
                  <span>완료</span>
                </button>
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
            )}
          </li>
        );
      }
    });
  }

  render() {
    return (
      <ul id="order-list">
        {this.state.ordersCount &&
        (this.state.isAdmin || this.state.isManager) ? (
          <div className="order-select-all">
            <Checkbox
              name="selectAll"
              label="전체선택"
              onInputChange={this.onInputChange}
            />
          </div>
        ) : (
          undefined
        )}

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
