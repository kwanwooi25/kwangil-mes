import React from 'react';

import PageHeaderSearch from '../components/PageHeaderSearch';
import PlatePageHeaderButtons from './PlatePageHeaderButtons';
import PlateSearchExpand from './PlateSearchExpand';
import PlateList from './PlateList';

export default class PlatesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      queryObj: {
        productName: '',
        name: '',
        plateMaterial: '',
        round: '',
        length: ''
      }
    };

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
    this.onPlateSearchChange = this.onPlateSearchChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    this.setLayout();
    window.addEventListener('resize', () => {
      this.setLayout();
    });
    document
      .getElementById('plate-search-toggle')
      .addEventListener('click', () => {
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
      .querySelector('.header')
      .getBoundingClientRect().height;
    const pageHeaderHeight = document
      .querySelector('.page-header')
      .getBoundingClientRect().height;
    const main = document.querySelector('.main');
    const pageContent = document.querySelector('.page-content');
    const mainHeight = `calc(100vh - ${headerHeight + 10}px)`;
    const contentHeight = `calc(100vh - ${headerHeight +
      25 +
      pageHeaderHeight}px)`;
    main.style.height = mainHeight;
    main.style.marginTop = `${headerHeight + 5}px`;
    pageContent.style.height = contentHeight;
  }

  onInputSearchChange(query) {
    const queryObj = {
      productName: query,
      name: query,
      plateMaterial: '',
      round: '',
      length: ''
    };
    this.setState({ queryObj }, () => {console.log(this.state.queryObj)});
  }

  onPlateSearchChange(queryObj) {
    this.setState({ queryObj });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">동판목록</h1>
            <PageHeaderSearch
              id="plate-search"
              onInputSearchChange={this.onInputSearchChange}
            />

            <PlatePageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
            />
          </div>

          <PlateSearchExpand
            onPlateSearchChange={this.onPlateSearchChange}
          />
        </div>

        <div className="page-content">
          <PlateList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            queryObj={this.state.queryObj}
          />
        </div>
      </div>
    );
  }
}
