export const renderMarkup = () => {
    const markup = `
    <div class="popup" id="success">
        <div class="wrap">
            <svg class="icon">
                <use xlink:href="img/like.svg#like"></use>
            </svg>
            <p>Good Job!<br />you have finished the game!</p>
            <div class="btn new-game">Start New Game</div>
        </div>
    </div>
    `;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
};