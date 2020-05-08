import * as cardView from './views/cardView';
import * as successView from './views/successView';
import * as openingView from './views/openingView';
import Card from "./models/card";
import LS from "./models/localStorage"

/** Global mgState of the app
 * - cards
 * - moves
 * - timer
 * - currentFlip
 * - gameFinished
 */

let mgState = {
    cards: [],
    moves: 0,
    timer: {
        mins: 0,
        secs: 0
    },
    currentFlip: [],
    gameFinished: false
};
//Testing mgState
//window.mgState = mgState;

//#region Control Functions
const newGame = async () => {
    const lettersArray = await ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    const newLettersArray = await pick12Letters(lettersArray);

    const lettersPair = await createLettersPairArray(newLettersArray);

    mgState.cards = await createCardsData(lettersPair);

    await renderCardsData(mgState.cards);

    function pick12Letters(lettersArray) {
        let returnArray = [], count = 0, index, isExist;
        do {
            isExist = false;
            index = Math.floor(Math.random() * 26);

            if (returnArray.length > 0) {
                returnArray.forEach(cur => {
                    if (cur === lettersArray[index]) {
                        isExist = true;
                    }
                });
            }
            if (!isExist) {
                addIndex();
            };
        } while (count < 12);

        function addIndex() {
            returnArray.push(lettersArray[index]);
            ++count;
        };
        return returnArray;
    };

    function createLettersPairArray(letters) {
        let lettersPair = [];

        const lettersLength = letters.length;

        for (let i = 0; i < lettersLength * 2; i++) {
            let isPair;
            do {
                const index = Math.floor(Math.random() * lettersLength);
                let count = 0;
                for (let i of lettersPair) {
                    if (i === letters[index]) {
                        count++;
                    }
                }
                if (count <= 1) {
                    isPair = true;
                    lettersPair.push(letters[index]);
                }
                else {
                    isPair = false;
                }
            } while (!isPair);
        }
        return lettersPair;
    };

    function createCardsData(lettersPair) {
        let cards = [];
        for (const letter of lettersPair) {
            cards.push(new Card(letter));
        }
        return cards;
    };
}

const continueGame = async () => {
    await renderCardsData(mgState.cards);

    mgState.cards.forEach((cur) => {
        if (cur.isFlipped && cur.foundPair) {
            let gameCard = document.querySelector(`[data-itemid="${cur.id}"]`);
            gameCard.classList.add('game__card--flip');
            gameCard.childNodes[0].innerHTML = cur.cardLetter;
            document.querySelector(`[data-itemid="${cur.id}"]`).classList.add('match');
        } else if (cur.isFlipped && !cur.foundPair) {
            cur.isFlipped = false;
        }
    });

    mgState.currentFlip = [];

    injectStates();
    removePopup('#opening');
}

const clickCard = async (e) => {
    mgState.gameFinished = false;
    let id, gameCard;
    try {
        id = await e.target.closest('.game__card').dataset.itemid;
        gameCard = await document.querySelector(`[data-itemid="${id}"]`);
    } catch (e) {

    }

    if (gameCard && id) {
        clickController();
    }

    async function clickController() {
        let card;
        mgState.cards.forEach(cur => {
            if (cur.id === id) {
                card = cur;
            }
        });

        gameCard.childNodes[0].innerHTML = card.cardLetter;

        await gameCard.classList.add('game__card--flip');

        setTimeout(() => {

            if (!card.isFlipped) {
                card.isFlipped = true;

                mgState.currentFlip.push(card);

                ++mgState.moves;
                document.getElementById('movesCount').innerHTML = mgState.moves;

                if (mgState.moves === 1) {
                    startTimer();
                }

                compare();

                LS.setData('mgState', mgState);
            }

        }, 1000);
    }

    function compare() {
        if (mgState.currentFlip.length > 1) {
            if (mgState.currentFlip[0].cardLetter === mgState.currentFlip[1].cardLetter) {
                match();
            } else {
                different();
            }
        }
    }

    async function match() {
        await document.querySelector(`[data-itemid="${mgState.currentFlip[0].id}"]`).classList.add('match');
        await document.querySelector(`[data-itemid="${mgState.currentFlip[1].id}"]`).classList.add('match');

        mgState.currentFlip[0].foundPair = true;
        mgState.currentFlip[1].foundPair = true;
        mgState.currentFlip = [];

        checkSuccess();
    }

    async function different() {
        await document.querySelector(`[data-itemid="${mgState.currentFlip[0].id}"]`).classList.remove('game__card--flip');
        await document.querySelector(`[data-itemid="${mgState.currentFlip[1].id}"]`).classList.remove('game__card--flip');

        document.querySelector(`[data-itemid="${mgState.currentFlip[0].id}"] .front`).innerHTML = await '';
        document.querySelector(`[data-itemid="${mgState.currentFlip[1].id}"] .front`).innerHTML = await '';

        mgState.currentFlip[0].isFlipped = false;
        mgState.currentFlip[1].isFlipped = false;
        mgState.currentFlip = [];
    }

    function checkSuccess() {
        let cardsCount = 0;

        mgState.cards.forEach((cur, i) => {
            if (cur.isFlipped && cur.foundPair) {
                ++cardsCount;
            }
        });

        if (mgState.cards.length === cardsCount) {
            openSuccessPopup();
        }
    }

    function startTimer() {
        const minsUi = document.querySelector("#min");
        const secsUi = document.querySelector("#secs");

        const int = setInterval(() => {
            if (mgState.gameFinished) {
                clearInterval(int);
            } else {
                ++mgState.timer.secs;
                secsUi.innerHTML = mgState.timer.secs;
                if (mgState.timer.secs > 59) {
                    ++mgState.timer.mins;
                    mgState.timer.secs = 0;
                    secsUi.innerHTML = mgState.timer.secs;
                    minsUi.innerHTML = mgState.timer.mins;
                }
                LS.setData('mgState', mgState);
            }
        }, 1000);
    };

    function openSuccessPopup() {
        successView.renderMarkup();

        setTimeout(() => {
            document.querySelector('#success .wrap').classList.add('active');
            mgState.gameFinished = true;
            LS.setData('mgState', mgState);
        }, 500);

        setupResetGameEvent();
    }
};

