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
	if (existingDiv?.classList.contains('return-rate')) {
		existingDiv.remove();
	}
}

// Verifica os odds e calcula o retorno
function processOdds(casino, oddsChildren, existingDiv) {
	let a, b, c, solution;
	switch (casino) {
		case "Betano":
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

			break;
		case "Betclic":
			a = parseFloat(oddsChildren[0]?.children[1]?.textContent.trim().replace(',', '.'));
			b = parseFloat(oddsChildren[1]?.children[1]?.textContent.trim().replace(',', '.'));
			c = parseFloat(oddsChildren[2]?.children[1]?.textContent.trim().replace(',', '.'));
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
			break
		default:
			break;
	}

	return { a, solution };
}

function createProgressBar(returnRate, existingDiv, height) {
	btnTrends = document.createElement('div');
	btnTrends.className = 'btn_trends'
	btnTrends.style.height = `${height}px`
	existingDiv.insertAdjacentElement('beforeend', btnTrends)

	bcdk = document.createElement('bcdk-progress-bar');
	btnTrends.insertAdjacentElement('beforeend', bcdk)

	progressBar = document.createElement('div');
	progressBar.className = 'progressBar'
	bcdk.insertAdjacentElement('beforeend', progressBar)

	progressBarWrapper = document.createElement('div');
	progressBarWrapper.className = 'progressBar_wrapper'
	progressBar.insertAdjacentElement('beforeend', progressBarWrapper)

	let fill = Math.max(0, (returnRate - 85) * 9)
	let valueColor = returnRate < (maxOdds - 1)
		? getGradientOdds(returnRate, minOdds, maxOdds - 1)
		: getGradientSuperOdds(returnRate, maxOdds - 1.5, maxSuperOdds - 1.5);

	progressBarFill = document.createElement('div');
	progressBarFill.className = 'progressBar_fill'
	progressBarFill.style = `width: ${fill}%`
	progressBarFill.style.background = valueColor
	progressBarWrapper.insertAdjacentElement('beforeend', progressBarFill)

	progressBarSteps = document.createElement('div');
	progressBarSteps.className = 'progressBar_steps'
	progressBarWrapper.insertAdjacentElement('beforeend', progressBarSteps)

	progressBarStep = document.createElement('div');
	progressBarStep.className = 'progressBar_step'
	progressBarSteps.insertAdjacentElement('beforeend', progressBarStep)
}

// Atualiza ou cria uma div
function updateOrCreateDiv(casino, itemView, participantsDiv, existingDiv, returnRate, uniqueId) {
	let newText, valueColor;
	switch (casino) {
		case "Betano":
			if (!existingDiv || (!existingDiv.classList.contains('return-rate'))) {
				existingDiv = document.createElement('div');
				let testBool = itemView.querySelector('a[data-qa="live-event"]');
				if (testBool == undefined) existingDiv.className = 'return-rate betano-light';
				else existingDiv.className = 'return-rate betano-dark';
				existingDiv.id = uniqueId;
				participantsDiv.insertAdjacentElement('afterend', existingDiv);
			}

			newText = `${returnRate}%`;
			valueColor = returnRate < maxOdds
				? getGradientOdds(returnRate, minOdds, maxOdds)
				: getGradientSuperOdds(returnRate, maxOdds - 0.5, maxSuperOdds - 0.5);

			if (existingDiv.textContent !== newText) existingDiv.textContent = newText;
			if (existingDiv.style.color !== valueColor) existingDiv.style.color = valueColor;
			break;
		case "Betclic":
			if (!existingDiv || (!existingDiv.classList.contains('return-rate'))) {
				existingDiv = document.createElement('div');
				existingDiv.className = 'return-rate btn is-odd is-large has-trends ng-star-inserted'
				existingDiv.id = uniqueId;
				participantsDiv.insertAdjacentElement('afterend', existingDiv);

				textSpan = document.createElement('span');
				textSpan.className = 'label ng-star-inserted'
				textSpan.textContent = `${returnRate}%`
				existingDiv.insertAdjacentElement('beforeend', textSpan)

				createProgressBar(returnRate, existingDiv, 7)
				createProgressBar(returnRate, existingDiv, 9)

				/*
				progressBar = document.createElement('div');
				progressBar.className = 'barra'
				progressBar.id = "progressBar" + uniqueId;
				existingDiv.insertAdjacentElement('afterbegin', progressBar)

				progressBarSteps = document.createElement('div');
				progressBarSteps.className = 'barra_steps'
				progressBarSteps.id = "progressBarSteps" + uniqueId;
				progressBar.insertAdjacentElement('afterbegin', progressBarSteps)
				*/
			}

			//newText = `${returnRate}%`;
			//valueColor = returnRate < maxOdds
			//	? getGradientOdds(returnRate, minOdds, maxOdds)
			//	: getGradientSuperOdds(returnRate, maxOdds, maxSuperOdds);

			//if (existingDiv.textContent !== newText) existingDiv.textContent = newText;
			//if (existingDiv.style.color !== valueColor) existingDiv.style.color = valueColor;
			break;
		default:
			break;
	}
}

