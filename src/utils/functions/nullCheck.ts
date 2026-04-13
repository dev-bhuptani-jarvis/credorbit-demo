export const IsNullOrUndefined = (s: any): boolean => {
    return s === null || s === undefined;
};

export const IsNullOrEmptyArray = (s: any[]): boolean => {
    return IsNullOrUndefined(s) || s.length === 0;
};

export const IsStringNullEmptyOrUndefined = (str: string): boolean => {
    return IsNullOrUndefined(str) || str === '';
};

export const IsEmptyObject = (obj: object): boolean => {
    return !Object.keys(obj).length;
};