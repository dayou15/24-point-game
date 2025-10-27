const suits = ['H', 'D', 'C', 'S'];
const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const ops = ['+', '-', '*', '/'];

let cards = [];
let originalValues = [];
let selectedCardA = null;
let selectedOperator = null;
let history = [];

function generateSolvableCards() {
  function helper(a, b, op) {
    return `(${a}${op}${b})`;
  }

  function evaluate(expr) {
    try {
      return Math.abs(eval(expr) - 24) < 1e-6;
    } catch {
      return false;
    }
  }

  function permutations(arr) {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = permutations(arr.slice(0, i).concat(arr.slice(i + 1)));
      for (let r of rest) result.push([arr[i]].concat(r));
    }
    return result;
  }

  function hasSolution(nums) {
    const numPerms = permutations(nums);
    for (let n of numPerms) {
      for (let o1 of ops) {
        for (let o2 of ops) {
          for (let o3 of ops) {
            const exprs = [
              helper(helper(helper(n[0], n[1], o1), n[2], o2), n[3], o3),
              helper(helper(n[0], helper(n[1], n[2], o2), o1), n[3], o3),
              helper(n[0], helper(helper(n[1], n[2], o2), n[3], o3), o1),
              helper(n[0], helper(n[1], helper(n[2], n[3], o3), o2), o1),
              helper(helper(n[0], n[1], o1), helper(n[2], n[3], o3), o2)
            ];
            for (let expr of exprs) {
              if (evaluate(expr)) return true;
            }
          }
        }
      }
    }
    return false;
  }

  let values;
  do {
    values = [];
    for (let i = 0; i < 4; i++) {
      values.push(ranks[Math.floor(Math.random() * ranks.length)]);
    }
  } while (!hasSolution(values));

  originalValues = [...values];
  cards = values.map(v => ({
    rank: v,
    suit: suits[Math.floor(Math.random() * suits.length)]
  }));

  updateCards();
}

function selectCard(index) {
  const card = cards[index];
  if (card.rank === null) return;

  if (selectedCardA === null) {
    selectedCardA = index;
    highlightCard(index);
  } else if (selectedOperator !== null && index !== selectedCardA) {
    history.push(JSON.parse(JSON.stringify(cards)));

    const i1 = selectedCardA;
    const i2 = index;
    const v1 = cards[i1].rank;
    const v2 = cards[i2].rank;
    const op = selectedOperator;

    let result, displayValue;
    try {
      if (op === '/' && v1 % v2 !== 0) {
        displayValue = `${v1}/${v2}`;
        result = v1 / v2;
      } else {
        result = eval(`${v1}${op}${v2}`);
        displayValue = result.toString();
      }
    } catch {
      result = NaN;
      displayValue = '?';
    }

    logStep(`${v1} ${op} ${v2} = ${displayValue}`);

    cards[i1] = { rank: result, suit: 'X', display: displayValue };
    cards[i2] = { rank: null, suit: null };

    selectedCardA = null;
    selectedOperator = null;
    updateCards();

    const remaining = cards.filter(c => c.rank !== null);
    if (remaining.length === 1) {
      if (Math.abs(remaining[0].rank - 24) < 1e-6) {
        logStep('🎉你算出来了 24点! 好棒的由由!');
      } else {
        logStep(`❌ 最后结果是 ${remaining[0].display || remaining[0].rank}, 不是 24.`);
      }
    }
  }
}

function highlightCard(index) {
  const cards = document.querySelectorAll('.card');
  cards[index].style.border = '2px solid red';
}

document.querySelectorAll('.op').forEach(btn => {
  btn.onclick = () => {
    if (selectedCardA !== null) {
      selectedOperator = btn.getAttribute('data-op');
      logStep(`选定的运算符: ${selectedOperator}`);
    }
  };
});

