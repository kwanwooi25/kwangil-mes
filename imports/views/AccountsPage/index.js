import React from "react";

import AccountSearch from "./AccountSearch";
import AccountPageHeaderButtons from "./AccountPageHeaderButtons";
import AccountList from "./AccountList";

export default class AccountsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      query: ""
    };

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    this.setLayout();
    window.addEventListener("resize", () => {
      this.setLayout();
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

  onInputSearchChange(query) {
    this.setState({ query });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">거래처목록</h1>

            <AccountSearch onInputSearchChange={this.onInputSearchChange} />

            <AccountPageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
            />
          </div>
        </div>

        <div className="page-content">
          <AccountList
            query={this.state.query}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        </div>
      </div>
    );
  }
}
