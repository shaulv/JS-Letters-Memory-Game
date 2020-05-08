export const renderMarkup = () => {
    const markup = `
    <div class="popup" id="opening">
        <div class="wrap">
            <svg class="icon">
                <use xlink:href="img/peace.svg#peace"></use>
            </svg>
            <p>Welcome back!<br />Do you want to start a new game<br />or continue your previous game?</p>
            <div class="wrap-btns">
                <div class="btn new-game">Start New Game</div>
                <div class="btn-sub continue-game">Continue Game</div>
            </div>
        </div>
    </div>
    `;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
};