export const removeOneFromArray = (arr: Array<any>, element: any) => {
    const index = arr.indexOf(element);
    if (index !== -1) arr.splice(index, 1);
    return arr;
};
