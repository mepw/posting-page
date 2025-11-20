import { MultipleInsertValue, SingleInsertValue, WhereValuesType } from "../types/query.type"

export interface ModelParametersInterface  {
    cte?: string;
    fields_to_select: string;
    join_statement?: string;
    where_params?: string;
    where_values?: WhereValuesType;
    group_by?: string;
    order_by?: string;
    limit?: number;
    offset?: number;
    derived_query?: string;
}

export interface ModelInsertParametersInterface {
    insert_columns: string;
    insert_values: SingleInsertValue | MultipleInsertValue;
}

export interface ModelUpdateParametersInterface {
    update_columns: string[];
    update_values: (string | number | boolean | number[])[];
    where_params: string;
    where_values: WhereValuesType;
}

export interface SelectQueryInterface{  
    cte?: string;
    fields_to_select?: string;
    join_statement?: string;
    where_params?: string;
    where_values?: WhereValuesType;
    group_by?: string;
    order_by?: string;
    limit?: number;
    offset?: number;
    derived_query?: string;
}