import 'pdfmake/build/pdfmake.js';
import 'pdfmake/build/vfs_fonts.js';

import { DeliveryData } from './delivery';
import { OrdersData } from './orders';
import { ProductsData } from './products';
import { AccountsData } from './accounts';
import { comma } from './comma';

import noImage from '../assets/no-image.png';

export const printDeliveryOrder = deliveryID => {
  let filename = `출고지시서_${deliveryID}`;
  let textObjArray = [];
  let directArray = [];
  let postArray = [];
  let etcArray = [];

  const delivery = DeliveryData.findOne({ _id: deliveryID });

  if (delivery && delivery.orderList.length !== 0) {
    delivery.orderList.map(({ orderID, deliverBy }) => {
      const order = OrdersData.findOne({ _id: orderID });
      const product = ProductsData.findOne({ _id: order.data.productID });
      let account;
      if (product) account = AccountsData.findOne({ _id: product.accountID });

      if (order && product && account) {
        const textObj = getTextForDocContent(
          order,
          deliverBy,
          product,
          account
        );
        textObjArray.push(textObj);
      }
    });
  }

  // categorize by delivery method
  textObjArray.map(textObj => {
    if (textObj.deliverBy === '직납') {
      directArray.push(textObj);
    } else if (textObj.deliverBy === '택배') {
      postArray.push(textObj);
    } else {
      etcArray.push(textObj);
    }
  });

  console.log('directArray: ', directArray);
  console.log('postArray: ', postArray);
  console.log('etcArray: ', etcArray);

  // selectedOrders.map((orderID, index) => {
  //   filename += `_${orderID}`;
  //
  //   const order = OrdersData.findOne({ _id: orderID });
  //   const product = ProductsData.findOne({ _id: order.data.productID });
  //
  //   getTextForDocContent(order, product).then(res => {
  //     docContent.push(getDocContent(res, product.isPrint));
  //     ordersCount++;
  //
  //     // when last order added to docContent
  //     if (selectedOrders.length === ordersCount) {
  //       // sort docContent by orderID
  //       docContent.sort((a, b) => {
  //         const a_orderID = a[0].table.body[0][0].text;
  //         const b_orderID = b[0].table.body[0][0].text;
  //         if (a_orderID > b_orderID) return 1;
  //         if (a_orderID < b_orderID) return -1;
  //         return 0;
  //       });
  //
  //       // add pagebreak between each order except the last one
  //       for (let i = 0; i < selectedOrders.length - 1; i++) {
  //         console.log(docContent[i]);
  //         docContent[i+1][0].pageBreak = 'before';
  //       }
  //
  //       // generate PDF and open
  //       const docDefinition = getDocDefinition(filename, docContent);
  //       openPDF(docDefinition);
  //     }
  //   });
  // });
};

const openPDF = docDefinition => {
  /*==========================================================
  to use custom fonts, follow the steps below
  1. create folder: pdfmake/examples/fonts
  2. copy fonts in the folder
  3. go to root directory of 'pdfmake' package
  4. run 'npm install'
  5. run 'gulp buildFonts'
  ==========================================================*/

  pdfMake.fonts = {
    NanumGothic: {
      normal: 'NanumGothic.ttf',
      bold: 'NanumGothicBold.ttf',
      italics: 'NanumGothic.ttf',
      bolditalics: 'NanumGothicBold.ttf'
    }
  };

  pdfMake.createPdf(docDefinition).open();
};

const getTextForDocContent = (order, deliverBy, product, account) => {
  let productSize = `${product.thick} x ${product.length} x ${product.width}`;
  let weight =
    Number(product.thick) *
    (Number(product.length) + 5) *
    (Number(product.width) / 100) *
    0.0184 *
    Number(order.data.completedQuantity);
  deliverBy =
    deliverBy === 'direct' ? '직납' : deliverBy === 'post' ? '택배' : deliverBy;
  let textObj = {
    accountName: account.name,
    productName: product.name,
    productSize,
    quantity: `${comma(order.data.completedQuantity)}매`,
    weight: `${comma(weight.toFixed(0))}kg`,
    deliverBy
  };

  return textObj;
};

