import 'pdfmake/build/pdfmake.js';
import 'pdfmake/build/vfs_fonts.js';

import { OrdersData } from './orders';
import { ProductsData } from './products';
import { AccountsData } from './accounts';
import { comma } from './comma';

import noImage from '../assets/no-image.png';

export const printOrders = selectedOrders => {
  let docContent = [];
  let filename = '작업지시';
  let ordersCount = 0;
  selectedOrders.map((orderID, index) => {
    filename += `_${orderID}`;

    const order = OrdersData.findOne({ _id: orderID });
    const product = ProductsData.findOne({ _id: order.productID });

    getTextForDocContent(order, product).then(res => {
      docContent.push(getDocContent(res, product.isPrint));
      ordersCount++;

      // when last order added to docContent
      if (selectedOrders.length === ordersCount) {
        // sort docContent by orderID
        docContent.sort((a, b) => {
          const a_orderID = a[0].table.body[0][0].text;
          const b_orderID = b[0].table.body[0][0].text;
          if (a_orderID > b_orderID) return 1;
          if (a_orderID < b_orderID) return -1;
          return 0;
        });

        // add pagebreak between each order except the last one
        for (let i = 0; i < selectedOrders.length - 1; i++) {
          docContent[i+1][0].pageBreak = 'before';
        }

        // generate PDF and open
        const docDefinition = getDocDefinition(filename, docContent);
        openPDF(docDefinition);
      }
    });
  });
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

const getTextForDocContent = (order, product) => {
  const account = AccountsData.findOne({ _id: product.accountID });
  const orderIDText = order._id.split('-').pop();
  const orderedAtText = `발주일: ${order.orderedAt}`;
  const sizeText = `${product.thick} x ${product.length} x ${product.width}`;
  const orderQuantityText = `${comma(order.orderQuantity)} 매`;
  const orderQuantityInKG =
    Number(product.thick) *
    (Number(product.length) + 5) *
    Number(product.width) /
    100 *
    0.0184 *
    Number(order.orderQuantity);
  const orderQuantityWeightText = `(${comma(orderQuantityInKG.toFixed(0))}kg)`;
  const productName = product.name;
  const accountName = account.name;
  let deliverBeforeArray = order.deliverBefore.split('-');
  deliverBeforeArray.shift();
  const deliverBeforeText = deliverBeforeArray.join('/');

  let deliverRemarkText = '';
  if (order.deliverDateStrict) {
    if (order.deliverFast) {
      deliverRemarkText = '납기엄수/지급';
    } else {
      deliverRemarkText = '납기엄수';
    }
  } else if (order.deliverFast) {
    deliverRemarkText = '지급';
  }

  let extDetailsText = `${product.extColor}원단`;
  if (product.extPretreat === 'single') {
    extDetailsText += '\n단면처리';
  } else if (product.extPretreat === 'both') {
    extDetailsText += '\n양면처리';
  }
  if (product.extAntistatic) {
    extDetailsText += '\n대전방지';
  }
  if (product.extMemo) {
    extDetailsText += '\n' + product.extMemo;
  }

  let printFrontText = '';
  if (product.printFrontColorCount) {
    printFrontText = `${product.printFrontColorCount}도`;
    printFrontText += ` (${product.printFrontColor})`;
    if (product.printFrontPosition) {
      printFrontText += `\n위치: ${product.printFrontPosition}`;
    }
  }

  let printBackText = '';
  if (product.printBackColorCount) {
    printBackText = `${product.printBackColorCount}도`;
    printBackText += ` (${product.printBackColor})`;
    if (product.printBackPosition) {
      printBackText += `\n위치: ${product.printBackPosition}`;
    }
  }

  let printMemoText = '';
  if (product.printMemo) {
    printMemoText = product.printMemo;
  }

  let cutDetailsText = '';
  if (product.cutPosition) {
    cutDetailsText += `가공위치: ${product.cutPosition}`;
  }
  if (product.cutUltrasonic) {
    cutDetailsText += '\n초음파가공';
  }
  if (product.cutPowderPack) {
    cutDetailsText += '\n가루포장';
  }
  if (product.cutPunches) {
    cutDetailsText += `\nP${product.cutPunchCount}`;
    if (product.cutPunchSize) {
      cutDetailsText += ` (${product.cutPunchSize})`;
    }
    if (product.cutPunchPosition) {
      cutDetailsText += `\n위치: ${product.cutPunchPosition}`;
    }
  }
  if (product.cutMemo) {
    cutDetailsText += '\n' + product.cutMemo;
  }

  let packDetailsText = '';
  if (product.packMaterial) {
    packDetailsText += `${product.packMaterial} 포장`;
  }
  if (product.packQuantity) {
    packDetailsText += `\n(${comma(product.packQuantity)}씩)`;
  }
  if (product.packDeliverAll) {
    packDetailsText += '\n전량납품';
  }
  if (product.packMemo) {
    packDetailsText += '\n' + product.packMemo;
  }

  let plateStatusText = '';
  switch (order.plateStatus) {
    case 'confirm':
      plateStatusText += '동판확인';
      break;
    case 'new':
      plateStatusText += '동판신규';
      break;
    case 'edit':
      plateStatusText += '동판수정';
      break;
  }

  const workMemo = order.workMemo;
  const deliverMemo = order.deliverMemo;

  let urlToEncode = '';
  let productImage = '';
  if (product.printImageURL) {
    urlToEncode = product.printImageURL;
  } else {
    urlToEncode = noImage;
  }

  return new Promise((resolve, reject) => {
    Meteor.call('encodeAsBase64', urlToEncode, (err, res) => {
      if (err) {
        Meteor.call('encodeAsBase64', noImage, (err, res) => {
          productImage = `data:image/png;base64,${res}`;
          resolve({
            orderIDText,
            orderedAtText,
            sizeText,
            orderQuantityText,
            orderQuantityWeightText,
            productName,
            accountName,
            deliverBeforeText,
            deliverRemarkText,
            extDetailsText,
            printFrontText,
            printBackText,
            printMemoText,
            cutDetailsText,
            packDetailsText,
            plateStatusText,
            workMemo,
            deliverMemo,
            productImage
          });
        });
      }
      if (res) {
        productImage = `data:image/png;base64,${res}`;
        resolve({
          orderIDText,
          orderedAtText,
          sizeText,
          orderQuantityText,
          orderQuantityWeightText,
          productName,
          accountName,
          deliverBeforeText,
          deliverRemarkText,
          extDetailsText,
          printFrontText,
          printBackText,
          printMemoText,
          cutDetailsText,
          packDetailsText,
          plateStatusText,
          workMemo,
          deliverMemo,
          productImage
        });
      }
    });
  });
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
  };

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