function updateCards() {
  const container = document.getElementById('card-container');
  container.innerHTML = '';
  cards.forEach((card, i) => {
    const div = document.createElement('div');
    div.className = 'card';

    if (card.rank !== null) {
      if (card.suit === 'X') {
        div.textContent = card.display || card.rank;
        div.style.backgroundColor = '#f0f0f0';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.fontSize = '24px';
      } else {
        div.style.backgroundImage = `url('img/${card.rank}${card.suit}.png')`;
      }
      div.onclick = () => selectCard(i);
    } else {
      div.style.backgroundColor = '#eee';
    }

    container.appendChild(div);
  });
}

function logStep(text) {
  const steps = document.getElementById('steps');
  const p = document.createElement('p');
  p.textContent = text;
  steps.appendChild(p);
}

function undoStep() {
  if (history.length > 0) {
    cards = history.pop();
    selectedCardA = null;
    selectedOperator = null;

    const steps = document.getElementById('steps');
    if (steps.lastChild) steps.removeChild(steps.lastChild);

    updateCards();
  }
}

function resetGame() {
  document.getElementById('steps').innerHTML = '';
  selectedCardA = null;
  selectedOperator = null;
  history = [];
  generateSolvableCards();
}

function showSolution() {
  const nums = [...originalValues];

  function helper(a, b, op) {
    return `(${a}${op}${b})`;
  }

  function evaluate(expr) {
    try {
      return Math.abs(eval(expr) - 24) < 1e-6;
    } catch {
      return false;
    }
  }

  function permutations(arr) {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = permutations(arr.slice(0, i).concat(arr.slice(i + 1)));
      for (let r of rest) result.push([arr[i]].concat(r));
    }
    return result;
  }

  const numPerms = permutations(nums);
  for (let n of numPerms) {
    for (let o1 of ops) {
      for (let o2 of ops) {
        for (let o3 of ops) {
          const exprs = [
            helper(helper(helper(n[0], n[1], o1), n[2], o2), n[3], o3),
            helper(helper(n[0], helper(n[1], n[2], o2), o1), n[3], o3),
            helper(n[0], helper(helper(n[1], n[2], o2), n[3], o3), o1),
            helper(n[0], helper(n[1], helper(n[2], n[3], o3), o2), o1),
            helper(helper(n[0], n[1], o1), helper(n[2], n[3], o3), o2)
          ];
          for (let expr of exprs) {
            if (evaluate(expr)) {
              logStep(`🧠 Solution: ${expr} = 24`);
              return;
            }
          }
        }
      }
    }
  }

  logStep('❌ No solution found.');
}

function showHint() {
  const nums = [...originalValues];

  function helper(a, b, op) {
    return `(${a}${op}${b})`;
  }

  function evaluate(expr) {
    try {
      return Math.abs(eval(expr) - 24) < 1e-6;
    } catch {
      return false;
    }
  }

  function permutations(arr) {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = permutations(arr.slice(0, i).concat(arr.slice(i + 1)));
      for (let r of rest) result.push([arr[i]].concat(r));
    }
    return result;
  }

  const numPerms = permutations(nums);
  for (let n of numPerms) {
    for (let o1 of ops) {
      for (let o2 of ops) {
        for (let o3 of ops) {
          const exprs = [
            helper(helper(helper(n[0], n[1], o1), n[2], o2), n[3], o3),
            helper(helper(n[0], helper(n[1], n[2], o2), o1), n[3], o3),
            helper(n[0], helper(helper(n[1], n[2], o2), n[3], o3), o1),
            helper(n[0], helper(n[1], helper(n[2], n[3], o3), o2), o1),
            helper(helper(n[0], n[1], o1), helper(n[2], n[3], o3), o2)
          ];
          for (let expr of exprs) {
            if (evaluate(expr)) {
              const match = expr.match(/\((\d+)\s*([\+\-\*\/])\s*(\d+)\)/);
              if (match) {
                const hint = `${match[1]} ${match[2]} ${match[3]}`;
                logStep(`💡 提示第一步：${hint}`);
              } else {
                logStep(`💡 提示第一步：${expr}`);
              }
              return;
            }
          }
        }
      }
    }
  }

  logStep('❌ 没有找到提示。');
}

generateSolvableCards();
