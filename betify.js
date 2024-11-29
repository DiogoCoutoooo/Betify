function calcularReturnRate3(a, b, c) {
	const A = [[1, 1, 1], [a, -b, 0], [0, b, -c]];
	const B = [1, 0, 0];

	function determinant3x3(matrix) {
		return (
			matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
			matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
			matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
		);
	}

	function adjugate3x3(matrix) {
		return [
			[
				matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1],
				-(matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]),
				matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]
			],
			[
				-(matrix[0][1] * matrix[2][2] - matrix[0][2] * matrix[2][1]),
				matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0],
				-(matrix[0][0] * matrix[2][1] - matrix[0][1] * matrix[2][0])
			],
			[
				matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1],
				-(matrix[0][0] * matrix[1][2] - matrix[0][2] * matrix[1][0]),
				matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
			]
		];
	}

	function multiplyMatrixVector(matrix, vector) {
		return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
	}

	const detA = determinant3x3(A);
	const adjA = adjugate3x3(A);
	const invA = adjA.map(row => row.map(value => value / detA));
	const X = multiplyMatrixVector(invA, B);

	return { x: X[0], y: X[1], z: X[2] };
}

function calcularReturnRate2(a, b) {
	const A = [[1, 1], [a, -b]];
	const B = [1, 0];

	function determinant2x2(matrix) {
		return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
	}

	function adjugate2x2(matrix) {
		return [
			[matrix[1][1], -matrix[0][1]],
			[-matrix[1][0], matrix[0][0]]
		];
	}

	function multiplyMatrixVector(matrix, vector) {
		return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
	}

	const detA = determinant2x2(A);
	const adjA = adjugate2x2(A);
	const invA = adjA.map(row => row.map(value => value / detA));
	const X = multiplyMatrixVector(invA, B);

	return { x: X[0], y: X[1] };
}

function getGradientOdds(value, minValue, maxValue) {
	// Certifique-se de que o valor está entre os limites
	const clampedValue = Math.max(minValue, Math.min(value, maxValue));

	// Normaliza o valor para uma escala de 0 a 1
	const normalizedValue = (clampedValue - minValue) / (maxValue - minValue);

	// Interpolar entre vermelho (0) e verde (1)
	const red = Math.round(200 * (1 - normalizedValue)); // Quanto maior o valor, menos vermelho
	const green = Math.round(200 * normalizedValue); // Quanto maior o valor, mais verde

	return `rgb(${red}, ${green}, 0)`; // Retorna uma cor no formato RGB
}

function getGradientSuperOdds(value, minValue, maxValue) {
	// Certifique-se de que o valor está entre os limites
	const clampedValue = Math.max(minValue, Math.min(value, maxValue));

	// Normaliza o valor para uma escala de 0 a 1
	const normalizedValue = (clampedValue - minValue) / (maxValue - minValue);

	// Interpolar entre vermelho (0) e verde (1)
	const green = Math.round(200 * (1 - normalizedValue)); // Quanto maior o valor, menos vermelho
	const blue = Math.round(200 * normalizedValue); // Quanto maior o valor, mais verde

	return `rgb(0, ${green}, ${blue})`; // Retorna uma cor no formato RGB
}

let observerTimeout;
const minOdds = 89.0;
const maxOdds = 94.0;
const maxSuperOdds = 95.0;

// Função genérica para remover uma div, se necessário
function removeDivIfExists(existingDiv) {
	if (existingDiv?.classList.contains('return-rate-betano-light') || existingDiv?.classList.contains('return-rate-betano-dark')) {
		existingDiv.remove();
	}
}

// Verifica os odds e calcula o retorno
function processOdds(oddsChildren, existingDiv) {
	let a, b, c, solution;
	a = parseFloat(oddsChildren[0]?.textContent.trim());
	b = parseFloat(oddsChildren[1]?.textContent.trim());
	c = parseFloat(oddsChildren[2]?.textContent.trim());
	if (oddsChildren[0]?.children.length > 1) {
		a = parseFloat(oddsChildren[0]?.children[1]?.textContent.trim());
		b = parseFloat(oddsChildren[1]?.children[1]?.textContent.trim());
		c = parseFloat(oddsChildren[2]?.children[1]?.textContent.trim());
	}
	if (oddsChildren.length === 3) {
		if (isNaN(a) || isNaN(b) || isNaN(c)) {
			removeDivIfExists(existingDiv);
			return null;
		}
		solution = calcularReturnRate3(a, b, c);
	} else if (oddsChildren.length === 2) {
		if (isNaN(a) || isNaN(b)) {
			removeDivIfExists(existingDiv);
			return null;
		}
		solution = calcularReturnRate2(a, b);
	} else {
		removeDivIfExists(existingDiv);
		return null;
	}

	return { a, solution };
}