// Lida com odds e manipula a criação/atualização da div
function handleOdds(casino, itemView, participantsDiv, oddsDiv, existingDiv) {
	let returnRate, uniqueId;
	if (casino == "Betano") {
		const oddsChildren = oddsDiv.children;
		const oddsData = processOdds(casino, oddsChildren, existingDiv);
		if (!oddsData) return;

		const { a, solution } = oddsData;
		returnRate = Math.round((solution.x * a).toFixed(4) * 10000) / 100;
		uniqueId = `custom-return-rate-${participantsDiv.textContent.trim().replace(/\s+/g, '-')}`;
	} else if (casino == "Betclic") {
		const oddsChildren = oddsDiv.children;
		const oddsData = processOdds(casino, oddsChildren, existingDiv);
		if (!oddsData) return;

		const { a, solution } = oddsData;
		returnRate = Math.round((solution.x * a).toFixed(4) * 10000) / 100;
		uniqueId = `custom-return-rate-${participantsDiv.children[1].children[0].textContent.trim().replace(/\s+/g, '-')}`;
	}


	updateOrCreateDiv(casino, itemView, participantsDiv, existingDiv, returnRate, uniqueId);
}

// Reseta a extensão para um item específico
function handleSelector(casino, itemView) {
	let participantsDiv, oddsDiv
	if (casino == "Betano") {
		participantsDiv = itemView.querySelector('div[data-qa="participants"]');
		if (!participantsDiv) return;

		oddsDiv = itemView.querySelector('div[class*="tw-w-[30%]"][class*="tw-min-w-[160px]"]');
		if (!oddsDiv) oddsDiv = itemView.querySelector('div.tw-w-full.tw-flex.tw-flex-row.tw-flex-1.tw-items-center.tw-justify-center');
		if (!oddsDiv) oddsDiv = itemView.querySelector('div[class*="tw-max-w-[50%]"][class*="tw-min-w-[256px]"]').children[0];
		if (!oddsDiv) return;
	} else if (casino == "Betclic") {
		participantsDiv = itemView.querySelector('.event');
		if (!participantsDiv) return;

		oddsDiv = itemView.querySelector('.market').children[1];
		if (oddsDiv != undefined) oddsDiv = oddsDiv.children[0]
		if (!oddsDiv) return;
	}

	let existingDiv = participantsDiv.nextElementSibling;

	handleOdds(casino, itemView, participantsDiv, oddsDiv, existingDiv);
}

function handleRecycleChanges() {
	const domain = window.location.hostname;
	switch (domain) {
		case "www.betano.pt":
			//Betano
			const itemBetanoWrappers = document.querySelectorAll('.vue-recycle-scroller__item-wrapper');
			itemBetanoWrappers.forEach(itemWrapper => {
				const itemViews = itemWrapper.querySelectorAll('.vue-recycle-scroller__item-view');
				itemViews.forEach(itemView => {
					handleSelector("Betano", itemView); // Atualiza as extensões de cada item
				});
			});
			const normalBetanoWrappers = document.querySelectorAll('.events-list__wrapper');
			normalBetanoWrappers.forEach(normalWrapper => {
				const normalViews = normalWrapper.querySelectorAll('div[data-evtid]');
				normalViews.forEach(normalView => {
					handleSelector("Betano", normalView); // Atualiza as extensões de cada item
				});
			});
			break;
		case "www.betclic.pt":
			//Betclic
			const normalBetclicWrappers = document.querySelectorAll('.groupEvents_content');
			normalBetclicWrappers.forEach(normalWrapper => {
				const normalViews = normalWrapper.querySelectorAll('.cardEvent_content');
				normalViews.forEach(normalView => {
					handleSelector("Betclic", normalView); // Atualiza as extensões de cada item
				});
			});
		default:
			break;
	}



}

function observerCreate() {
	const observer = new MutationObserver(() => {
		// Verifica alterações no DOM sem recriar elementos desnecessariamente
		handleRecycleChanges(); // Atualiza extensões para itens reciclados
	});

	observer.observe(document.body, { childList: true, subtree: true });
}

function initializeExtension() {

	const waitLoad = setInterval(() => {
		clearInterval(waitLoad); // Para o intervalo ao encontrar os elementos
		handleRecycleChanges();    // Aplica a lógica inicialmente
		observerCreate();  // Observa mudanças no DOM reciclável
	}, 500);
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