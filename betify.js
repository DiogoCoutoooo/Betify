function calcularReturnRate3(odd1, odd2, odd3) {
	//  Calcular x diretamente
	const x = (odd2 * odd3) / (odd1 * odd2 + odd1 * odd3 + odd2 * odd3);

	//  Calcular y com base em x e as odds
	const y = (odd1 / odd2) * x;

	//  Calcular z com base em y e as odds
	const z = (odd2 / odd3) * y;

	return { x: x, y: y, z: z };
}

function calcularReturnRate2(odd1, odd2) {
	//  Calcular x
	const x = odd2 / (odd1 + odd2);

	//  Calcular y
	const y = odd1 / (odd1 + odd2);

	return { x, y };
}

function getGradientOdds(value, minValue, maxValue) {
	//  Certifique-se de que o valor está entre os limites
	const clampedValue = Math.max(minValue, Math.min(value, maxValue));

	//  Normaliza o valor para uma escala de 0 a 1
	const normalizedValue = (clampedValue - minValue) / (maxValue - minValue);

	//  Interpolar entre vermelho (0) e verde (1)
	const red = Math.round(200 * (1 - normalizedValue)); //  Quanto maior o valor, menos vermelho
	const green = Math.round(200 * normalizedValue); //  Quanto maior o valor, mais verde

	return `rgb(${red}, ${green}, 0)`; //  Retorna uma cor no formato RGB
}

function getGradientSuperOdds(value, minValue, maxValue) {
	//  Certifique-se de que o valor está entre os limites
	const clampedValue = Math.max(minValue, Math.min(value, maxValue));

	//  Normaliza o valor para uma escala de 0 a 1
	const normalizedValue = (clampedValue - minValue) / (maxValue - minValue);

	//  Interpolar entre vermelho (0) e verde (1)
	const green = Math.round(200 * (1 - normalizedValue)); //  Quanto maior o valor, menos vermelho
	const blue = Math.round(200 * normalizedValue); //  Quanto maior o valor, mais verde

	return `rgb(0, ${green}, ${blue})`; //  Retorna uma cor no formato RGB
}

let observerTimeout;
const minOdds = 89.0;
const maxOdds = 94.0;
const maxSuperOdds = 95.0;

// Função genérica para remover uma div, se necessário
function removeDivIfExists(returnRateElement) {
	if (returnRateElement?.classList.contains('extension-container') || returnRateElement?.classList.contains('return-rate')) {
		returnRateElement.remove();
	}
}

