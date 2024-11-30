function calcularReturnRate3(odd1, odd2, odd3) {
	// Calcular x diretamente
	const x = (odd2 * odd3) / (odd1 * odd2 + odd1 * odd3 + odd2 * odd3);

	// Calcular y com base em x e as odds
	const y = (odd1 / odd2) * x;

	// Calcular z com base em y e as odds
	const z = (odd2 / odd3) * y;

	return { x: x, y: y, z: z };
}

function calcularReturnRate2(odd1, odd2) {
	// Calcular x
	const x = odd2 / (odd1 + odd2);

	// Calcular y
	const y = odd1 / (odd1 + odd2);

	return { x, y };
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
	if (existingDiv.classList.contains('extension-container') || existingDiv.classList.contains('return-rate')) {
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
					//	removeDivIfExists(existingDiv);
					return null;
				}
				solution = calcularReturnRate3(a, b, c);
			} else if (oddsChildren.length === 2) {
				if (isNaN(a) || isNaN(b)) {
					//	removeDivIfExists(existingDiv);
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

	let odds = { odd1: a, odd2: b, odd3: c }

	return { odds, solution };
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

function createBetanoEvents(input, odd1rr, odd2rr, odd3rr, existingDiv, testBool, solution) {
	existingDiv.addEventListener('click', function () {
		if (existingDiv.parentElement.children.length < 2) {
			if (testBool == undefined) {
				buttonClassName = 'betano-light';
				inputColor = "#f6f8f9"
			} else {
				buttonClassName = 'betano-dark';
				inputColor = "#2d3745"
			}

			input.type = 'number'; // Define o tipo do input como texto
			input.placeholder = 'Valor Freebets'; // Define um placeholder
			input.style.color = existingDiv.style.color
			input.style.backgroundColor = inputColor
			input.style.borderColor = existingDiv.style.color;
			input.style.boxShadow = existingDiv.style.color;
			existingDiv.parentElement.insertAdjacentElement('beforeend', input);

			odd1rr = document.createElement('div');
			odd1rr.className = buttonClassName
			odd1rr.textContent = `${Math.round((solution.x).toFixed(2) * 10000) / 10000}€`
			existingDiv.parentElement.insertAdjacentElement('beforeend', odd1rr);

			odd2rr = document.createElement('div');
			odd2rr.className = buttonClassName
			odd2rr.textContent = `${Math.round((solution.y).toFixed(2) * 10000) / 10000}€`
			existingDiv.parentElement.insertAdjacentElement('beforeend', odd2rr);

			odd3rr = document.createElement('div');
			odd3rr.className = buttonClassName
			odd3rr.textContent = `${Math.round((solution.z).toFixed(2) * 10000) / 10000}€`
			existingDiv.parentElement.insertAdjacentElement('beforeend', odd3rr);
		}
	});

	input.addEventListener('input', () => {
		value = input.value;
		if (!(value.trim() === "")) {
			odd1rr.textContent = `${Math.round((solution.x * value).toFixed(2) * 10000) / 10000}€`
			odd2rr.textContent = `${Math.round((solution.y * value).toFixed(2) * 10000) / 10000}€`
			odd3rr.textContent = `${Math.round((solution.z * value).toFixed(2) * 10000) / 10000}€`
		}
	})
}

// Atualiza ou cria uma div
function updateOrCreateDiv(casino, itemView, participantsDiv, existingDiv, returnRate, uniqueId, solution) {
	let newText, valueColor;
	switch (casino) {
		case "Betano":
			let testBool = itemView.querySelector('a[data-qa="live-event"]');
			if (!existingDiv || (!existingDiv.classList.contains('extension-container'))) {
				extensionContainer = document.createElement('div');
				extensionContainer.className = "extension-container"
				extensionContainer.id = "container " + uniqueId;
				participantsDiv.insertAdjacentElement('afterend', extensionContainer);

				existingDiv = document.createElement('div');
				if (testBool == undefined) existingDiv.className = 'return-rate betano-light';
				else existingDiv.className = 'return-rate betano-dark';
				existingDiv.id = uniqueId;
				valueColor = returnRate < maxOdds
					? getGradientOdds(returnRate, minOdds, maxOdds)
					: getGradientSuperOdds(returnRate, maxOdds - 0.5, maxSuperOdds - 0.5);

				existingDiv.textContent = `${returnRate}%`;
				existingDiv.style.color = valueColor;
				extensionContainer.insertAdjacentElement('afterbegin', existingDiv);

				let input, odd1rr, odd2rr, odd3rr;
				input = document.createElement('input');
				createBetanoEvents(input, odd1rr, odd2rr, odd3rr, existingDiv, testBool, solution)
			}

			valueColor = returnRate < maxOdds
				? getGradientOdds(returnRate, minOdds, maxOdds)
				: getGradientSuperOdds(returnRate, maxOdds - 0.5, maxSuperOdds - 0.5);

			if (!existingDiv.classList.contains("extension-container")) {
				if (existingDiv.textContent !== newText) existingDiv.textContent = `${returnRate}%`;
				if (existingDiv.style.color !== valueColor) existingDiv.style.color = valueColor;
			}
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
			}
			break;
		default:
			break;
	}
}

// Lida com odds e manipula a criação/atualização da div
function handleOdds(casino, itemView, participantsDiv, oddsDiv, existingDiv) {
	let returnRate, uniqueId, solution;
	if (casino == "Betano") {
		const oddsChildren = oddsDiv.children;
		const oddsData = processOdds(casino, oddsChildren, existingDiv);
		if (!oddsData) return;

		const { odds, solution: extractedSolution } = oddsData;
		solution = extractedSolution;
		returnRate = Math.round((extractedSolution.x * odds.odd1).toFixed(4) * 10000) / 100;
		uniqueId = `custom-return-rate-${participantsDiv.children[0].textContent.trim().replace(/\s+/g, '-')}`;
	} else if (casino == "Betclic") {
		const oddsChildren = oddsDiv.children;
		const oddsData = processOdds(casino, oddsChildren, existingDiv);
		if (!oddsData) return;

		const { odds, solution: extractedSolution } = oddsData;
		solution = extractedSolution;
		returnRate = Math.round((extractedSolution.x * odds.odd1).toFixed(4) * 10000) / 100;
		uniqueId = `custom-return-rate-${participantsDiv.children[1].children[0].textContent.trim().replace(/\s+/g, '-')}`;
	}

	updateOrCreateDiv(casino, itemView, participantsDiv, existingDiv, returnRate, uniqueId, solution);
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
		participantsDiv = participantsDiv.children[0]
	}

	participantsDiv = participantsDiv.parentElement
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
			const normalBetclicWrappers2 = document.querySelectorAll('.verticalScroller_list');
			normalBetclicWrappers2.forEach(normalWrapper => {
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