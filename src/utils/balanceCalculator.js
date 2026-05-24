/**
 * Utility to calculate group balances and simplify debts.
 * Employs a greedy algorithm to minimize transactions between members.
 */
export const calculateBalances = (members = [], expenses = []) => {
  const netBalances = {};
  const memberMap = {};

  // Initialize members mapping and balance tables
  if (Array.isArray(members)) {
    members.forEach(member => {
      if (!member || !member.email) return;
      const emailKey = member.email.toLowerCase();
      netBalances[emailKey] = 0;
      memberMap[emailKey] = member;
    });
  }

  // Calculate net balances based on expenses and settlements
  if (Array.isArray(expenses)) {
    expenses.forEach(exp => {
      if (!exp || !exp.paidBy) return;
      const amount = parseFloat(exp.amount) || 0;
      const paidBy = exp.paidBy.toLowerCase();

      if (exp.isSettlement) {
        const receiver = exp.settlementReceiver ? exp.settlementReceiver.toLowerCase() : "";
        if (!receiver) return;

        // Settlement: paidBy (sender) paid receiver.
        // Payer is credited (reduces debt / increases credit)
        if (netBalances[paidBy] !== undefined) {
          netBalances[paidBy] += amount;
        }
        // Receiver is debited (reduces credit / increases debt)
        if (netBalances[receiver] !== undefined) {
          netBalances[receiver] -= amount;
        }
      } else {
        // Normal Expense
        const splitType = exp.splitType || "equal";

        // Credit the payer
        if (netBalances[paidBy] !== undefined) {
          netBalances[paidBy] += amount;
        }

        if (splitType === "custom" && exp.splitDetails) {
          // Custom Split
          Object.entries(exp.splitDetails).forEach(([email, customAmount]) => {
            if (!email) return;
            const emailKey = email.toLowerCase();
            const customShare = parseFloat(customAmount) || 0;
            if (netBalances[emailKey] !== undefined) {
              netBalances[emailKey] -= customShare;
            }
          });
        } else {
          // Equal Split (default)
          const splitAmong = exp.splitAmong || [];
          if (splitAmong.length === 0) return;

          const splitShare = amount / splitAmong.length;

          // Debit all split participants
          splitAmong.forEach(email => {
            if (!email) return;
            const emailKey = email.toLowerCase();
            if (netBalances[emailKey] !== undefined) {
              netBalances[emailKey] -= splitShare;
            }
          });
        }
      }
    });
  }

  // Partition members into debtors (< 0) and creditors (> 0)
  const creditors = [];
  const debtors = [];

  Object.keys(netBalances).forEach(email => {
    const balance = netBalances[email];
    if (balance > 0.01) {
      creditors.push({ email, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ email, amount: -balance }); // Keep absolute value for ease
    }
  });

  // Sort creditors descending, debtors descending
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplifiedDebts = [];
  let cIdx = 0;
  let dIdx = 0;

  // Make working copies to update in loop
  const activeCreditors = creditors.map(c => ({ ...c }));
  const activeDebtors = debtors.map(d => ({ ...d }));

  while (cIdx < activeCreditors.length && dIdx < activeDebtors.length) {
    const debtor = activeDebtors[dIdx];
    const creditor = activeCreditors[cIdx];

    const amountSettled = Math.min(debtor.amount, creditor.amount);

    if (amountSettled > 0.01) {
      simplifiedDebts.push({
        from: debtor.email,
        fromName: memberMap[debtor.email]?.name || debtor.email.split("@")[0],
        to: creditor.email,
        toName: memberMap[creditor.email]?.name || creditor.email.split("@")[0],
        amount: Math.round(amountSettled * 100) / 100
      });
    }

    debtor.amount -= amountSettled;
    creditor.amount -= amountSettled;

    if (debtor.amount <= 0.01) {
      dIdx++;
    }
    if (creditor.amount <= 0.01) {
      cIdx++;
    }
  }

  return {
    netBalances,
    simplifiedDebts
  };
};
