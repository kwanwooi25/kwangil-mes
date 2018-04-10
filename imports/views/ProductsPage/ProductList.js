import React from "react";

import { AccountsData } from "../../api/accounts";
import { ProductsData } from "../../api/products";

import Checkbox from "../../custom/Checkbox";
import ProductDetailView from "./ProductDetailView";
import ProductModal from "./ProductModal";
import ConfirmationModal from "../components/ConfirmationModal";

export default class ProductList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query string to filter account list
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      accountList: [],
      data: [],
      queryObj: props.queryObj,
      isAdmin: false,
      isManager: false,
      isProductModalOpen: false,
      isDetailViewOpen: false,
      isDeleteConfirmModalOpen: false,
      selectedID: "",
      selectedName: "",
      productsCount: 0
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onNameClick = this.onNameClick.bind(this);
    this.onDetailViewClose = this.onDetailViewClose.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onProductModalClose = this.onProductModalClose.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onDeleteConfirmModalClose = this.onDeleteConfirmModalClose.bind(this);
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
      const accountList = AccountsData.find(
        {},
        { fields: { _id: 1, name: 1 } }
      ).fetch();
      const productList = ProductsData.find({}, { sort: { name: 1 } }).fetch();

      this.setState({
        accountList,
        data: productList,
        productsCount: productList.length
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

  onInputChange(e) {
    if (e.target.name === "selectAll") {
      const checkboxes = document.querySelectorAll(
        '#product-list input[type="checkbox"]'
      );

      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = e.target.checked;
      }
    }
  }

  // show detail view modal
  onNameClick(e) {
    const selectedID = e.target.parentNode.parentNode.parentNode.id;
    this.setState({
      isDetailViewOpen: true,
      selectedID
    });
  }

  onDetailViewClose() {
    this.setState({ isDetailViewOpen: false });
  }

  // show account modal (EDIT mode)
  onEditClick(e) {
    let selectedID = "";
    if (e.target.tagName === "SPAN") {
      selectedID = e.target.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === "BUTTON") {
      selectedID = e.target.parentNode.parentNode.id;
    }

    this.setState({
      isProductModalOpen: true,
      selectedID
    });
  }

  onProductModalClose() {
    this.setState({ isProductModalOpen: false });
  }

  // show confirmation modal before delete
  onDeleteClick(e) {
    let selectedID = "";
    if (e.target.tagName === "SPAN") {
      selectedID = e.target.parentNode.parentNode.parentNode.id;
      selectedName = e.target.parentNode.parentNode.parentNode.querySelector(
        ".product-name"
      ).textContent;
    } else if (e.target.tagName === "BUTTON") {
      selectedID = e.target.parentNode.parentNode.id;
      selectedName = e.target.parentNode.parentNode.querySelector(
        ".product-name"
      ).textContent;
    }

    this.setState({
      isDeleteConfirmModalOpen: true,
      selectedID,
      selectedName
    });
  }

  onDeleteConfirmModalClose(answer) {
    this.setState({ isDeleteConfirmModalOpen: false });

    if (answer) {
      Meteor.call("products.remove", this.state.selectedID);
    }
  }

  getProductList(queryObj) {
    return this.state.data.map(product => {
      const account = this.state.accountList.find(
        account => account._id === product.accountID
      );
      let print = "";
      if (product.printFrontColorCount) {
        if (product.printBackColorCount) {
          print = `(전면 ${product.printFrontColorCount}도, 후면 ${
            product.printBackColorCount
          }도)`;
        } else {
          print = `(전면 ${product.printFrontColorCount}도)`;
        }
      }

      let matchQuery = false;

      if (
        product.accountName &&
        product.accountName.indexOf(queryObj.accountName) > -1 &&
        product.name &&
        product.name.indexOf(queryObj.name) > -1 &&
        product.thick &&
        product.thick.indexOf(queryObj.thick) > -1 &&
        product.length &&
        product.length.indexOf(queryObj.length) > -1 &&
        product.width &&
        product.width.indexOf(queryObj.width) > -1 &&
        product.extColor &&
        product.extColor.indexOf(queryObj.extColor) > -1 &&
        ((product.printFrontColor &&
          product.printFrontColor.indexOf(queryObj.printFrontColor) > -1) ||
          (product.printBackColor &&
            product.printBackColor.indexOf(queryObj.printBackColor) > -1))
      ) {
        matchQuery = true;
      }

      // only show product that has matching query text
      if (matchQuery) {
        return (
          <li className="product" key={product._id} id={product._id}>
            <div className="product-checkbox-container">
              <Checkbox name={product._id} onInputChange={this.onInputChange} />
            </div>
            <div className="product-container">
              <div className="product-name-container">
                <span className="product-accountName">{account.name}</span>
                <a className="product-name" onClick={this.onNameClick}>
                  {product.name}
                </a>
              </div>
              <div className="product-details-container">
                <div className="product-size-container">
                  <span className="product-size__thick">{product.thick}</span>
                  <i className="fa fa-times" />
                  <span className="product-size__length">{product.length}</span>
                  <i className="fa fa-times" />
                  <span className="product-size__width">{product.width}</span>
                </div>
                <div className="product-isPrint-container">
                  <span className="product-isPrint">
                    {product.isPrint ? `인쇄 ${print}` : "무지"}
                  </span>
                </div>
              </div>
            </div>

            {this.state.isAdmin || this.state.isManager ? (
              <div className="product-buttons-container">
                <button
                  className="button-circle product-button"
                  onClick={this.onEditClick}
                >
                  <i className="fa fa-edit fa-lg" />
                  <span>수정</span>
                </button>
                <button
                  className="button-circle product-button"
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
      <ul id="product-list">
        {this.state.productsCount &&
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
        )}

        {this.getProductList(this.state.queryObj)}
        {this.state.isDetailViewOpen ? (
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
        )}
      </ul>
    );
  }
}
