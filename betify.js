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

	return { x: x, y: y };
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

// Verifica os odds e calcula o retorno
// TODO: melhorar função
function processOdds(casino, oddsDiv, returnRateElement) {
	let oddsChildren = oddsDiv?.children;
	let odds
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
			odds = { odd1: a, odd2: b, odd3: c }
			break;
		case "Betclic":
			a = parseFloat(oddsChildren[0]?.children[1]?.textContent.trim().replace(',', '.'));
			b = parseFloat(oddsChildren[1]?.children[1]?.textContent.trim().replace(',', '.'));
			c = parseFloat(oddsChildren[2]?.children[1]?.textContent.trim().replace(',', '.'));
			if (oddsChildren.length === 3) {
				if (isNaN(a) || isNaN(b) || isNaN(c)) {
					return null;
				}
				solution = calcularReturnRate3(a, b, c);
			} else if (oddsChildren.length === 2) {
				if (isNaN(a) || isNaN(b)) {
					return null;
				}
				solution = calcularReturnRate2(a, b);
			} else {
				return null;
			}
			odds = { odd1: a, odd2: b, odd3: c }
			break
		case "Bwin":
			if (oddsDiv == undefined) {
				return null;
			}
			if (oddsDiv.parentElement.classList.contains("grid-six-pack-wrapper")) {
				// VER TUDO DENOVO CÓDIGO MEGA PODRE
				a = parseFloat(oddsChildren[0]?.querySelector(".option-value")?.textContent.trim());
				b = parseFloat(oddsChildren[1]?.querySelector(".option-value")?.textContent.trim());
				if (oddsChildren.length == 3) {
					a = parseFloat(oddsChildren[1]?.querySelector(".option-value")?.textContent.trim());
					b = parseFloat(oddsChildren[2]?.querySelector(".option-value")?.textContent.trim());
				}
				if (oddsChildren.length == 1) {
					solution = { x: 0, y: 0 };
					odds = { odd1: a, odd2: b }
					return null
				}
				solution = calcularReturnRate2(a, b);
				odds = { odd1: a, odd2: b }
				return { odds, solution };
			} else {
				// VER TUDO DENOVO CÓDIGO MEGA PODRE
				a = parseFloat(oddsChildren[0]?.querySelector(".option-value")?.textContent.trim());
				b = parseFloat(oddsChildren[1]?.querySelector(".option-value")?.textContent.trim());
				c = parseFloat(oddsChildren[2]?.querySelector(".option-value")?.textContent.trim());
				if (oddsChildren.length < 2) {
					removeDivIfExists(returnRateElement);
					return null
				}
				if (oddsChildren.length == 2) {
					if (isNaN(a) || isNaN(b)) {
						removeDivIfExists(returnRateElement);
						return null
					}
					solution = calcularReturnRate2(a, b);
					odds = { odd1: a, odd2: b, odd3: c }
					return { odds, solution };
				}
				if (oddsDiv.querySelectorAll(".grid-option-selectable")?.length == 3) {
					if (isNaN(a) || isNaN(b) || isNaN(c)) {
						removeDivIfExists(returnRateElement);
						return null
					}
					solution = calcularReturnRate3(a, b, c);
					odds = { odd1: a, odd2: b, odd3: c }
					return { odds, solution };
				} else if (oddsDiv.querySelectorAll(".grid-option-selectable")?.length != oddsDiv.querySelectorAll(".option-group-attribute")?.length) {
					if (isNaN(b) || isNaN(c)) {
						removeDivIfExists(returnRateElement);
						return null
					}
					solution = calcularReturnRate2(b, c);
					odds = { odd1: b, odd2: c, odd3: a }
					return { odds, solution };
				}
			}
			break
		case "ESC":
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
			odds = { odd1: a, odd2: b, odd3: c }
			break;
		default:
			break;
	}

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

	let fill = Math.min(Math.max(0, (returnRate - (minOdds - 4)) * 9), 100)
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
		const oddsData = processOdds(casino, oddsDiv, returnRateElement);
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
			input.type = 'number'; // Define o tipo do input como texto
			input.placeholder = 'Valor Freebets'; // Define um placeholder
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
	if (oddsDiv.children.length == 3 && returnRate < 55) returnRate *= 2
	const divText = `${returnRate}%` // Texto com o returnRate, para meter na div do mesmo
	let valueColor, odd1rr, odd2rr, odd3rr;
	switch (casino) {
		case "Betano":
			// Cor da divText, inputElement, odd1rrElement, odd2rrElement, odd3rrElement
			// Obtenção da cor através de um gradiente
			valueColor = returnRate < maxOdds
				? getGradientOdds(returnRate, minOdds, maxOdds)
				: getGradientSuperOdds(returnRate, maxOdds - 0.5, maxSuperOdds - 0.5);

			// Verifica se o returnRateElement já foi criado e existe (extensionContainer), e dá update
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
				participantsElement.insertAdjacentElement('afterend', returnRateElement);

				let textSpan = document.createElement('span');
				textSpan.className = 'label ng-star-inserted'
				textSpan.textContent = divText
				returnRateElement.insertAdjacentElement('beforeend', textSpan)

				createProgressBar(returnRate, returnRateElement, 7)
				createProgressBar(returnRate, returnRateElement, 9)
			}
			// CÓDIGO PODRE TENTAR FAZER MELHOR
			if (returnRateElement.parentElement.children.length == 4) {
				if (returnRateElement.nextElementSibling.nextElementSibling !== null) {
					if (returnRateElement.nextElementSibling.querySelectorAll('.btn_trends').length > 0) {
						let firstButtonTrend = returnRateElement.nextElementSibling.querySelector('.btn_trends');
						firstButtonTrend.remove()
						let secondButtonTrend = returnRateElement.nextElementSibling.querySelector('.btn_trends');
						secondButtonTrend.remove()
						let spanRemove = returnRateElement.nextElementSibling.querySelector('span');
						spanRemove.remove()
						returnRateElement.nextElementSibling.nextElementSibling.remove()
					}
				}
			}
			// Verifica se o returnRateElement já foi criado e existe, e dá update
			if (returnRateElement.classList.contains('return-rate')) {
				//alert(divText)
				let textSpan = returnRateElement.querySelector('span');
				if (textSpan.textContent !== divText) {
					textSpan.textContent = divText
				}
				returnRateElement.id = uniqueId; // Coloca o uniqueId na returnRateDiv
				let progressBars = returnRateElement.querySelectorAll('.progressBar_fill');
				progressBars.forEach(bar => {
					let fill = Math.min(Math.max(0, (returnRate - (minOdds - 4)) * 9), 100)
					let valueColor = returnRate < (maxOdds - 1)
						? getGradientOdds(returnRate, minOdds, maxOdds - 1)
						: getGradientSuperOdds(returnRate, maxOdds - 1.5, maxSuperOdds - 1.5);

					bar.style = `width: ${fill}%`
					bar.style.background = valueColor
				})
				if (divText == undefined) {
					returnRateElement.remove()
				}
			}
			if (returnRate == undefined) {
			}
			break;
		case "Bwin":
			let newOddsDiv = oddsDiv.parentElement.querySelector('.grid-six-pack-wrapper')
			if (newOddsDiv) {
				if (!returnRateElement.classList.contains('extension-container-long')) {
					let extensionContainer = document.createElement('div');
					extensionContainer.className = 'extension-container-long'
					extensionContainer.id = uniqueId; // Coloca o uniqueId na returnRateDiv
					participantsElement.nextElementSibling.insertAdjacentElement('afterend', extensionContainer);

					let oddsData1 = processOdds(casino, newOddsDiv?.children[0], returnRateElement.children[0])

					if (oddsData1 != null) {
						let returnRateElement1 = document.createElement('div');
						returnRateElement1.className = 'return-rate bwin-button one'
						returnRateElement1.id = uniqueId + " one"; // Coloca o uniqueId na returnRateDiv
						extensionContainer.insertAdjacentElement('beforeend', returnRateElement1);
					} else {
						let returnRateElement1 = document.createElement('div');
						returnRateElement1.className = 'return-rate bwin-button one'
						returnRateElement1.id = uniqueId + " one"; // Coloca o uniqueId na returnRateDiv
						extensionContainer.insertAdjacentElement('beforeend', returnRateElement1);
					}

					let oddsData2 = processOdds(casino, newOddsDiv?.children[1], returnRateElement.children[1])

					if (oddsData2 != null) {
						let returnRateElement2 = document.createElement('div');
						returnRateElement2.className = 'return-rate bwin-button two'
						returnRateElement2.id = uniqueId + " two"; // Coloca o uniqueId na returnRateDiv
						extensionContainer.insertAdjacentElement('beforeend', returnRateElement2);
					} else {
						let returnRateElement2 = document.createElement('div');
						returnRateElement2.className = 'return-rate bwin-button two'
						returnRateElement2.id = uniqueId + " two"; // Coloca o uniqueId na returnRateDiv
						extensionContainer.insertAdjacentElement('beforeend', returnRateElement2);
					}

					let oddsData3 = processOdds(casino, newOddsDiv?.children[2], returnRateElement.children[2])

					if (oddsData3 != null) {
						let returnRateElement3 = document.createElement('div');
						returnRateElement3.className = 'return-rate bwin-button three'
						returnRateElement3.id = uniqueId + " three"; // Coloca o uniqueId na returnRateDiv
						extensionContainer.insertAdjacentElement('beforeend', returnRateElement3);
					} else {
						let returnRateElement3 = document.createElement('div');
						returnRateElement3.className = 'return-rate bwin-button three'
						returnRateElement3.id = uniqueId + " three"; // Coloca o uniqueId na returnRateDiv
						extensionContainer.insertAdjacentElement('beforeend', returnRateElement3);
					}
				}
				if (returnRateElement.classList.contains('extension-container-long')) {
					if (returnRateElement.children.length == 3) {
						let oddsData1 = processOdds(casino, newOddsDiv?.children[0], returnRateElement)
						let oddsData2 = processOdds(casino, newOddsDiv?.children[1], returnRateElement)
						let oddsData3 = processOdds(casino, newOddsDiv?.children[2], returnRateElement)

						if (oddsData1 != null) {
							let { odds: extractedOdds1, solution: extractedSolution1 } = oddsData1
							let returnRate1 = Math.round((extractedSolution1?.x * extractedOdds1?.odd1).toFixed(4) * 10000) / 100
							let valueColor1 = returnRate1 < (maxOdds - 1)
								? getGradientOdds(returnRate1, minOdds, maxOdds - 1)
								: getGradientSuperOdds(returnRate1, maxOdds - 1.5, maxSuperOdds - 1.5);
							let returnRateElement1 = returnRateElement.children[0];
							if (returnRateElement1.textContent != `${returnRate1}%`) returnRateElement1.textContent = `${returnRate1}%`; // Mete o returnRate como texto da div
							if (returnRateElement1.style.color != valueColor1) returnRateElement1.style.color = valueColor1; // Muda a cor da div para o gradiente
						} else {
							let returnRateElement1 = returnRateElement.children[0];
							if (returnRateElement1.textContent != `0%`) returnRateElement1.textContent = `0%`; // Mete o returnRate como texto da div
							if (returnRateElement1.style.color != `rgb(255, 255, 255)`) returnRateElement1.style.color = `rgb(255, 255, 255)`; // Muda a cor da div para o gradiente
						}
						if (oddsData2 != null) {
							let { odds: extractedOdds2, solution: extractedSolution2 } = oddsData2
							let returnRate2 = Math.round((extractedSolution2?.x * extractedOdds2?.odd1).toFixed(4) * 10000) / 100
							let valueColor2 = returnRate2 < (maxOdds - 1)
								? getGradientOdds(returnRate2, minOdds, maxOdds - 1)
								: getGradientSuperOdds(returnRate2, maxOdds - 1.5, maxSuperOdds - 1.5);
							let returnRateElement2 = returnRateElement.children[1];
							if (returnRateElement2.textContent != `${returnRate2}%`) returnRateElement2.textContent = `${returnRate2}%`; // Mete o returnRate como texto da div
							if (returnRateElement2.style.color != valueColor2) returnRateElement2.style.color = valueColor2; // Muda a cor da div para o gradiente
						} else {
							let returnRateElement2 = returnRateElement.children[1];
							if (returnRateElement2.textContent != `0%`) returnRateElement2.textContent = `0%`; // Mete o returnRate como texto da div
							if (returnRateElement2.style.color != `rgb(255, 255, 255)`) returnRateElement2.style.color = `rgb(255, 255, 255)`; // Muda a cor da div para o gradiente
						}
						if (oddsData3 != null) {
							let { odds: extractedOdds3, solution: extractedSolution3 } = oddsData3
							let returnRate3 = Math.round((extractedSolution3?.x * extractedOdds3?.odd1).toFixed(4) * 10000) / 100
							let valueColor3 = returnRate3 < (maxOdds - 1)
								? getGradientOdds(returnRate3, minOdds, maxOdds - 1)
								: getGradientSuperOdds(returnRate3, maxOdds - 1.5, maxSuperOdds - 1.5);
							let returnRateElement3 = returnRateElement.children[2];
							if (returnRateElement3.textContent != `${returnRate3}%`) returnRateElement3.textContent = `${returnRate3}%`; // Mete o returnRate como texto da div
							if (returnRateElement3.style.color != valueColor3) returnRateElement3.style.color = valueColor3; // Muda a cor da div para o gradiente
						} else {
							let returnRateElement3 = returnRateElement.children[2];
							if (returnRateElement3.textContent != `0%`) returnRateElement3.textContent = `0%`; // Mete o returnRate como texto da div
							if (returnRateElement3.style.color != `rgb(255, 255, 255)`) returnRateElement3.style.color = `rgb(255, 255, 255)`; // Muda a cor da div para o gradiente
						}
					}
				}
			} else if (oddsDiv.children.length > 1) {
				// Obtenção da cor através de um gradiente
				valueColor = returnRate < maxOdds
					? getGradientOdds(returnRate, minOdds, maxOdds)
					: getGradientSuperOdds(returnRate, maxOdds - 0.5, maxSuperOdds - 0.5);

				if (!returnRateElement.classList.contains('return-rate')) {
					returnRateElement = document.createElement('div');
					returnRateElement.className = 'return-rate bwin-button'
					returnRateElement.id = uniqueId; // Coloca o uniqueId na returnRateDiv
					returnRateElement.textContent = divText; // Mete o returnRate como texto da div
					returnRateElement.style.color = valueColor; // Muda a cor da div para o gradiente
					participantsElement.nextElementSibling.insertAdjacentElement('afterend', returnRateElement);
				}
				// Verifica se o returnRateElement já foi criado e existe, e dá update
				if (returnRateElement.classList.contains('return-rate')) {
					//alert(divText)
					if (returnRateElement.textContent !== divText) {
						returnRateElement.textContent = divText
					}
					if (returnRateElement.style.color !== valueColor) {
						returnRateElement.style.color = valueColor
					}
					returnRateElement.id = uniqueId; // Coloca o uniqueId na returnRateDiv
				}
			}
			break
		case "ESC":
			valueColor = returnRate < (maxOdds - 1)
				? getGradientOdds(returnRate, minOdds, maxOdds - 1)
				: getGradientSuperOdds(returnRate, maxOdds - 1.5, maxSuperOdds - 1.5);

			if (!returnRateElement.classList.contains('return-rate')) {
				returnRateElement = document.createElement('div');
				returnRateElement.className = 'return-rate esc-button'
				participantsElement.insertAdjacentElement('afterend', returnRateElement);
			}
			if (returnRateElement.classList.contains("return-rate")) {
				if (returnRateElement.textContent !== divText) {
					returnRateElement.textContent = divText; // Caso o returRate mude, muda o texto
					returnRateElement.style.color = valueColor; // Caso o returRate mude, muda a cor
				}
				returnRateElement.id = uniqueId // Atualiza o uniqueId da returnRateDiv, quando muda as odds/jogo
			}
		default:
			break;
	}
}

