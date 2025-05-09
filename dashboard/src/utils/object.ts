export const safeObjectValues = (obj = {}): Array<any> => Object.values({ ...obj });

export const safeObjectKeys = (obj = {}): Array<any> => Object.keys({ ...obj });

export const safeObjectEntries = (obj = {}): Array<any> => Object.entries({ ...obj });
