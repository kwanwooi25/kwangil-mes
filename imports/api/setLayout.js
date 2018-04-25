export const setLayout = () => {
  const headerHeight = document
    .querySelector('.header')
    .getBoundingClientRect().height;
  const pageHeaderHeight = document
    .querySelector('.page-header')
    .getBoundingClientRect().height;
  const main = document.querySelector('.main');
  const list = document.querySelector('.list');
  const mainHeight = `calc(100vh - ${headerHeight + 10}px)`;
  const contentHeight = `calc(100vh - ${headerHeight +
    75 +
    pageHeaderHeight}px)`;
  main.style.height = mainHeight;
  main.style.marginTop = `${headerHeight + 5}px`;
  list.style.height = contentHeight;
}
