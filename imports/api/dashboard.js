import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { ProductsData } from './products';
import { OrdersData } from './orders';
import { DeliveryData } from './delivery';

Meteor.methods({
  'dashboard.getOrdersCount'() {
    const extrudingCount = OrdersData.find({ status: 'extruding' }).count();
    const printingCount = OrdersData.find({ status: 'printing' }).count();
    const cuttingCount = OrdersData.find({ status: 'cutting' }).count();
    const incompleteCount = extrudingCount + printingCount + cuttingCount;

    return { extrudingCount, printingCount, cuttingCount, incompleteCount };
  },

  'dashboard.getCompletedOrdersCount'() {
    return OrdersData.find({
      $and: [{ isCompleted: true }, { isDelivered: false }, { deliveredAt: '' }]
    }).count();
  },

  'dashboard.getDeliveryOrderCounts'(today) {
    let delivery;
    let directCount = 0;
    let postCount = 0;
    let etcCount = 0;

    delivery = DeliveryData.findOne({ _id: today });

    if (delivery) {
      delivery.orderList.map(({ deliverBy }) => {
        switch (deliverBy) {
          case 'direct':
            directCount++;
            break;
          case 'post':
            postCount++;
            break;
          default:
            etcCount++;
        }
      });
    }

    return { directCount, postCount, etcCount };
  },

  'dashboard.getNeedPlateCounts'() {
    let needPlateCount = 0;
    let productNameList = [];
    let plateStatusArray = [];

    const ordersData = OrdersData.find(
      { isCompleted: false },
      { sort: { _id: 1 } }
    ).fetch();

    ordersData.map(order => {
      const { plateStatus, productID } = order;

      if (plateStatus === 'new' || plateStatus === 'edit') {
        const product = ProductsData.findOne({ _id: productID });
        const productName = `${product.name} ${product.thick}x${
          product.length
        }x${product.width}`;

        needPlateCount++;
        productNameList.push({ productID, productName });
        const needPlateStatus =
          plateStatus === 'new'
            ? '(신규)'
            : plateStatus === 'edit' ? '(수정)' : '';
        plateStatusArray.push(needPlateStatus);
      }
    });

    return { needPlateCount, productNameList, plateStatusArray };
  }
});
