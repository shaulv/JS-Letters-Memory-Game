import uniqid from 'uniqid';

export default class Card {
    constructor(letter) {
        this.cardLetter = letter;
        this.isFlipped = false;
        this.foundPair = false;
        this.id = uniqid();
    }
}