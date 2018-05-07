import React from 'react';
import moment from 'moment';

import { setLayout } from '../../api/setLayout';

import PageHeaderSearch from '../components/PageHeaderSearch';
import CompletedOrdersPageHeaderButtons from './CompletedOrdersPageHeaderButtons';
import CompletedOrderList from './CompletedOrderList';

export default class CompletedOrdersPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      ordersData: props.ordersData,
      filteredOrdersData: [],
      query: ''
    };

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    setLayout(75);
    window.addEventListener('resize', () => {
      setLayout(75);
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

    this.filterData();
  }

  componentWillReceiveProps(props) {
    this.setState({ ordersData: props.ordersData }, () => {
      this.filterData();
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
    console.log('CompletedOrdersPage unmounted');
  }

  onInputSearchChange(query) {
    this.setState({ query }, () => {
      this.filterData();
    });
  }

  filterData() {
    const query = this.state.query;
    let filteredOrdersData = [];

    this.state.ordersData.map(order => {
      const product = this.props.productsData.find(
        product => product._id === order.data.productID
      );
      let account;
      if (product) {
        account = this.props.accountsData.find(
          account => account._id === product.accountID
        );
      }

      if (
        ((account && account.name.toLowerCase().indexOf(query) > -1) ||
          (product && product.name.toLowerCase().indexOf(query) > -1)) &&
        order.data.isCompleted &&
        !order.data.isDelivered
      ) {
        filteredOrdersData.push(order);
      }
    });

    this.setState({ filteredOrdersData });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">납품대기목록</h1>
            <PageHeaderSearch onInputSearchChange={this.onInputSearchChange} />
            <CompletedOrdersPageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
              accountsData={this.props.accountsData}
              productsData={this.props.productsData}
              filteredOrdersData={this.state.filteredOrdersData}
            />
          </div>
        </div>

        <div className="page-content">
          <CompletedOrderList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.props.accountsData}
            productsData={this.props.productsData}
            ordersData={this.props.ordersData}
            filteredOrdersData={this.state.filteredOrdersData}
            isDataReady={this.props.isDataReady}
          />
        </div>
      </div>
    );
  }
}

// import React from 'react';
// import moment from 'moment';
//
// import { subsCache } from '../../../client/main';
//
// import { AccountsData } from '../../api/accounts';
// import { ProductsData } from '../../api/products';
// import { OrdersData } from '../../api/orders';
// import { DeliveryData } from '../../api/delivery';
// import { setLayout } from '../../api/setLayout';
//
// import PageHeaderSearch from '../components/PageHeaderSearch';
// import CompletedOrdersPageHeaderButtons from './CompletedOrdersPageHeaderButtons';
// import CompletedOrderList from './CompletedOrderList';
//
// export default class CompletedOrdersPage extends React.Component {
//   constructor(props) {
//     super(props);
//
//     this.state = {
//       isAdmin: false,
//       isManager: false,
//       accountsData: [],
//       productsData: [],
//       ordersData: [],
//       filteredOrdersData: [],
//       deliveryData: [],
//       isDataReady: false,
//       query: ''
//     };
//
//     this.onInputSearchChange = this.onInputSearchChange.bind(this);
//   }
//
//   componentDidMount() {
//     // dynamically adjust height
//     setLayout(75);
//     window.addEventListener('resize', () => {
//       setLayout(75);
//     });
//
//     // tracks if the user logged in is admin or manager
//     this.authTracker = Tracker.autorun(() => {
//       if (Meteor.user()) {
//         this.setState({
//           isAdmin: Meteor.user().profile.isAdmin,
//           isManager: Meteor.user().profile.isManager
//         });
//       }
//     });
//
//     const subsCache = new SubsCache(-1, -1);
//     subsCache.subscribe('accounts');
//     subsCache.subscribe('products');
//     subsCache.subscribe('orders');
//     subsCache.subscribe('delivery');
//
//     // tracks data change
//     Tracker.autorun(() => {
//       const isDataReady = subsCache.ready();
//       const accountsData = AccountsData.find({}, { sort: { name: 1 } }).fetch();
//       const productsData = ProductsData.find(
//         {},
//         {
//           sort: { name: 1, thick: 1, length: 1, width: 1 }
//         }
//       ).fetch();
//       const ordersData = OrdersData.find({}, { sort: { round: 1 } }).fetch();
//       const deliveryData = DeliveryData.find(
//         {},
//         { sort: { round: 1 } }
//       ).fetch();
//
//       this.setState(
//         { accountsData, productsData, ordersData, deliveryData, isDataReady },
//         () => {
//           this.filterData();
//         }
//       );
//     });
//   }
//
//   componentWillUnmount() {
//     this.authTracker.stop();
//   }
//
//   onInputSearchChange(query) {
//     this.setState({ query }, () => {
//       this.filterData();
//     });
//   }
//
//   filterData() {
//     const query = this.state.query;
//     let filteredOrdersData = [];
//
//     this.state.ordersData.map(order => {
//       const product = this.state.productsData.find(
//         product => product._id === order.data.productID
//       );
//       let account;
//       if (product) {
//         account = this.state.accountsData.find(
//           account => account._id === product.accountID
//         );
//       }
//
//       if (
//         ((account && account.name.toLowerCase().indexOf(query) > -1) ||
//           (product && product.name.toLowerCase().indexOf(query) > -1)) &&
//         order.data.isCompleted &&
//         !order.data.isDelivered
//       ) {
//         filteredOrdersData.push(order);
//       }
//     });
//
//     this.setState({ filteredOrdersData });
//   }
//
//   render() {
//     return (
//       <div className="main">
//         <div className="page-header">
//           <div className="page-header__row">
//             <h1 className="page-header__title">납품대기목록</h1>
//             <PageHeaderSearch onInputSearchChange={this.onInputSearchChange} />
//             <CompletedOrdersPageHeaderButtons
//               isAdmin={this.state.isAdmin}
//               isManager={this.state.isManager}
//               accountsData={this.state.accountsData}
//               productsData={this.state.productsData}
//               filteredOrdersData={this.state.filteredOrdersData}
//             />
//           </div>
//         </div>
//
//         <div className="page-content">
//           <CompletedOrderList
//             isAdmin={this.state.isAdmin}
//             isManager={this.state.isManager}
//             accountsData={this.state.accountsData}
//             productsData={this.state.productsData}
//             filteredOrdersData={this.state.filteredOrdersData}
//             isDataReady={this.state.isDataReady}
//           />
//         </div>
//       </div>
//     );
//   }
// }
