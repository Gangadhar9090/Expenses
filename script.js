const form = document.getElementById('calc-form');
const fatInput = document.getElementById('fat');
const snfInput = document.getElementById('snf');
const qtyInput = document.getElementById('qty');
const fatRateInput = document.getElementById('fat-rate');
const snfRateInput = document.getElementById('snf-rate');
const baseRateInput = document.getElementById('base-rate');
const errorEl = document.getElementById('error');
const resultEl = document.getElementById('result');
const chartEl = document.getElementById('rate-chart');

const fatValues = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7];
const snfValues = [7.5, 8, 8.5, 9, 9.5, 10];

function getRatePerLiter(fat, snf, fatRate, snfRate, baseRate) {
  return baseRate + fat * fatRate + snf * snfRate;
}

function nearest(values, target) {
  return values.reduce((best, current) =>
    Math.abs(current - target) < Math.abs(best - target) ? current : best,
  values[0]);
}

function getInputs() {
  return {
    fat: Number(fatInput.value),
    snf: Number(snfInput.value),
    qty: Number(qtyInput.value),
    fatRate: Number(fatRateInput.value),
    snfRate: Number(snfRateInput.value),
    baseRate: Number(baseRateInput.value),
  };
}

function validateInputs({ fat, snf, qty, fatRate, snfRate, baseRate }) {
  if ([fat, snf, qty, fatRate, snfRate, baseRate].some((n) => Number.isNaN(n))) {
    return 'Please enter valid numeric values in all fields.';
  }
  if (fat < 0 || snf < 0 || qty < 0 || fatRate < 0 || snfRate < 0) {
    return 'Fat, SNF, quantity, and rates must be zero or greater.';
  }
  if (fat > 12 || snf > 15) {
    return 'Fat or SNF value is unusually high. Please verify your sample values.';
  }
  return '';
}

function renderChart(fat, snf, fatRate, snfRate, baseRate) {
  const closestFat = nearest(fatValues, fat);
  const closestSnf = nearest(snfValues, snf);

  const header = `<tr><th>Fat \\ SNF</th>${snfValues
    .map((v) => `<th>${v.toFixed(1)}%</th>`)
    .join('')}</tr>`;

  const rows = fatValues
    .map((fatRow) => {
      const cells = snfValues
        .map((snfCol) => {
          const rate = getRatePerLiter(fatRow, snfCol, fatRate, snfRate, baseRate);
          const highlight = fatRow === closestFat && snfCol === closestSnf ? 'highlight' : '';
          return `<td class="${highlight}">₹${rate.toFixed(2)}</td>`;
        })
        .join('');
      return `<tr><th>${fatRow.toFixed(1)}%</th>${cells}</tr>`;
    })
    .join('');

  chartEl.innerHTML = header + rows;
}

function calculateAndRender() {
  const values = getInputs();
  const error = validateInputs(values);

  if (error) {
    errorEl.style.display = 'block';
    errorEl.textContent = error;
    resultEl.textContent = '';
    renderChart(values.fat || 0, values.snf || 0, values.fatRate || 0, values.snfRate || 0, values.baseRate || 0);
    return;
  }

  errorEl.style.display = 'none';
  errorEl.textContent = '';

  const fatAmount = values.fat * values.fatRate;
  const snfAmount = values.snf * values.snfRate;
  const ratePerLiter = getRatePerLiter(values.fat, values.snf, values.fatRate, values.snfRate, values.baseRate);
  const totalAmount = ratePerLiter * values.qty;

  resultEl.innerHTML = [
    `Rate/Liter: ₹${ratePerLiter.toFixed(2)}`,
    `Total Amount: ₹${totalAmount.toFixed(2)}`,
    `Breakdown: Base ₹${values.baseRate.toFixed(2)} + Fat ₹${fatAmount.toFixed(2)} + SNF ₹${snfAmount.toFixed(2)}`,
  ].join('<br>');

  renderChart(values.fat, values.snf, values.fatRate, values.snfRate, values.baseRate);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  calculateAndRender();
});

[fatInput, snfInput, qtyInput, fatRateInput, snfRateInput, baseRateInput].forEach((input) => {
  input.addEventListener('input', calculateAndRender);
});

calculateAndRender();
