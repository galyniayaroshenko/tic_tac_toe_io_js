import './style.scss';
import * as io from 'socket.io-client';

const socket = io.connect('http://localhost:3000');
let myTurn = true;
let playerSymbol;

function getBoardState() {
	const bord = {};

	document.querySelectorAll('.board button').forEach(elem => { // eslint-disable-line
		bord[elem.getAttribute('id')] = elem.textContent || '';
	});

	return bord;
}

function isGameOver() {
	const state = getBoardState();
	const matches = ['XXX', 'OOO'];
	const rows = [
		state.a0 + state.a1 + state.a2,
		state.b0 + state.b1 + state.b2,
		state.c0 + state.c1 + state.c2,
		state.a0 + state.b1 + state.c2,
		state.a2 + state.b1 + state.c0,
		state.a0 + state.b0 + state.c0,
		state.a1 + state.b1 + state.c1,
		state.a2 + state.b2 + state.c2
	];

	for (let i = 0; i < rows.length; i++) {
		if (rows[i] === matches[0] || rows[i] === matches[1]) {
			return true;
		}
	}
}

function renderTurnMessage() {
	if (myTurn) {
		renderMessage('Your turn.');
		disabledBord(false);
	} else {
		renderMessage('Your opponent\'s turn');
		disabledBord(true);
	}
}

function renderMessage(message) {
	document.querySelector('#messages').innerText = message; // eslint-disable-line
}

function disabledBord(isDisable) {
	document.querySelectorAll('.board button').forEach(elem => { // eslint-disable-line
		if (isDisable) {
			elem.setAttribute('disabled', true);
		} else {
			elem.removeAttribute('disabled');
		}
	});
}

function makeMove(event) {
	event.preventDefault();

	if (!myTurn || event.target.textContent.length) {
		return;
	}

	socket.emit('make.move', {
		playerSymbol,
		position: event.target.getAttribute('id')
	});
}

socket.on('move.made', data => {
	document.querySelector(`#${data.position}`).innerText = data.playerSymbol; // eslint-disable-line
	myTurn = data.playerSymbol !== playerSymbol;

	if (isGameOver()) {
		if (myTurn) {
			renderMessage('Game over. You lost.');
		} else {
			renderMessage('Game over. You won!');
		}
		disabledBord(true);
	} else {
		renderTurnMessage();
	}
});

socket.on('game.begin', data => {
	playerSymbol = data.playerSymbol;
	myTurn = playerSymbol === 'X';
	renderTurnMessage();
});

socket.on('opponent.left', () => {
	renderMessage('Your opponent left the game.');
	disabledBord(true);
});

document.querySelectorAll('.board button').forEach(elem => { // eslint-disable-line
	elem.onclick = makeMove;
});
