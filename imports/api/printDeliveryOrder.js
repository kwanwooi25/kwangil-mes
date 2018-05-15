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
  let docContent = [];
  let directArray = [];
  let directTableBody = [];
  let postArray = [];
  let postTableBody = [];

  const delivery = DeliveryData.findOne({ _id: deliveryID });

  if (delivery && delivery.orderList.length !== 0) {
    delivery.orderList.map(({ orderID, deliverBy }) => {
      const order = OrdersData.findOne({ _id: orderID });
      const product = ProductsData.findOne({ _id: order.productID });
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
    if (textObj.deliverBy === '택배') {
      postArray.push(textObj);
    } else {
      directArray.push(textObj);
    }
  });

  // docContent for direct delivery
  if (directArray.length > 0) {
    directArray.map(textObj => {
      directTableBody.push(getTableBody(textObj));
    });
    docContent.push(getDocContent(deliveryID, '출고지시서 (직납)', directTableBody));
  }

  // docContent for post
  if (postArray.length > 0) {
    postArray.map(textObj => {
      postTableBody.push(getTableBody(textObj));
    });
    docContent.push(getDocContent(deliveryID, '출고지시서 (택배)', postTableBody));
  }

  // add pageBreak between both docContent
  if (docContent.length === 2) {
    docContent[1][0].pageBreak = 'before';
  }

  // generate PDF and open
  const docDefinition = getDocDefinition(filename, docContent);
  openPDF(docDefinition);
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
  let productSize = `${product.thick}x${product.length}x${product.width}`;
  let plateStatus =
    order.plateStatus === 'confirm' ? '확인' :
      order.plateStatus === 'edit' ? '수정' :
        order.plateStatus === 'new' ? '신규' : '';
  let weight =
    Number(product.thick) *
    (Number(product.length) + 5) *
    (Number(product.width) / 100) *
    0.0184 *
    Number(order.completedQuantity);
  deliverBy =
    deliverBy === 'direct' ? '직납' : deliverBy === 'post' ? '택배' : deliverBy;
  let textObj = {
    accountName: account.name,
    productName: product.name,
    productSize,
    orderQuantity: `${comma(order.orderQuantity)}매`,
    plateStatus,
    completedQuantity: `${comma(order.completedQuantity)}매`,
    weight: `${comma(weight.toFixed(0))}kg`,
    deliverBy
  };

  return textObj;
};

const getTableBody = (textObj) => {
  const {
    deliverBy,
    accountName,
    productName,
    productSize,
    orderQuantity,
    plateStatus,
    completedQuantity
  } = textObj;

  return [
    { text: deliverBy, style: 'tableCell' },
    { text: accountName, style: 'tableCell' },
    { text: productName, style: 'tableCell' },
    { text: productSize, style: 'tableCell' },
    { text: orderQuantity, style: 'tableCell' },
    { text: plateStatus, style: 'tableCell' },
    { text: completedQuantity, style: 'tableCell' },
    {}
  ]
}

const getDocContent = (deliveryID, title, tableBody) => {

  // insert table header
  tableBody.unshift([
    { text: '구분', style: 'tableHeader' },
    { text: '업체명', style: 'tableHeader' },
    { text: '제품명', style: 'tableHeader' },
    { text: '규격', style: 'tableHeader' },
    { text: '주문수량', style: 'tableHeader' },
    { text: '동판', style: 'tableHeader' },
    { text: '완성수량', style: 'tableHeader' },
    { text: '박스수', style: 'tableHeader' }
  ]);

  return [
    {
      layout: 'noBorders',
      table: {
        // 공란, 제목, 출고일
        widths: [ '25%', '*', '25%' ],
        body: [
          [
            {},
            { text: title, style: 'docTitle' },
            { text: `출고일: ${deliveryID}`, style: 'date' }
          ]
        ]
      }
    },
    {
      table: {
        // 구분, 업체명, 제품명, 규격, 주문수량, 동판, 완성수량, 박스수
        widths: ['6%', '17%', '28%', '14%', '11%', '5%', '13%', '6%'],
        body: tableBody,
      }
    }
  ]
}

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
      docTitle: {
        fontSize: 20,
        bold: true,
        margin: 10,
        alignment: 'center'
      },
      date: {
        alignment: 'right',
        margin: [0, 30, 0, 0]
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        margin: [0, 5],
        alignment: 'center'
      },
      tableCell: {
        fontSize: 9,
        margin: [0, 5],
        alignment: 'center'
      }
    }
  };
};