// Lida com odds e manipula a criação/atualização da div
// Chama a função updateOrCreateDiv, adicionando aos argumentos o returnRate e o uniqueId
function handleOdds(casino, view, participantsElement, oddsDiv, returnRateElement) {
	let oddsChildren, oddsData, returnRate
	switch (casino) {
		case "Betano":
			oddsChildren = oddsDiv.children; // As divs do oddsDiv, ou seja, cada div com uma odd
			oddsData = processOdds(casino, oddsDiv, returnRateElement); // Função que dada uma oddsDiv, a processa e devolve o valor da odd dentro dela
			if (!oddsData) return;
			const { odds: extractedOdds1, solution: extractedSolution1 } = oddsData; // extractedOdds: as odds do jogo; extractedSolution: a divisão das freebets do jogo
			returnRate = Math.round((extractedSolution1.x * extractedOdds1.odd1).toFixed(4) * 10000) / 100; // Return rate do jogo
			// Um uniqueId, que identifica unicamente cada jogo (usado mais tarde para ver alterações nas odds)
			// custom-return-rate-${nome das equipas}-${odd1}-${odd2}-${odd3}
			uniqueId = `custom-return-rate-${participantsElement.children[0].textContent}-${oddsChildren[0].textContent}-${oddsChildren[1].textContent}-${oddsChildren[2]?.textContent}`;
			break;
		case "Betclic":
			oddsChildren = oddsDiv.children; // As divs do oddsDiv, ou seja, cada div com uma odd
			oddsData = processOdds(casino, oddsDiv, returnRateElement); // Função que dada uma oddsDiv, a processa e devolve o valor da odd dentro dela
			if (!oddsData) return;
			const { odds: extractedOdds2, solution: extractedSolution2 } = oddsData; // extractedOdds: as odds do jogo; extractedSolution: a divisão das freebets do jogo
			returnRate = Math.round((extractedSolution2.x * extractedOdds2.odd1).toFixed(4) * 10000) / 100; // Return rate do jogo
			// Um uniqueId, que identifica unicamente cada jogo (não vê alterações nas odds)
			// custom-return-rate-${nome das equipas}
			uniqueId = `custom-return-rate-${participantsElement.children[1].children[0].textContent}`;
			break;
		case "Bwin":
			oddsChildren = oddsDiv.children; // As divs do oddsDiv, ou seja, cada div com uma odd
			oddsData = processOdds(casino, oddsDiv, returnRateElement); // Função que dada uma oddsDiv, a processa e devolve o valor da odd dentro dela
			let newOddsDiv = oddsDiv.parentElement.querySelector('.grid-six-pack-wrapper')
			if (newOddsDiv) {
				if (!oddsData) returnRate = 0;
				else {
					const { odds: extractedOdds2, solution: extractedSolution2 } = oddsData; // extractedOdds: as odds do jogo; extractedSolution: a divisão das freebets do jogo
					returnRate = Math.round((extractedSolution2.x * extractedOdds2.odd1).toFixed(4) * 10000) / 100; // Return rate do jogo
				}
			}
			else {
				if (!oddsData) return;
				else {
					const { odds: extractedOdds2, solution: extractedSolution2 } = oddsData; // extractedOdds: as odds do jogo; extractedSolution: a divisão das freebets do jogo
					returnRate = Math.round((extractedSolution2.x * extractedOdds2.odd1).toFixed(4) * 10000) / 100; // Return rate do jogo
				}
			}
			// Um uniqueId, que identifica unicamente cada jogo (não vê alterações nas odds)
			// custom-return-rate-${nome das equipas}
			uniqueId = `custom-return-rate-${participantsElement.children[0].children[0].textContent}`;
			break
		case "ESC":
			oddsChildren = oddsDiv.children; // As divs do oddsDiv, ou seja, cada div com uma odd
			oddsData = processOdds(casino, oddsDiv, returnRateElement); // Função que dada uma oddsDiv, a processa e devolve o valor da odd dentro dela
			if (!oddsData) return;
			const { odds: extractedOdds3, solution: extractedSolution3 } = oddsData; // extractedOdds: as odds do jogo; extractedSolution: a divisão das freebets do jogo
			returnRate = Math.round((extractedSolution3.x * extractedOdds3.odd1).toFixed(4) * 10000) / 100; // Return rate do jogo
			// Um uniqueId, que identifica unicamente cada jogo (não vê alterações nas odds)
			// custom-return-rate-${nome das equipas}
			uniqueId = `custom-return-rate-${participantsElement.children[0].children[1].textContent}`;
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

			oddsDiv = view.querySelector('.market').children[0];
			if (oddsDiv != undefined) oddsDiv = oddsDiv.children[0]
			// Caso a div das odds não tenha odds (ex: "Aposta já")
			if (!oddsDiv) {
				removeDivIfExists(participantsDiv.nextElementSibling);
				return;
			}
			// Aqui não criamos container (não é preciso)
			let betclicReturnRateDiv = participantsDiv.nextElementSibling; // Variável que vai verificar se é mesmo uma returnRateDiv ou não

			handleOdds(casino, view, participantsDiv, oddsDiv, betclicReturnRateDiv);
			break
		case "Bwin":
			participantsDiv = view.querySelector('.grid-info-wrapper');
			if (!participantsDiv) return;

			oddsDiv = view.querySelector('.grid-group-container').children[0];
			if (!oddsDiv) return;

			// Aqui não criamos container (não é preciso)
			let bwinReturnRateDiv = participantsDiv.nextElementSibling.nextElementSibling; // Variável que vai verificar se é mesmo uma returnRateDiv ou não

			handleOdds(casino, view, participantsDiv, oddsDiv, bwinReturnRateDiv);
			break
		case "ESC":
			participantsDiv = view.querySelector('.cGoDbJ');
			if (!participantsDiv) return;

			oddsDiv = view.querySelector('.dyakaX')?.children[0]?.children[0];
			if (!oddsDiv != undefined) view.querySelector('.hPbsvT')?.children[0]?.children[0];
			if (!oddsDiv) return;

			// Aqui não criamos container (não é preciso)
			let escReturnRateDiv = participantsDiv.nextElementSibling; // Variável que vai verificar se é mesmo uma returnRateDiv ou não

			handleOdds(casino, view, participantsDiv, oddsDiv, escReturnRateDiv);
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
			const vueBetanoWrappers = document.querySelectorAll('.vue-recycle-scroller__item-wrapper');
			vueBetanoWrappers.forEach(wrapper => {
				const views = wrapper.querySelectorAll('.vue-recycle-scroller__item-view');
				views.forEach(view => {
					handleSelector("Betano", view);
				});
			});
			// Apostas ao vivo/pré-jogo
			const normalBetanoWrappers = document.querySelectorAll('.events-list__wrapper');
			normalBetanoWrappers.forEach(wrapper => {
				const views = wrapper.querySelectorAll('div[data-evtid]');
				views.forEach(view => {
					handleSelector("Betano", view);
				});
			});
			break;
		case "www.betclic.pt":
			// Betclic
			// Apostas ao vivo
			const normalBetclicWrappers = document.querySelectorAll('.groupEvents_content');
			normalBetclicWrappers.forEach(wrapper => {
				const views = wrapper.querySelectorAll('.cardEvent_content');
				views.forEach(view => {
					handleSelector("Betclic", view);
				});
			});
			// Apostas pré-jogo
			const normalBetclicWrappers2 = document.querySelectorAll('.verticalScroller_list');
			normalBetclicWrappers2.forEach(wrapper => {
				const views = wrapper.querySelectorAll('.cardEvent_content');
				views.forEach(view => {
					handleSelector("Betclic", view);
				});
			});
		case "sports.bwin.pt":
			// Bwin
			// Apostas pré-jogo
			const normalBwinWrappers = document.querySelectorAll('.event-group');
			normalBwinWrappers.forEach(wrapper => {
				const views = wrapper.querySelectorAll('.grid-event-wrapper');
				views.forEach(view => {
					handleSelector("Bwin", view);
				});
			});
		case "www.estorilsolcasinos.pt":
			// Bwin
			// Apostas pré-jogo
			const normalESCWrappers = document.querySelectorAll('.cNsbVj');
			normalESCWrappers.forEach(wrapper => {
				const views = wrapper.querySelectorAll('.gEfGAy');
				views.forEach(view => {
					handleSelector("ESC", view);
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
	// Aplica a lógica inicialmente
	handleRecycleChanges()
	observerCreate() // Observa mudanças no DOM reciclável
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