//  Verifica os odds e calcula o retorno
// TODO: melhorar função
function processOdds(casino, oddsChildren, returnRateElement) {
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
					removeDivIfExists(returnRateElement);
					return null;
				}
				solution = calcularReturnRate3(a, b, c);
			} else if (oddsChildren.length === 2) {
				if (isNaN(a) || isNaN(b)) {
					removeDivIfExists(returnRateElement);
					return null;
				}
				solution = calcularReturnRate2(a, b);
			} else {
				removeDivIfExists(returnRateElement);
				return null;
			}

			break;
		case "Betclic":
			a = parseFloat(oddsChildren[0]?.children[1]?.textContent.trim().replace(',', '.'));
			b = parseFloat(oddsChildren[1]?.children[1]?.textContent.trim().replace(',', '.'));
			c = parseFloat(oddsChildren[2]?.children[1]?.textContent.trim().replace(',', '.'));
			if (oddsChildren.length === 3) {
				if (isNaN(a) || isNaN(b) || isNaN(c)) {
					removeDivIfExists(returnRateElement);
					return null;
				}
				solution = calcularReturnRate3(a, b, c);
			} else if (oddsChildren.length === 2) {
				if (isNaN(a) || isNaN(b)) {
					removeDivIfExists(returnRateElement);
					return null;
				}
				solution = calcularReturnRate2(a, b);
			} else {
				removeDivIfExists(returnRateElement);
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

function createBetanoEvents(casino, oddsDiv, returnRateElement, isDarkTheme, odd1rr, odd2rr, odd3rr) {
	returnRateElement.addEventListener('click', function () {
		let input = document.createElement('input');
		const oddsChildren = oddsDiv.children;
		const oddsData = processOdds(casino, oddsChildren, returnRateElement);
		if (!oddsData) return;
		const { odds: extractedOdds, solution: extractedSolution } = oddsData;
		let solution = extractedSolution;
		let odds = extractedOdds;
		if (returnRateElement.parentElement.children.length < 2) {
			if (isDarkTheme == undefined) {
				buttonClassName = 'betano-light';
				inputColor = "#f6f8f9"
			} else {
				buttonClassName = 'betano-dark';
				inputColor = "#2d3745"
			}

			input.className = "input"
			input.type = 'number'; //  Define o tipo do input como texto
			input.placeholder = 'Valor Freebets'; //  Define um placeholder
			input.value = "";
			input.style.color = returnRateElement.style.color
			input.style.backgroundColor = inputColor
			input.style.borderColor = returnRateElement.style.color;
			input.style.boxShadow = returnRateElement.style.color;
			returnRateElement.parentElement.insertAdjacentElement('beforeend', input);

			odd1rr = document.createElement('div');
			odd1rr.className = buttonClassName
			odd1rr.id = `${odds.odd1}`
			odd1rr.textContent = `${Math.round((solution.x).toFixed(2) * 10000) / 10000}€`
			returnRateElement.parentElement.insertAdjacentElement('beforeend', odd1rr);

			odd2rr = document.createElement('div');
			odd2rr.className = buttonClassName
			odd2rr.id = `${odds.odd2}`
			odd2rr.textContent = `${Math.round((solution.y).toFixed(2) * 10000) / 10000}€`
			returnRateElement.parentElement.insertAdjacentElement('beforeend', odd2rr);

			if (solution.z != undefined) {
				odd3rr = document.createElement('div');
				odd3rr.className = buttonClassName
				odd3rr.id = `${odds.odd3}`
				odd3rr.textContent = `${Math.round((solution.z).toFixed(2) * 10000) / 10000}€`
				returnRateElement.parentElement.insertAdjacentElement('beforeend', odd3rr);
			}
		}
		input.addEventListener('input', () => {
			value = input.value;
			if (!(value.trim() === "")) {
				odd1rr.textContent = `${Math.round((solution.x * value).toFixed(2) * 10000) / 10000}€`
				odd2rr.textContent = `${Math.round((solution.y * value).toFixed(2) * 10000) / 10000}€`
				if (solution.z != undefined) odd3rr.textContent = `${Math.round((solution.z * value).toFixed(2) * 10000) / 10000}€`
			}
		})
	});
}

// Função que elimina o Freebet Divider
function deleteBetanoEvents(existingDiv) {
	existingDiv.children[1].remove()
	existingDiv.children[1].remove()
	existingDiv.children[1].remove()
	existingDiv.children[1]?.remove() // Pode não existir
}

// Função que atualiza ou cria o container/div para mostrar o returnRate
// TODO: tentar fazer com que a função seja mais pequena
// TODO: ver se é possível fazer o botão usando o css já existente na Betano (como se fez na Betclic)
function updateOrCreateDiv(casino, view, participantsElement, oddsDiv, returnRateElement, returnRate, uniqueId) {
	const divText = `${returnRate}%` // Texto com o returnRate, para meter na div do mesmo
	switch (casino) {
		case "Betano":
			// Cor da divText, inputElement, odd1rrElement, odd2rrElement, odd3rrElement
			let valueColor, input, odd1rr, odd2rr, odd3rr;
			// Obtenção da cor através de um gradiente
			valueColor = returnRate < maxOdds
				? getGradientOdds(returnRate, minOdds, maxOdds)
				: getGradientSuperOdds(returnRate, maxOdds - 0.5, maxSuperOdds - 0.5);

			// Verifica se o returnRateElement já foi criado e existe (extensionContainer)
			if (!returnRateElement || (!returnRateElement.classList.contains('extension-container'))) {

				// Criação do container
				extensionContainer = document.createElement('div');
				extensionContainer.className = "extension-container" // ver css
				extensionContainer.id = `container ${participantsElement.children[0].textContent.trim()}`; // id único para cada container
				participantsElement.insertAdjacentElement('afterend', extensionContainer); // Inserção depois do container do parentDiv (parentElement)

				let isDarkTheme = view.querySelector('a[data-qa="live-event"]'); // booleano que verifica se o tema à volta é escuro ou não

				returnRateElement = document.createElement('div');
				// ver css
				returnRateElement.className = isDarkTheme == undefined
					? 'return-rate betano-light'
					: 'return-rate betano-dark'
				returnRateElement.id = uniqueId; // Coloca o uniqueId na returnRateDiv
				returnRateElement.textContent = divText; // Mete o returnRate como texto da div
				returnRateElement.style.color = valueColor; // Muda a cor da div para o gradiente
				extensionContainer.insertAdjacentElement('afterbegin', returnRateElement); // Inserção no fim (dentro) do extensionContainer

				createBetanoEvents(casino, oddsDiv, returnRateElement, isDarkTheme, odd1rr, odd2rr, odd3rr) // Função que trata da criação do Freebet Divider
			}

			// Verifica se o returnRateElement já foi criado e existe (extensionContainer)
			if (returnRateElement.classList.contains("extension-container")) {
				if (returnRateElement.children[0].textContent !== divText) {
					returnRateElement.children[0].textContent = divText; // Caso o returRate mude, muda o texto
					returnRateElement.children[0].style.color = valueColor; // Caso o returRate mude, muda a cor
				}
				if (returnRateElement.children[1]?.classList.contains("input")) {
					if (returnRateElement.children[0].id != uniqueId) {
						deleteBetanoEvents(returnRateElement) // Função que elimina (esconde) o FreebetDivider
					}
				}
				returnRateElement.children[0].id = uniqueId // Atualiza o uniqueId da returnRateDiv, quando muda as odds/jogo
			}
			break;
		case "Betclic":
			if (!returnRateElement.classList.contains('return-rate')) {
				returnRateElement = document.createElement('div');
				returnRateElement.className = 'return-rate btn is-odd is-large has-trends ng-star-inserted'
				returnRateElement.id = uniqueId;
				participantsElement.insertAdjacentElement('afterend', returnRateElement);

				textSpan = document.createElement('span');
				textSpan.className = 'label ng-star-inserted'
				textSpan.textContent = divText
				returnRateElement.insertAdjacentElement('beforeend', textSpan)

				createProgressBar(returnRate, returnRateElement, 7)
				createProgressBar(returnRate, returnRateElement, 9)
			} else if (returnRateElement.nextElementSibling.classList.contains('markets') && returnRateElement.nextElementSibling.id.includes("custom-return-rate")) {
				returnRateElement.nextElementSibling.children[0].remove()
				returnRateElement.nextElementSibling.children[0].remove()
				returnRateElement.nextElementSibling.children[0].remove()
				returnRateElement.nextElementSibling.nextElementSibling.remove()
			} else if (returnRateElement.classList.contains('markets') && returnRateElement.id.includes("custom-return-rate")) {
				returnRateElement.children[0].remove()
				returnRateElement.children[0].remove()
				returnRateElement.children[0].remove()
				returnRateElement.nextElementSibling.remove()
			}
			break;
		default:
			break;
	}
}

// Lida com odds e manipula a criação/atualização da div
// Chama a função updateOrCreateDiv, adicionando aos argumentos o returnRate e o uniqueId
function handleOdds(casino, view, participantsElement, oddsDiv, returnRateElement) {
	const oddsChildren = oddsDiv.children; // As divs do oddsDiv, ou seja, cada div com uma odd
	const oddsData = processOdds(casino, oddsChildren, returnRateElement); // Função que dada uma oddsDiv, a processa e devolve o valor da odd dentro dela
	if (!oddsData) return;
	const { odds: extractedOdds, solution: extractedSolution } = oddsData; // extractedOdds: as odds do jogo; extractedSolution: a divisão das freebets do jogo
	const returnRate = Math.round((extractedSolution.x * extractedOdds.odd1).toFixed(4) * 10000) / 100; // Return rate do jogo

	switch (casino) {
		case "Betano":
			// Um uniqueId, que identifica unicamente cada jogo (usado mais tarde para ver alterações nas odds)
			// custom-return-rate-${nome das equipas}-${odd1}-${odd2}-${odd3}
			uniqueId = `custom-return-rate-${participantsElement.children[0].textContent}-${oddsChildren[0].textContent}-${oddsChildren[1].textContent}-${oddsChildren[2]?.textContent}`;
			break;
		case "Betclic":
			// Um uniqueId, que identifica unicamente cada jogo (não vê alterações nas odds)
			// custom-return-rate-${nome das equipas}
			uniqueId = `custom-return-rate-${participantsElement.children[1].children[0].textContent}`;
			break;
		default:
			break;
	}

	updateOrCreateDiv(casino, view, participantsElement, oddsDiv, returnRateElement, returnRate, uniqueId);
}

// Função que trata de selecionar as divs das odds e dos participantes no evento, 
// e chama a função que trata de calcular os return rates
// Passa como argumento o site a ser observado, a view, a participantsDiv/participantsParentDiv, a oddsDiv e a returnRateDiv/returnRateContainer
function handleSelector(casino, view) {
	let participantsDiv, oddsDiv; // Divs dos participantes e das odds, respetivamente
	switch (casino) {
		case "Betano":
			participantsDiv = view.querySelector('div[data-qa="participants"]');
			if (!participantsDiv) return;

			oddsDiv = view.querySelector('div[class*="tw-w-[30%]"][class*="tw-min-w-[160px]"]');
			if (!oddsDiv) oddsDiv = view.querySelector('div.tw-w-full.tw-flex.tw-flex-row.tw-flex-1.tw-items-center.tw-justify-center');
			if (!oddsDiv) oddsDiv = view.querySelector('div[class*="tw-max-w-[50%]"][class*="tw-min-w-[256px]"]').children[0];
			if (!oddsDiv) return;

			let participantsParentDiv = participantsDiv.parentElement // Acedemos ao parent da participantsDiv para criar um container à frente deste, em vez de dentro
			let returnRateContainer = participantsParentDiv.nextElementSibling; // Variável que vai verificar se é mesmo um returnRateContainer ou não

			handleOdds(casino, view, participantsParentDiv, oddsDiv, returnRateContainer);
			break;
		case "Betclic":
			participantsDiv = view.querySelector('.event');
			if (!participantsDiv) return;

			oddsDiv = view.querySelector('.market').children[1];
			if (oddsDiv != undefined) oddsDiv = oddsDiv.children[0]
			if (!oddsDiv) return;

			// Aqui não criamos container (não é preciso)
			let returnRateDiv = participantsDiv.nextElementSibling; // Variável que vai verificar se é mesmo uma returnRateDiv ou não

			handleOdds(casino, view, participantsDiv, oddsDiv, returnRateDiv);
			break
		default:
			break;
	}
}

// Função que itera, para cada view (seja ela do vue ou normal), os jogos dentro da mesma
// Passa como argumento o site a ser observado e as respetivas views
function handleRecycleChanges() {
	const domain = window.location.hostname; // link do site
	switch (domain) {
		case "www.betano.pt":
			// Betano
			// Apostas no recycle-scroller do vue
			const itemBetanoWrappers = document.querySelectorAll('.vue-recycle-scroller__item-wrapper');
			itemBetanoWrappers.forEach(itemWrapper => {
				const itemViews = itemWrapper.querySelectorAll('.vue-recycle-scroller__item-view');
				itemViews.forEach(itemView => {
					handleSelector("Betano", itemView);
				});
			});
			// Apostas ao vivo/pré-jogo
			const normalBetanoWrappers = document.querySelectorAll('.events-list__wrapper');
			normalBetanoWrappers.forEach(normalWrapper => {
				const normalViews = normalWrapper.querySelectorAll('div[data-evtid]');
				normalViews.forEach(normalView => {
					handleSelector("Betano", normalView);
				});
			});
			break;
		case "www.betclic.pt":
			// Betclic
			// Apostas ao vivo
			const normalBetclicWrappers = document.querySelectorAll('.groupEvents_content');
			normalBetclicWrappers.forEach(normalWrapper => {
				const normalViews = normalWrapper.querySelectorAll('.cardEvent_content');
				normalViews.forEach(normalView => {
					handleSelector("Betclic", normalView);
				});
			});
			// Apostas pré-jogo
			const normalBetclicWrappers2 = document.querySelectorAll('.verticalScroller_list');
			normalBetclicWrappers2.forEach(normalWrapper => {
				const normalViews = normalWrapper.querySelectorAll('.cardEvent_content');
				normalViews.forEach(normalView => {
					handleSelector("Betclic", normalView);
				});
			});
		default:
			break;
	}
}

// Observador que, quando há uma alteração no HTML da página, dispara a função handleRecycleChanges()
function observerCreate() {
	const observer = new MutationObserver(() => {
		//  Verifica alterações no DOM sem recriar elementos desnecessariamente
		handleRecycleChanges(); // Atualiza extensões para itens reciclados
	});

	observer.observe(document.body, { childList: true, subtree: true });
}

// Função que inicia a extensão
function initializeExtension() {
	handleRecycleChanges();    // Aplica a lógica inicialmente
	observerCreate();  // Observa mudanças no DOM reciclável
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