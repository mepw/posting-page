export type WhereValuesType = (string | number | number[] | number[][])[];

export type QueryParams = { [key: string]: number | number[]} ;

export type QueryConditionTypes = '=' | 'IN' | 'NOT IN' | 'OR';

export type GeneratedQueryResult = { where_params: string; where_values: WhereValuesType };

export type SingleInsertValue = (string | number | null | Date)[];

export type MultipleInsertValue = SingleInsertValue[];

