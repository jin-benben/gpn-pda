import request, { CustomRequestConfig } from "./request";

export type Prefix =
  | "jms"
  | "mdm"
  | "mdm2"
  | "mdm3"
  | "crm"
  | "cts"
  | "oa"
  | "jms-auth"
  | "wms"
  | "fms"
  | "oms"
  | "prs"
  | "ass"
  | "search"
  | "aa1"
  | "mpc"
  | "aa3"
  | "vc"
  | "lms"
  | "aa6"
  | "aa5"
  | "aa2"
  | "prs2"
  | "smp"
  | "aa7"
  | "pms"
  | "capi"
  | "tms";

interface CommonServiceParams<T> {
  functionCode: string;
  url?: string;
  data?: T;
  prefix: Prefix;
}

export const getPrefix = (prefix: Prefix) => {
  switch (prefix) {
    case "oms":
      return "oms-first";
    case "fms":
      return "fms-first";
    case "oa":
      return "oa-first";
    case "search":
      return "search-first";
    case "cts":
      return "cts";
    case "jms":
      return "jms-first";
    case "jms-auth":
      return "jms-auth";
    case "mdm":
      return "mdm-first";
    case "mdm2":
      return "mdm-second";
    case "mdm3":
      return "mdm-third";
    case "prs":
      return "prs";
    case "ass":
      return "ass-first";
    case "crm":
      return "crm01";
    case "vc":
      return "vc";
    case "aa1":
      return "aa01";
    case "aa2":
      return "aa2";
    case "aa3":
      return "aa3";
    case "aa5":
      return "aa5";
    case "aa6":
      return "aa6";
    case "aa7":
      return "aa7";
    case "mpc":
      return "mpc-first";
    case "lms":
      return "lms-first";
    case "pms":
      return "pms-first";
    case "prs2":
      return "prs-second";
    case "smp":
      return "smp-first";
    case "wms":
      return "wms-first";
    case "tms":
      return "tms-first";
    case "capi":
      return "capi";
    default:
      break;
  }
};

const jointUrl = (functionCode: string, prefix: Prefix) => {
  return `/${getPrefix(prefix)}/${functionCode}`;
};

export interface ListResponse<R> {
  customerId?: any;
  id?: any;
  docId?: any;
  page: number;
  totalPage: number;
  totalRow: number;
  size: number;
  rows: R[];
}

export function queryListFetch<T, R>({
  functionCode,
  data,
  prefix,
}: CommonServiceParams<T>) {
  return request.post<any, ListResponse<R>>(
    `${jointUrl(functionCode, prefix)}/selectList`,
    { data }
  );
}

export function queryOneFetch<T, R>(
  { functionCode, data, prefix }: CommonServiceParams<T>,
  config?: CustomRequestConfig
) {
  return request.post<any, R>(
    `${jointUrl(functionCode, prefix)}/selectOne`,
    { data },
    config
  );
}

export function addItemFetch<T>({
  functionCode,
  data,
  prefix,
}: CommonServiceParams<T>) {
  return request.post<any, any>(`${jointUrl(functionCode, prefix)}/add`, {
    data,
  });
}

export function updateItemFetch<T>({
  functionCode,
  data,
  prefix,
}: CommonServiceParams<T>) {
  return request.post(`${jointUrl(functionCode, prefix)}/update`, { data });
}

export function deleteItemFetch<T>({
  functionCode,
  data,
  prefix,
}: CommonServiceParams<T>) {
  return request.post(`${jointUrl(functionCode, prefix)}/delete`, { data });
}

export function commonRequestFetch<T, R>(
  { functionCode, data, url, prefix }: CommonServiceParams<T>,
  config?: CustomRequestConfig
) {
  return request.post<any, R>(
    `${jointUrl(functionCode, prefix)}${url}`,
    { data },
    config
  );
}
