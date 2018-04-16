import React from "react";

import ProductModal from "./ProductModal";
import ProductList from "./ProductList";
import ProductNewMultiModal from "./ProductNewMultiModal";

import { ProductsData } from "../../api/products";

export default class ProductsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      isModalNewOpen: false,
      isModalNewMultiOpen: false,
      queryObj: {
        accountName: "",
        name: "",
        thick: "",
        length: "",
        width: "",
        extColor: "",
        printColor: ""
      }
    };

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
    this.onSearchExpandClick = this.onSearchExpandClick.bind(this);
    this.onProductSearchChange = this.onProductSearchChange.bind(this);
    this.onProductSearchReset = this.onProductSearchReset.bind(this);
    this.onClickNew = this.onClickNew.bind(this);
    this.onClickNewMulti = this.onClickNewMulti.bind(this);
    this.onClickExportExcel = this.onClickExportExcel.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    this.setLayout();
    window.addEventListener("resize", () => {
      this.setLayout();
    });
    document
      .getElementById("product-search-toggle")
      .addEventListener("click", () => {
        setTimeout(() => {
          this.setLayout();
        }, 0);
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
      .querySelector(".header")
      .getBoundingClientRect().height;
    const pageHeaderHeight = document
      .querySelector(".page-header")
      .getBoundingClientRect().height;
    const main = document.querySelector(".main");
    const pageContent = document.querySelector(".page-content");
    const mainHeight = `calc(100vh - ${headerHeight + 10}px)`;
    const contentHeight = `calc(100vh - ${headerHeight +
      25 +
      pageHeaderHeight}px)`;
    main.style.height = mainHeight;
    main.style.marginTop = `${headerHeight + 5}px`;
    pageContent.style.height = contentHeight;
  }

  onInputSearchChange(e) {
    if (e.target.value !== "") {
      e.target.classList.add("hasValue");
    } else {
      e.target.classList.remove("hasValue");
    }

    const queryObj = {
      accountName: "",
      name: e.target.value.trim().toLowerCase(),
      thick: "",
      length: "",
      width: "",
      extColor: "",
      printColor: ""
    };
    this.setState({ queryObj });
  }

  onSearchExpandClick(e) {
    const productSearch = document.getElementById("product-search");
    const productSearchExpand = document.getElementById(
      "product-search-expand"
    );
    productSearch.classList.toggle("hidden");
    productSearchExpand.classList.toggle("hidden");
  }

  onProductSearchChange() {
    const queryObj = {
      accountName: this.refs.searchByAccountName.value.trim().toLowerCase(),
      name: this.refs.searchByProductName.value.trim().toLowerCase(),
      thick: this.refs.searchByThick.value.trim().toLowerCase(),
      length: this.refs.searchByLength.value.trim().toLowerCase(),
      width: this.refs.searchByWidth.value.trim().toLowerCase(),
      extColor: this.refs.searchByExtColor.value.trim().toLowerCase(),
      printColor: this.refs.searchByPrintColor.value.trim().toLowerCase()
    };

    this.setState({ queryObj });
  }

  onProductSearchReset() {
    this.refs.searchByAccountName.value = "";
    this.refs.searchByProductName.value = "";
    this.refs.searchByThick.value = "";
    this.refs.searchByLength.value = "";
    this.refs.searchByWidth.value = "";
    this.refs.searchByExtColor.value = "";
    this.refs.searchByPrintColor.value = "";
    this.onProductSearchChange();
  }

  onClickNew() {
    this.setState({ isModalNewOpen: true });
  }

  onClickNewMulti() {
    this.setState({ isModalNewMultiOpen: true });
  }

  onModalClose() {
    this.setState({ isModalNewOpen: false, isModalNewMultiOpen: false });
  }

  onClickExportExcel() {
    const list = document.getElementById("product-list");
    const filename = "광일지퍼백.csv";
    const slice = Array.prototype.slice;

    // get account list
    const lis = list.querySelectorAll("li");
    const products = [];
    const keys = [
      "accountID",
      "accountName",
      "_id",
      "name",
      "thick",
      "length",
      "width",
      "isPrint",
      "extColor",
      "extAntistatic",
      "extPretreat",
      "extMemo",
      "printImageURL",
      "printFrontColorCount",
      "printFrontColor",
      "printFrontPosition",
      "printBackColorCount",
      "printBackColor",
      "printBackPosition",
      "printMemo",
      "cutPosition",
      "utUltrasonic",
      "cutPowderPack",
      "cutPunches",
      "cutPunchCount",
      "cutPunchSize",
      "cutPunchPosition",
      "cutMemo",
      "packMaterial",
      "packQuantity",
      "packDeliverAll",
      "packMemo",
      "stockQuantity"
    ];

    for (let i = 0; i < lis.length; i++) {
      products.push(ProductsData.findOne({ _id: lis[i].id }));
    }

    // generate header csv
    let headerCSV =
      "업체ID,업체명,제품ID,제품명,두께,길이,너비,무지_인쇄,원단색상,대전방지,처리,압출메모,도안URL,전면도수,전면색상,전면위치,후면도수,후면색상,후면위치,인쇄메모,가공위치,초음파가공,가루포장,바람구멍,바람구멍개수,바람구멍크기,바람구멍위치,가공메모,포장방법,포장수량,전량납품,포장메모,재고수량";

    // for managers
    if (this.state.isAdmin || this.state.isManager) {
      keys.push(["price", "history", "memo"]);
      headerCSV += ",가격,작업이력,메모";
    }

    // generate body csv from account list
    const bodyCSV = products
      .map(product => {
        return keys
          .map(key => {
            if (product[key] === undefined) {
              return '""';
            } else {
              return '"t"'.replace("t", product[key]);
            }
          })
          .join(",");
      })
      .join("\r\n");

    // function to generate download anchor
    const downloadAnchor = content => {
      const anchor = document.createElement("a");
      anchor.style = "display:none !important";
      anchor.id = "downloadanchor";
      document.body.appendChild(anchor);

      if ("download" in anchor) {
        anchor.download = filename;
      }
      anchor.href = content;
      anchor.click();
      anchor.remove();
    };

    // ** must add '\ueff' to prevent broken korean font
    const blob = new Blob(["\ufeff" + headerCSV + "\r\n" + bodyCSV], {
      type: "text/csv;charset=utf-8;"
    });
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      downloadAnchor(URL.createObjectURL(blob));
    }
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">제품목록</h1>
            <input
              id="product-search"
              className="page-header__search"
              type="text"
              placeholder="&#xf002;"
              onChange={this.onInputSearchChange}
              onFocus={e => {
                e.target.select();
              }}
            />

            <div className="page-header__buttons">
              <button
                id="product-search-toggle"
                className="button-circle page-header__button"
                onClick={this.onSearchExpandClick}
              >
                <i className="fa fa-search-plus" />
                <span>확장검색</span>
              </button>
              <button
                className="button-circle page-header__button"
                onClick={this.onClickExportExcel}
              >
                <i className="fa fa-table fa-lg" />
                <span>엑셀</span>
              </button>
              {this.state.isAdmin ? (
                <button
                  className="button-circle page-header__button"
                  onClick={this.onClickNewMulti}
                >
                  <i className="fa fa-plus-square fa-lg" />
                  <span>대량등록</span>
                </button>
              ) : (
                undefined
              )}
              {this.state.isAdmin || this.state.isManager ? (
                <button
                  className="button-circle page-header__button"
                  onClick={this.onClickNew}
                >
                  <i className="fa fa-plus fa-lg" />
                  <span>신규</span>
                </button>
              ) : (
                undefined
              )}
            </div>
          </div>
          <div id="product-search-expand" className="page-header__row hidden">
            <div className="product-search__input-container">
              <input
                className="input search-by-account-name"
                type="text"
                placeholder="업체명"
                ref="searchByAccountName"
                name="searchByAccountName"
                onChange={this.onProductSearchChange}
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
                onChange={this.onProductSearchChange}
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
                onChange={this.onProductSearchChange}
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
                onChange={this.onProductSearchChange}
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
                onChange={this.onProductSearchChange}
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
                onChange={this.onProductSearchChange}
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
                onChange={this.onProductSearchChange}
                onFocus={e => {
                  e.target.select();
                }}
              />
            </div>
            <div className="product-search__button-container">
              <button
                className="button product-search-button"
                onClick={this.onProductSearchReset}
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        <div className="page-content">
          <ProductList queryObj={this.state.queryObj} />
        </div>

        {this.state.isModalNewOpen ? (
          <ProductModal
            isOpen={this.state.isModalNewOpen}
            onModalClose={this.onModalClose}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        ) : (
          undefined
        )}

        {this.state.isModalNewMultiOpen ? (
          <ProductNewMultiModal
            isOpen={this.state.isModalNewMultiOpen}
            onModalClose={this.onModalClose}
          />
        ) : (
          undefined
        )}
      </div>
    );
  }
}
