export const renderMarkup = (card) => {
    const markup = `<div class="game__card" data-itemid="${card.id}"><div class="front"></div><div class="back"></div></div>`;
    document.querySelector('.game').insertAdjacentHTML('beforeend', markup);
};