// Atualiza ou cria uma div
function updateOrCreateDiv(oddsChildren, participantsDiv, existingDiv, returnRate, uniqueId) {
	if (!existingDiv || (!existingDiv.classList.contains('return-rate-betano-light') && !existingDiv.classList.contains('return-rate-betano-dark'))) {
		// Criar uma nova div
		existingDiv = document.createElement('div');
		if (oddsChildren[0]?.children.length <= 1) existingDiv.className = 'return-rate-betano-light';
		else existingDiv.className = 'return-rate-betano-dark';
		existingDiv.id = uniqueId;
		participantsDiv.insertAdjacentElement('afterend', existingDiv);
	}

	// Atualizar conteúdo e estilo
	const newText = `${returnRate}%`;
	const valueColor =
		returnRate < maxOdds
			? getGradientOdds(returnRate, minOdds, maxOdds)
			: getGradientSuperOdds(returnRate, maxOdds, maxSuperOdds);

	if (existingDiv.textContent !== newText) {
		existingDiv.textContent = newText;
	}
	if (existingDiv.style.color !== valueColor) {
		existingDiv.style.color = valueColor;
	}
}

// Lida com odds e manipula a criação/atualização da div
function handleOdds(participantsDiv, oddsDiv, existingDiv) {
	const oddsChildren = oddsDiv.children;
	const oddsData = processOdds(oddsChildren, existingDiv);

	if (!oddsData) return;

	const { a, solution } = oddsData;
	const returnRate = Math.round((solution.x * a).toFixed(4) * 10000) / 100;
	const uniqueId = `custom-return-rate-${participantsDiv.textContent.trim().replace(/\s+/g, '-')}`;

	updateOrCreateDiv(oddsChildren, participantsDiv, existingDiv, returnRate, uniqueId);
}

// Reseta a extensão para um item específico
function resetExtensionForItemView(itemView) {
	let participantsDiv = itemView.querySelector('div[data-qa="participants"]');
	if (!participantsDiv) return;

	let oddsDiv = itemView.querySelector('div[class*="tw-w-[30%]"][class*="tw-min-w-[160px]"]');
	if (!oddsDiv) oddsDiv = itemView.querySelector('div.tw-w-full.tw-flex.tw-flex-row.tw-flex-1.tw-items-center.tw-justify-center');
	if (!oddsDiv) return;

	let existingDiv = participantsDiv.nextElementSibling;
	handleOdds(participantsDiv, oddsDiv, existingDiv);
}

function handleRecycleChanges() {
	const itemViews = document.querySelectorAll('.vue-recycle-scroller__item-view');
	itemViews.forEach(itemView => {
		resetExtensionForItemView(itemView); // Atualiza as extensões de cada item
	});

	const normalViews = document.querySelectorAll('div[data-evtid]');
	normalViews.forEach(normalViews => {
		resetExtensionForItemView(normalViews); // Atualiza as extensões de cada item
	});
}

function observerCreate() {
	const observer = new MutationObserver(() => {
		// Verifica alterações no DOM sem recriar elementos desnecessariamente
		handleRecycleChanges(); // Atualiza extensões para itens reciclados
	});

	observer.observe(document.body, { childList: true, subtree: true });
}

function initializeExtension() {

	const vueInterval = setInterval(() => {
		const itemViews = document.querySelectorAll('.vue-recycle-scroller__item-view');
		if (itemViews.length > 0) {
			clearInterval(vueInterval); // Para o intervalo ao encontrar os elementos
			handleRecycleChanges();    // Aplica a lógica inicialmente
			observerCreate();  // Observa mudanças no DOM reciclável
		}
	}, 50); // Verifica a cada 100ms
}

// Inicia a extensão
initializeExtension();

/*
	let a = parseFloat(oddsDiv?.children[0]?.textContent.trim());

	let testDiv = document.createElement('div');
	testDiv.className = 'return-rate';
	testDiv.textContent = `${a} -> ${oddsDiv?.children[0].children.length}`
	participantsDiv.insertAdjacentElement('afterend', testDiv);
*/