const resetGame = () => {
    mgState.gameFinished = true;

    mgState.timer.secs = 0;
    mgState.timer.mins = 0;
    mgState.moves = 0;
    mgState.currentFlip = [];
    mgState.cards = [];

    document.querySelector('.game').innerHTML = '';

    injectStates();

    removePopup('#success');
    removePopup('#opening');

    LS.setData('mgState', mgState);
};
//#endregion


//#region Functions
const renderCardsData = cards => {
    for (const card of cards) {
        cardView.renderMarkup(card);
    }
};

const injectStates = () => {
    document.querySelector('#movesCount').innerHTML = mgState.moves;
    document.querySelector('#min').innerHTML = mgState.timer.mins;
    document.querySelector('#secs').innerHTML = mgState.timer.secs;
}

const removePopup = id => {
    const Ui = document.querySelector(id);
    if (Ui) {
        Ui.remove();
    }
}

//#endregion


//#region Events
window.addEventListener("load", () => {
    let state = LS.readData('mgState');

    if (state && !state.gameFinished) {
        mgState = state;

        openingView.renderMarkup();
        setTimeout(() => {
            document.querySelector('#opening .wrap').classList.add('active');
        }, 500);

        setupResetGameEvent();
        setupContinueGameEvent();
    } else {
        localStorage.clear();
        newGame();
    }
});

document.querySelector('.game').addEventListener('click', clickCard);

const setupResetGameEvent = () => {
    document.querySelector('.new-game').addEventListener('click', () => {
        localStorage.clear();
        if (isSmartWin || isAutoWin) {
            location.reload();
        }
        resetGame();
        newGame();
    });
}
setupResetGameEvent();

const setupContinueGameEvent = () => {
    document.querySelector('.continue-game').addEventListener('click', () => {
        continueGame();
    });
}
//#endregion


//#region Console Cheats

console.log("Console Cheats:");
console.log("-----------------------------------------------------")
console.log("Funtion 'smartWin()': \n-------------------\n Starts a automatic bot that simulates a human click and memory \n\n");
console.log("Funtion 'autoWin()': \n------------------\n Random clicks until game is over \n\n");


let isAutoWin = false;
const autoWin = () => {
    console.log("Start autoWin");
    isAutoWin = true;
    let allCards;
    const cardsUi = Array.from(document.querySelectorAll('.game__card'));
    let count = 0;

    const loop = setInterval(() => {
        const rnd1 = Math.floor(Math.random() * cardsUi.length);
        const rnd2 = Math.floor(Math.random() * cardsUi.length);

        cardsUi[rnd1].click();
        cardsUi[rnd2].click();

        allCards = Array.from(document.querySelectorAll('.game__card'));

        for (let i = 0; i < allCards.length; i++) {
            if (allCards[i].classList.contains('match')) {
                ++count;
            }
        }

        if (count === allCards.length) {
            clearInterval(loop);
            console.log("autoWin Done!");
        } else {
            count = 0;
        }
    }, 10);
};
window.autoWin = autoWin;

