import React from "react";
import moment from "moment";

import { AccountsData } from "../../api/accounts";
import { ProductsData } from "../../api/products";
import { OrdersData } from "../../api/orders";
import { comma } from '../../api/comma';

import OrderListHeader from './OrderListHeader';
import OrderListItem from './OrderListItem';
import ProductOrderModal from "../ProductsPage/ProductOrderModal";
import ProductDetailView from "../ProductsPage/ProductDetailView";
import CompleteOrderModal from "./CompleteOrderModal";
import CompleteOrderMultiModal from "./CompleteOrderMultiModal";
import ConfirmationModal from "../components/ConfirmationModal";

export default class OrderList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query string to filter account list
  isAdmin
  isManager
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      accountList: [],
      productList: [],
      ordersData: [],
      queryObj: props.queryObj,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      isProductDetailViewOpen: false,
      isCompleteOrderModalOpen: false,
      isProductOrderModalOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedOrderID: "",
      selectedOrders: [],
      confirmationDescription: [],
      ordersCount: 0,
      isSelectedMulti: false,
      selectedOrders: [],


      isCompleteOrderMultiModalOpen: false,

    };

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.showProductDetailView = this.showProductDetailView.bind(this);
    this.hideProductDetailView = this.hideProductDetailView.bind(this);
    this.updateOrderStatus = this.updateOrderStatus.bind(this);
    this.showCompleteOrderModal = this.showCompleteOrderModal.bind(this);
    this.hideCompleteOrderModal = this.hideCompleteOrderModal.bind(this);
    this.showProductOrderModal = this.showProductOrderModal.bind(this);
    this.hideProductOrderModal = this.hideProductOrderModal.bind(this);
    this.showDeleteConfirmationModal = this.showDeleteConfirmationModal.bind(this);
    this.hideDeleteConfirmationModal = this.hideDeleteConfirmationModal.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      queryObj: props.queryObj,
      isAdmin: props.isAdmin,
      isManager: props.isManage
    });
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
        ordersData: orderList,
        ordersCount: orderList.length
      });
    });
  }

  componentWillUnmount() {
    this.databaseTracker.stop();
  }

  onCheckboxChange(e) {
    let selectedOrders = this.state.selectedOrders;
    if (e.target.name === "selectAll") {
      selectedOrders = [];
      const checkboxes = document.querySelectorAll(
        '#order-list input[type="checkbox"]'
      );

      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = e.target.checked;
        if (e.target.checked) {
          selectedOrders.push(checkboxes[i].name);
        }
      }
    } else {
      selectedOrders = selectedOrders.filter(value => value !== e.target.name);
      if (e.target.checked) {
        selectedOrders.push(e.target.name);
      }
    }
    selectedOrders = selectedOrders.filter(value => value !== "selectAll");
    if (selectedOrders.length >= 2) {
      this.setState({ isSelectedMulti: true });
    } else {
      this.setState({ isSelectedMulti: false });
    }
    this.setState({ selectedOrders });
  }

  showProductDetailView(selectedProductID) {
    this.setState({ isProductDetailViewOpen: true, selectedProductID });
  }

  hideProductDetailView() {
    this.setState({ isProductDetailViewOpen: false, selectedProductID: "" });
  }

  updateOrderStatus(orderID, statusValue) {
    const order = this.state.ordersData.find(order => order._id === orderID);
    let data = order.data;
    data.status = statusValue;

    Meteor.call("orders.update", orderID, data, (err, res) => {
      if (err) {
        this.setState({ error: err.error });
      }
    });
  }

  showCompleteOrderModal(selectedOrders) {
    if (selectedOrders.length === 1) {
      this.setState({
        isCompleteOrderModalOpen: true,
        selectedOrders
      })
    }
  }

  hideCompleteOrderModal() {
    this.setState({ isCompleteOrderModalOpen: false, selectedOrders: [] });
  }

  showProductOrderModal(selectedOrderID) {
    this.setState({ isProductOrderModalOpen: true, selectedOrderID });
  }

  hideProductOrderModal() {
    this.setState({ isProductOrderModalOpen: false, selectedOrderID: "" });
  }

  showDeleteConfirmationModal(selectedOrders) {
    let confirmationDescription = [`
      작업지시 ${selectedOrders.length}건 취소하시겠습니까?
    `];

    selectedOrders.map(orderID => {
      const order = OrdersData.findOne({ _id: orderID });
      const product = ProductsData.findOne({ _id: order.data.productID });
      const orderInfoText = `
        ${product.name} (${product.thick}x${product.length}x${product.width})
        = ${comma(order.data.orderQuantity)}매
      `;

      confirmationDescription.push(orderInfoText);
    });

    this.setState({
      isDeleteConfirmationModalOpen: true,
      selectedOrders,
      confirmationDescription
    })
  }

  hideDeleteConfirmationModal(answer) {
    this.setState({ isDeleteConfirmationModalOpen: false });
    this.state.selectedOrders.map(orderID => {
      Meteor.call('orders.remove', orderID);
    });
  }

  // show order complete modal multi
  onCompleteOrderMultiClick() {
    this.setState({ isCompleteOrderMultiModalOpen: true });
  }

  onCompleteOrderMultiModalClose() {
    this.setState({ isCompleteOrderMultiModalOpen: false });
  }

  getOrderList(queryObj) {
    return this.state.ordersData.map(order => {
      const product = this.state.productList.find(
        product => product._id === order.data.productID
      );
      const account = this.state.accountList.find(
        account => account._id === product.accountID
      );

      let matchQuery = false;

      const orderedAt = moment(order.data.orderedAt);
      const searchFrom = moment(queryObj.searchFrom);
      const searchTo = moment(queryObj.searchTo);

      if (
        searchFrom <= orderedAt &&
        orderedAt <= searchTo &&
        account.name.indexOf(queryObj.accountName) > -1 &&
        product.name.indexOf(queryObj.productName) > -1
      ) {
        if (!order.data.isCompleted) {
          if (queryObj.isPrintQuery === "both") {
            matchQuery = true;
          }
          if (queryObj.isPrintQuery === "false" && !product.isPrint) {
            matchQuery = true;
          }
          if (queryObj.isPrintQuery === "true" && product.isPrint) {
            matchQuery = true;
          }
        } else {
          if (queryObj.showCompletedOrder) {
            if (queryObj.isPrintQuery === "both") {
              matchQuery = true;
            }
            if (queryObj.isPrintQuery === "false" && !product.isPrint) {
              matchQuery = true;
            }
            if (queryObj.isPrintQuery === "true" && product.isPrint) {
              matchQuery = true;
            }
          }
        }
      }

      // only show product that has matching query text
      if (matchQuery) {
        return (
          <OrderListItem
            key={order._id}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            account={account}
            product={product}
            order={order}
            onCheckboxChange={this.onCheckboxChange}
            showProductDetailView={this.showProductDetailView}
            updateOrderStatus={this.updateOrderStatus}
            showCompleteOrderModal={this.showCompleteOrderModal}
            showProductOrderModal={this.showProductOrderModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        );
      }
    });
  }

  render() {
    return (
      <div className="list-container">
        {this.state.ordersCount &&
          (this.state.isAdmin || this.state.isManager) ? (
            <OrderListHeader
              onCheckboxChange={this.onCheckboxChange}
              isSelectedMulti={this.state.isSelectedMulti}
              selectedOrders={this.state.selectedOrders}
            />
            // <div className="order-list-header">
            //   <Checkbox
            //     name="selectAll"
            //     label="전체선택"
            //     onInputChange={this.onCheckboxChange}
            //   />
            //   <div className="order-buttons-container">
            //     <button
            //       className="button button-with-icon-span order-button"
            //       onClick={this.onPrintOrderMultiClick}
            //       disabled={!this.state.isSelectedMulti}
            //     >
            //       <i className="fa fa-print fa-lg" />
            //       <span>출력</span>
            //     </button>
            //     <button
            //       className="button button-with-icon-span order-button"
            //       onClick={this.onCompleteOrderMultiClick}
            //       disabled={!this.state.isSelectedMulti}
            //     >
            //       <i className="fa fa-check fa-lg" />
            //       <span>완료</span>
            //     </button>
            //     <button
            //       className="button button-with-icon-span order-button"
            //       onClick={this.onDeleteMultiClick}
            //       disabled={!this.state.isSelectedMulti}
            //     >
            //       <i className="fa fa-trash fa-lg" />
            //       <span>삭제</span>
            //     </button>
            //   </div>
            // </div>
          ) : (
            undefined
          )}

        <ul id="order-list">
          {this.getOrderList(this.state.queryObj)}
        </ul>

        {this.state.isProductDetailViewOpen ? (
          <ProductDetailView
            isOpen={this.state.isProductDetailViewOpen}
            productID={this.state.selectedProductID}
            onModalClose={this.hideProductDetailView}
          />
        ) : (
          undefined
        )}

        {this.state.isCompleteOrderModalOpen ? (
          <CompleteOrderModal
            isOpen={this.state.isCompleteOrderModalOpen}
            orderID={this.state.selectedOrders[0]}
            onModalClose={this.hideCompleteOrderModal}
          />
        ) : (
          undefined
        )}

        {this.state.isProductOrderModalOpen ? (
          <ProductOrderModal
            isOpen={this.state.isProductOrderModalOpen}
            orderID={this.state.selectedOrderID}
            onModalClose={this.hideProductOrderModal}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        ) : (
          undefined
        )}

        {this.state.isDeleteConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmationModalOpen}
            title="작업지시 취소"
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.hideDeleteConfirmationModal}
          />
        ) : (
          undefined
        )}

        {this.state.isCompleteOrderMultiModalOpen ? (
          <CompleteOrderMultiModal
            isOpen={this.state.isCompleteOrderMultiModalOpen}
            selectedOrders={this.state.selectedOrders}
            onModalClose={this.onCompleteOrderMultiModalClose}
          />
        ) : (
          undefined
        )}
      </div>

    );
  }
}