const getDocContent = (textObj, isPrint) => {
  let docContent = [
    {
      layout: 'noBorders',
      table: {
        widths: ['23%', '*', '23%'],
        body: [
          [
            { rowSpan: 2, text: textObj.orderIDText, style: 'orderNo' },
            { text: '작업지시서', style: 'title' },
            {
              text: textObj.deliverRemarkText,
              style: 'deliverRemark'
            }
          ],
          [
            {},
            {
              colSpan: 2,
              text: textObj.orderedAtText,
              style: 'orderedAt'
            },
            {}
          ]
        ]
      }
    },
    {
      style: 'table',
      table: {
        widths: ['33%', '21%', '34%', '12%'],
        body: [
          [
            { rowSpan: 2, text: textObj.sizeText, style: 'productSize' },
            {
              text: textObj.orderQuantityText,
              style: 'orderQuantity',
              border: [true, true, true, false]
            },
            { text: textObj.productName, style: 'productName' },
            {
              rowSpan: 2,
              text: textObj.deliverBeforeText,
              style: 'deliverBefore'
            }
          ],
          [
            {},
            {
              text: textObj.orderQuantityWeightText,
              style: 'orderQuantityWeight',
              border: [true, false, true, true]
            },
            { text: textObj.accountName, style: 'accountName' },
            {}
          ]
        ]
      }
    },
    {
      style: 'table',
      table: {
        widths: ['14%', '19%', '5%', '9%', '20%', '9%', '24%'],
        heights: ['auto', 60, 60, 50, 20, 20, 20],
        body: [
          [
            { colSpan: 2, text: '압출부', style: 'workOrderHeader' },
            {},
            { colSpan: 3, text: '인쇄부', style: 'workOrderHeader' },
            {},
            {},
            { colSpan: 2, text: '가공부', style: 'workOrderHeader' },
            {}
          ],
          [
            {
              rowSpan: 4,
              colSpan: 2,
              text: textObj.extDetailsText,
              style: 'workOrderBody'
            },
            {},
            { text: '전\n면', style: 'workOrderHeader', margin: [0, 15] },
            {
              colSpan: 2,
              text: textObj.printFrontText,
              style: 'workOrderBody'
            },
            {},
            {
              rowSpan: 2,
              colSpan: 2,
              text: textObj.cutDetailsText,
              style: 'workOrderBody'
            },
            {}
          ],
          [
            {},
            {},
            { text: '후\n면', style: 'workOrderHeader', margin: [0, 15] },
            {
              colSpan: 2,
              text: textObj.printBackText,
              style: 'workOrderBody'
            },
            {},
            {},
            {}
          ],
          [
            {},
            {},
            {
              colSpan: 3,
              text: textObj.printMemoText,
              style: 'workOrderBody'
            },
            {},
            {},
            {
              rowSpan: 2,
              text: '포장',
              style: 'workOrderHeader',
              margin: [0, 30]
            },
            {
              rowSpan: 2,
              text: textObj.packDetailsText,
              style: 'workOrderBody'
            }
          ],
          [
            {},
            {},
            {
              colSpan: 2,
              text: textObj.plateStatusText,
              style: 'workOrderBody'
            },
            {},
            {
              /* plate location goes here */
            },
            {},
            {}
          ],
          [
            { text: '작업참고', style: 'workOrderHeader' },
            {
              colSpan: 6,
              text: textObj.workMemo,
              style: 'workOrderMemo'
            }
          ],
          [
            { text: '납품참고', style: 'workOrderHeader' },
            {
              colSpan: 6,
              text: textObj.deliverMemo,
              style: 'workOrderMemo'
            }
          ]
        ]
      }
    }
  ];

  // add product image if exist
  if (isPrint) {
    docContent.push({
      image: textObj.productImage,
      fit: [515, 300],
      alignment: 'center'
    });
  }

  return docContent;
};

const getDocDefinition = (filename, docContent) => {
  return {
    info: {
      title: filename
    },
    pageMargins: 25,
    content: docContent,

    defaultStyle: {
      font: 'NanumGothic'
    },

    styles: {
      table: {
        margin: [0, 0, 0, 10]
      },
      title: {
        fontSize: 24,
        bold: true,
        alignment: 'center'
      },
      orderNo: {
        fontSize: 30,
        bold: true,
        margin: [10, 20, 0, 0]
      },
      deliverRemark: {
        fontSize: 18,
        bold: true,
        background: '#555',
        color: '#fff',
        alignment: 'right',
        margin: 5
      },
      orderedAt: {
        alignment: 'right',
        margin: 3
      },
      productSize: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        margin: [2, 15]
      },
      orderQuantity: {
        fontSize: 16,
        bold: true,
        alignment: 'center',
        margin: [5, 5, 5, 0]
      },
      productName: {
        fontSize: 12,
        alignment: 'center',
        margin: [3, 8]
      },
      deliverBefore: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        margin: [3, 15]
      },
      orderQuantityWeight: {
        fontSize: 12,
        alignment: 'center',
        margin: [5, 0, 5, 5]
      },
      accountName: {
        fontSize: 9,
        alignment: 'center',
        margin: 3
      },
      workOrderHeader: {
        fontSize: 12,
        bold: true,
        alignment: 'center',
        margin: 3
      },
      workOrderBody: {
        fontSize: 12,
        alignment: 'center',
        margin: 3
      },
      workOrderRemark: {
        fontSize: 12,
        margin: 3
      }
    }
  };
};
