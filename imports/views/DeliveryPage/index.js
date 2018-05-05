import React from 'react';
import moment from 'moment';

import { setLayout } from '../../api/setLayout';
import { avoidWeekend } from '../../api/avoidWeekend';

import PageHeaderSearch from '../components/PageHeaderSearch';
import DeliveryPageHeaderButtons from './DeliveryPageHeaderButtons';
import DeliveryList from './DeliveryList';

export default class DeliveryPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      deliveryData: props.deliveryData,
      deliveryDate: avoidWeekend(moment()).format('YYYY-MM-DD')
    };

    this.onDeliveryDateChange = this.onDeliveryDateChange.bind(this);
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
    this.setState({ deliveryData: props.deliveryData }, () => {
      this.filterData();
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
    console.log('DeliveryPage unmounted');
  }

  onDeliveryDateChange(deliveryDate) {
    this.setState({ deliveryDate: deliveryDate.format('YYYY-MM-DD') }, () => {
      this.filterData();
    });
  }

  filterData() {
    const selectedDelivery = this.props.deliveryData.find(
      delivery => delivery._id === this.state.deliveryDate
    );

    this.setState({ selectedDelivery });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">출고목록</h1>
            <DeliveryPageHeaderButtons
              accountsData={this.props.accountsData}
              productsData={this.props.productsData}
              ordersData={this.props.ordersData}
              selectedDelivery={this.state.selectedDelivery}
              onDeliveryDateChange={this.onDeliveryDateChange}
            />
          </div>
        </div>

        <div className="page-content">
          <DeliveryList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.props.accountsData}
            productsData={this.props.productsData}
            ordersData={this.props.ordersData}
            deliveryData={this.props.deliveryData}
            selectedDelivery={this.state.selectedDelivery}
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
// import DeliveryPageHeaderButtons from './DeliveryPageHeaderButtons';
// import DeliveryList from './DeliveryList';
//
// export default class DeliveryPage extends React.Component {
//   constructor(props) {
//     super(props);
//
//     this.state = {
//       isAdmin: false,
//       isManager: false,
//       accountsData: [],
//       productsData: [],
//       ordersData: [],
//       deliveryData: [],
//       // selectedDelivery: {},
//       isDataReady: false,
//       deliveryDate: moment().format('YYYY-MM-DD')
//     };
//
//     this.onDeliveryDateChange = this.onDeliveryDateChange.bind(this);
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
//   onDeliveryDateChange(deliveryDate) {
//     this.setState({ deliveryDate: deliveryDate.format('YYYY-MM-DD') }, () => {
//       this.filterData();
//     });
//   }
//
//   filterData() {
//     const selectedDelivery = this.state.deliveryData.find(
//       delivery => delivery._id === this.state.deliveryDate
//     );
//
//     this.setState({ selectedDelivery });
//   }
//
//   render() {
//     return (
//       <div className="main">
//         <div className="page-header">
//           <div className="page-header__row">
//             <h1 className="page-header__title">출고목록</h1>
//             <DeliveryPageHeaderButtons
//               accountsData={this.state.accountsData}
//               productsData={this.state.productsData}
//               ordersData={this.state.ordersData}
//               onDeliveryDateChange={this.onDeliveryDateChange}
//             />
//           </div>
//         </div>
//
//         <div className="page-content">
//           <DeliveryList
//             isAdmin={this.state.isAdmin}
//             isManager={this.state.isManager}
//             accountsData={this.state.accountsData}
//             productsData={this.state.productsData}
//             ordersData={this.state.ordersData}
//             deliveryData={this.state.deliveryData}
//             selectedDelivery={this.state.selectedDelivery}
//             isDataReady={this.state.isDataReady}
//           />
//         </div>
//       </div>
//     );
//   }
// }
