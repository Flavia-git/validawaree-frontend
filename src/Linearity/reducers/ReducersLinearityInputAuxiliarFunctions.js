// Auxiliar Linearity Input Functions
export const addRow = (columns, analyticalData, concentrations) => {
  concentrations.push(new Array(columns).fill(undefined));
  analyticalData.push(new Array(columns).fill(undefined));
  return { analyticalData, concentrations };
};

export const addColumn = (rows, columns, analyticalData) => {
  for (let i = 0; i < rows; ++i) {
    analyticalData[i].splice(columns, undefined, undefined);
  }
  return analyticalData;
};

export const removeRow = (
  removedAnalyticalData,
  removedConcentrationData,
  removedDilutionFactorValue,
  removedAverages,
  removedStdDeviations
) => {
  removedAnalyticalData.splice(-1);
  removedConcentrationData.splice(-1);
  removedDilutionFactorValue.splice(-1);
  removedAverages.splice(-1);
  removedStdDeviations.splice(-1);
  console.log(removedAnalyticalData);
  console.log(removedConcentrationData);
  return {
    removedAnalyticalData,
    removedConcentrationData,
    removedDilutionFactorValue,
    removedAverages,
    removedStdDeviations,
  };
};

export const removeColumn = (
  rows,
  removedAnalyticalData,
  removedConcentration,
  removedMass,
  removedInitialConcentration
) => {
  for (let i = 0; i < rows; ++i) {
    removedAnalyticalData[i].splice(-1);
    removedConcentration[i].splice(-1);
  }
  removedMass.splice(-1);
  removedInitialConcentration.splice(-1);
  return {
    removedAnalyticalData,
    removedConcentration,
    removedMass,
    removedInitialConcentration,
  };
};

export const updateVolumeValue = (action, state) => {
  let volume = state.volume;
  if (typeof action.updatedVolumeValue === 'string') {
    volume = parseFloat(action.updatedVolumeValue.replace(',', '.'));
  } else if (
    typeof action.updatedVolumeValue === 'number' &&
    action.updatedVolumeValue > 0
  ) {
    volume = parseFloat(action.updatedVolumeValue);
  } else {
    throw new Error('Volume value not accepted!');
  }

  let initialConcentrations = [...state.mass].map(function (value) {
    return value / volume;
  });

  let concentrations = [...state.concentrations];

  for (let i = 0; i < state.dilutionFactor.length; ++i) {
    for (let j = 0; j < initialConcentrations.length; ++j) {
      concentrations[i][j] =
        parseFloat(initialConcentrations[j]) /
        parseFloat(state.dilutionFactor[i]);
    }
  }

  return {
    volume: volume,
    initialConcentrations: initialConcentrations,
    concentrations: concentrations,
  };
};

export const updateMassValue = (action, state) => {
  let mass = [...state.mass];
  if (typeof action.updatedMassValue === 'string') {
    mass[action.column] = parseFloat(action.updatedMassValue.replace(',', '.'));
  } else if (
    typeof action.updatedMassValue === 'number' &&
    action.updatedMassValue > 0
  ) {
    mass[action.column] = parseFloat(action.updatedMassValue);
  } else {
    throw new Error('Mass value not accepted!');
  }

  let initialConcentrations = [...state.initialConcentrations];
  initialConcentrations[action.column] =
    parseFloat(action.updatedMassValue) / parseFloat(state.volume);

  let concentrations = [...state.concentrations];

  for (let i = 0; i < state.dilutionFactor.length; ++i) {
    concentrations[i][action.column] =
      parseFloat(action.updatedMassValue / parseFloat(state.volume)) /
      parseFloat(state.dilutionFactor[i]);
  }
  return {
    mass: mass,
    initialConcentrations: initialConcentrations,
    concentrations: concentrations,
  };
};

export const updateAnalyticalAverage = (analyticalData) => {
  let sum = analyticalData.reduce(
    (cumulative, currentValue) => cumulative + currentValue,
    0
  );
  let average = sum / analyticalData.length || 0;
  return average;
};

export const updateStandardDeviation = (analyticalData) => {
  let average = updateAnalyticalAverage(analyticalData);
  let stdDeviation = Math.sqrt(
    analyticalData
      .map((x) => Math.pow(x - average, 2))
      .reduce((a, b) => a + b) /
      (analyticalData.length - 1)
  );
  return { updatedAverage: average, updatedStdDeviation: stdDeviation };
};

// https://dev.to/sagar/three-dots---in-javascript-26ci
export const updateValues = (action, state) => {
  let analyticalData = [...state.analyticalData];
  if (typeof action.updatedValue == 'string') {
    analyticalData[action.row][action.column] = parseFloat(
      action.updatedValue.replace(',', '.')
    );
  } else if (
    typeof action.updatedValue == 'number' &&
    action.updatedValue >= 0
  ) {
    analyticalData[action.row][action.column] = action.updatedValue;
  } else {
    throw new Error('Analytical value not valid!');
  }

  let averages = [...state.averages];
  let stdDeviations = [...state.stdDeviations];
  if (
    analyticalData[action.row] -
      analyticalData[action.row].filter((element) => element === undefined)
        .length >=
    3
  ) {
    let newValues = updateStandardDeviation(analyticalData[action.row]);
    averages[action.row] = newValues.updatedAverage;
    stdDeviations[action.row] = newValues.updatedStdDeviation;

    return {
      analyticalData: analyticalData,
      averages: averages,
      stdDeviations: stdDeviations,
    };
  } else if (
    analyticalData[action.row] -
      analyticalData[action.row].filter((element) => element === undefined)
        .length >=
    2
  ) {
    averages[action.row] = updateAnalyticalAverage(analyticalData[action.row]);
    return {
      averages: averages,
      stdDeviations: stdDeviations,
      analyticalData: analyticalData,
    };
  } else {
    return {
      averages: averages,
      stdDeviations: stdDeviations,
      analyticalData: analyticalData,
    };
  }
};

export const updateDilutionFactorValue = (action, state) => {
  let dilutionFactor = [...state.dilutionFactor];
  if (typeof action.updatedValue === 'string') {
    dilutionFactor[action.row] = action.updatedValue.replace(',', '.');
  } else if (
    typeof action.updatedValue == 'number' &&
    action.updatedValue >= 0
  ) {
    dilutionFactor[action.row] = action.updatedValue;
  } else {
    throw new Error('Dilution factor value not valid!');
  }

  let concentrations = [...state.concentrations];
  concentrations[action.row] = [...state.initialConcentrations].map(function (
    value
  ) {
    if (typeof value === 'number') {
      return value / dilutionFactor[action.row];
    } else {
      return undefined;
    }
  });
  return { dilutionFactor: dilutionFactor, concentrations: concentrations };
};
