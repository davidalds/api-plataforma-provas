const compareIfProvaDateIsBigger = (end_date, prova_timer) => {
  const actualDate = new Date();
  const [aY, aM, aD, aH, aMin] = [
    actualDate.getFullYear(),
    actualDate.getMonth(),
    actualDate.getDate(),
    actualDate.getHours(),
    actualDate.getMinutes(),
  ];

  const provaEndDate = new Date(end_date);
  const [pY, pM, pD, pH, pMin] = [
    provaEndDate.getFullYear(),
    provaEndDate.getMonth(),
    provaEndDate.getDate(),
    provaEndDate.getHours(),
    provaEndDate.getMinutes() + prova_timer, // adiciona o tempo de prova no datetime final
  ];

  // year or month bigger
  if (aY < pY || aM < pM) {
    return true;
  }

  // day bigger
  if (aY === pY && aM === pM && aD < pD) {
    return true;
  }

  // hour bigger
  if (aY === pY && aM === pM && aD === pD && aH < pH) {
    return true;
  }

  // minute bigger
  if (aY === pY && aM === pM && aD === pD && aH === pH && aMin <= pMin) {
    return true;
  }

  return false;
};

module.exports = compareIfProvaDateIsBigger;