let isSmartWin = false;
const smartWin = () => {
    console.log("Start smartWin");
    isSmartWin = true;

    let memory = {
        curFlipped: [],
        match: [],
        flip: [],
        remember: []
    };

    let cardsUi = Array.from(document.querySelectorAll('.game__card'));

    const memorySave = setInterval(() => {
        if (!mgState.gameFinished) {
            memorySaveCurrentSituation();
        } else {
            clearInterval(memorySave);
        }
    }, 100);

    const actions = setInterval(() => {
        let last1, last2;
        let l1, l2;

        if (memory.flip.length > 0) {
            setTimeout(() => {

                if (last1 && last2) {
                    do {
                        l1 = randomFlip();
                    } while (l1.id === last1.id);
                } else {
                    l1 = randomFlip();
                }
                if (l1) cardClick(l1.id);

            }, 1000);
            setTimeout(() => {
                let isRemember = false;

                if (memory.remember.length > 0) {

                    if (l1) {
                        memory.remember.forEach((cur, i) => {
                            if (l1.id !== cur.id && l1.cardLetter === cur.cardLetter) {

                                cardClick(cur.id);

                                last2 = cur;

                                memory.remember.splice(i, 1);

                                isRemember = true;
                            }
                        });
                    }

                    if (isRemember) {
                        memory.remember.forEach((cur, i) => {
                            if (l1.id === cur.id) {
                                memory.remember.splice(i, 1);
                            }
                        });
                    }
                }

                if (!isRemember) {

                    if (last1 && last2) {
                        do {
                            l2 = randomFlip();
                        } while (l2.id === last2.id);
                    } else {
                        l2 = randomFlip();
                    }

                    if (l2) {

                        cardClick(l2.id);

                        if (l1.cardLetter !== l2.cardLetter) {

                            rememberNotExistPush(l1);
                            rememberNotExistPush(l2);

                        } else if (l1.cardLetter === l2.cardLetter) {

                            rememberExistRemove(l1);
                            rememberExistRemove(l2);

                        }

                        last2 = l2;
                    }

                }

                if (l1 && last1) last1 = l1;
            }, 2000);
        }
        setTimeout(() => {
            if (mgState.gameFinished) {
                clearInterval(actions);
                console.log("smartWin Done!");
            }
        }, 2900);

        function rememberExistRemove(card) {
            memory.remember.forEach((cur, i) => {
                if (card.id === cur.id) {
                    memory.remember.splice(i, 1);
                }
            });
        }

        function rememberNotExistPush(card) {
            let isExist = false;

            memory.remember.forEach(cur => {
                if (card.id === cur.id) {
                    isExist = true;
                }
            });
            if (!isExist) {
                memory.remember.push(card);
            }
        }

        function cardClick(id) {
            document.querySelector(`[data-itemid="${id}"]`).click();
        }

        function randomFlip() {
            const flipIndex = Math.floor(Math.random() * memory.flip.length);
            return memory.flip[flipIndex];
        }

    }, 3000);

    function memorySaveCurrentSituation() {
        memoryClear();
        arrange();

        function arrange() {
            let count = 0;
            memory.curFlipped.forEach((cur, i) => {
                if (!cur.isFlipped && !cur.foundPair) {
                    memory.flip.push(cur);
                    memory.curFlipped.splice(i - count, 1);
                    ++count;
                } else if (cur.isFlipped && cur.foundPair) {
                    memory.flip.push(cur);
                    memory.curFlipped.splice(i - count, 1);
                    ++count;
                }
            });

            cardsUi.forEach(cur => {
                const id = cur.dataset.itemid;
                const card = mgState.cards.find(c => c.id === id);

                if (card.isFlipped && !card.foundPair) {

                    if (memory.curFlipped.length > 0) {

                        memoryExistPushAndRemove(memory.curFlipped, memory.flip, card);

                    } else {

                        memoryPushAndRemove(memory.curFlipped, memory.flip, card);

                    }

                } else if (card.isFlipped && card.foundPair) {
                    if (memory.match.length > 1) {

                        memoryExistPushAndRemove(memory.match, memory.flip, card);

                    } else {

                        memoryPushAndRemove(memory.match, memory.flip, card);

                    }

                } else if (!card.isFlipped && !card.foundPair) {

                    if (memory.flip.length > 0) {

                        let isExist = false;
                        memory.flip.forEach(cur => {
                            if (cur.id === card.id) {
                                isExist = true;
                            }
                        });
                        if (!isExist) {
                            memory.flip.push(card);
                        }
                    } else {
                        memory.flip.push(card);
                    }

                }
            });

            function memoryPushAndRemove(pushCell, removeCell, card) {
                pushCell.push(card);

                const flipIndex = memory.flip.findIndex(f => f.id === card.id);
                removeCell.splice(flipIndex, 1);
            }

            function memoryExistPushAndRemove(pushCell, removeCell, card) {
                let isExist = false;
                pushCell.forEach(cur => {
                    if (cur.id === card.id) {
                        isExist = true;
                    }
                });
                if (!isExist) {
                    pushCell.push(card);

                    const flipIndex = memory.flip.findIndex(f => f.id === card.id);
                    removeCell.splice(flipIndex, 1);
                }
            }
        }

        //console.log(memory);
    }

    function memoryClear() {
        let memory = {
            curFlipped: [],
            match: [],
            flip: []
        };
    }

};
window.smartWin = smartWin;
//#endregion









