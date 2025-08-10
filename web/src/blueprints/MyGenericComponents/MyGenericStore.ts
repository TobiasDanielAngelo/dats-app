import { computed } from "mobx";
import {
  _async,
  _await,
  MaybeOptionalModelProp,
  model,
  Model,
  modelAction,
  ModelClass,
  modelFlow,
  ModelProps,
  prop,
} from "mobx-keystone";
import Swal from "sweetalert2";
import {
  PaginatedDetails,
  PaginatedResponse,
  PropsToInterface,
  Related,
} from "../../constants/interfaces";
import { defaultPageDetails } from "../../constants/constants";

export function autoFormData(body: Record<string, any>) {
  let needsFormData = false;
  const fileExtensionRegex = /\.(jpg|jpeg|png|gif|pdf|docx?|xlsx?|txt)$/i;

  for (const value of Object.values(body)) {
    if (value instanceof File || value instanceof Blob) {
      needsFormData = true;
      break;
    }
  }

  if (!needsFormData) {
    // strip keys with file-like strings even in JSON
    const filtered: Record<string, any> = {};
    for (const key in body) {
      if (
        !(typeof body[key] === "string" && fileExtensionRegex.test(body[key]))
      ) {
        filtered[key] = body[key];
      }
    }
    return filtered;
  }

  // Build FormData, skip existing file links
  const formData = new FormData();
  for (const key in body) {
    const value = body[key];
    if (typeof value === "string" && fileExtensionRegex.test(value)) {
      continue;
    }
    formData.append(key, value);
  }

  return formData;
}

export function getCookie(name: string): string {
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return "";
}

export const fetchCSRF = async (baseURL: string) => {
  return await guidedRequest(
    "csrf/",
    {
      method: "GET",
    },
    baseURL
  );
};

export async function guidedRequest<T>(
  endpoint: string,
  options: {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    body?: any;
    itemId?: number | string;
    params?: string;
  },
  baseURL: string,
  customURL?: string,
  hasNoCredentials?: boolean
): Promise<{
  details: any;
  ok: boolean;
  data: T | null;
}> {
  const input = new URLSearchParams(options.params);
  const filtered = new URLSearchParams();

  for (const [key, value] of input.entries()) {
    if (value.trim()) filtered.append(key, value);
  }

  let url = customURL ? `${customURL}/${endpoint}` : `${baseURL}/${endpoint}`;
  if (options.itemId) url += `${options.itemId}/`;
  if (options.params) url += `?${filtered.toString()}`;

  const preparedBody = options.body ? autoFormData(options.body) : undefined;
  const isFormData = preparedBody instanceof FormData;

  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "any",
    "X-CSRFToken": getCookie("csrftoken"),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method: options.method,
    credentials: hasNoCredentials ? undefined : "include",
    body: preparedBody
      ? isFormData
        ? preparedBody
        : JSON.stringify(preparedBody)
      : undefined,
    headers,
  });

  if (!response.ok) {
    const msg = await response.json();
    return { details: msg, ok: false, data: null };
  }

  try {
    if (options.method === "DELETE") {
      return { details: "", ok: true, data: null };
    }

    const json: T = await response.json();
    return { details: "", ok: true, data: json };
  } catch (error) {
    console.error("Parsing Error", error);
    return { details: "Parsing Error", ok: false, data: null };
  }
}

export async function fetchItemsRequest<T>(
  baseURL: string,
  endpoint: string,
  params?: string
): Promise<{
  details: any;
  ok: boolean;
  data: T[] | null;
  related: Related[] | null;
  optionFields: string[];
  relatedFields: string[];
  dateFields: string[];
  datetimeFields: string[];
  priceFields: string[];
  timeFields: string[];
  pageDetails?: Omit<PaginatedResponse<T>, "results">;
}> {
  const result = await guidedRequest<{
    results: T[];
    related: Related[];
    optionFields: string[];
    relatedFields: string[];
    dateFields: string[];
    datetimeFields: string[];
    priceFields: string[];
    timeFields: string[];
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    totalPages: number;
    ids: number[];
  }>(endpoint, { method: "GET", params: params }, baseURL);

  if (!result.ok || !result.data)
    return {
      ...result,
      related: null,
      data: null,
      relatedFields: [],
      optionFields: [],
      dateFields: [],
      datetimeFields: [],
      priceFields: [],
      timeFields: [],
    };

  const {
    results,
    related,
    optionFields,
    relatedFields,
    dateFields,
    datetimeFields,
    timeFields,
    priceFields,
    ...pageDetails
  } = result.data;

  return {
    details: "",
    ok: true,
    data: results,
    related: related,
    optionFields,
    relatedFields,
    dateFields,
    timeFields,
    datetimeFields,
    priceFields,
    pageDetails,
  };
}

export async function postItemRequest<T>(
  baseURL: string,
  endpoint: string,
  body?: T
) {
  return await guidedRequest<T>(
    endpoint,
    {
      method: "POST",
      body: body,
    },
    baseURL
  );
}

export async function updateItemRequest<T>(
  baseURL: string,
  endpoint: string,
  itemId: number | string,
  body: T
) {
  return await guidedRequest<T>(
    endpoint,
    {
      method: "PATCH",
      body: body,
      itemId: itemId,
    },
    baseURL
  );
}

export async function deleteItemRequest(
  baseURL: string,
  endpoint: string,
  itemId: number | string
) {
  return await guidedRequest(
    endpoint,
    {
      method: "DELETE",
      itemId: itemId,
    },
    baseURL
  );
}

export type LoginInterface = {
  username: string;
  password: string;
};

export type KeystoneModel<U> = {
  id: number | string | null;
  $view: Required<U>;
  displayName: string;
  update: (details: Partial<U>) => void;
};

export type NullableProps<T> = {
  [K in keyof T]: T[K] | null;
};

export function MyModel<TProps extends ModelProps, TView>(
  slug: string,
  props: TProps,
  derivedProps: (self: any) => TView = () => ({} as TView)
) {
  type GenericInterface = PropsToInterface<typeof props>;

  const Base = Model(props) as new (...args: any[]) => object;

  // @ts-expect-error mobx-keystone decorator returns new class
  @model(`myApp/${slug}`)
  class GenericModel extends Base {
    update(details: GenericInterface) {
      Object.assign(this, details);
    }

    get $() {
      return this;
    }

    get $view(): TView {
      return {
        ...this.$,
        ...derivedProps(this),
      };
    }
  }

  return GenericModel as ModelClass<
    InstanceType<ReturnType<typeof Model<TProps>>> &
      KeystoneModel<PropsToInterface<TProps> & TView> &
      TView
  >;
}

type EverythingPublic<T> = Pick<
  T,
  {
    [K in keyof T]: K extends string
      ? T[K] extends (
          ...args: any
        ) => any | object | number | string | boolean | null | undefined
        ? K
        : never
      : never;
  }[keyof T]
>;

export function MyStore<
  T extends KeystoneModel<{ id?: number | string | null }>
>(
  ModelClass: {
    new (...args: any[]): T;
  },
  baseURL: string,
  slug: string,
  resetOnFetch?: boolean
) {
  const props = {
    items: prop<T[]>(() => []),
    related: prop<Related[]>(() => []),
    relatedFields: prop<string[]>(() => []),
    optionFields: prop<string[]>(() => []),
    dateFields: prop<string[]>(() => []),
    datetimeFields: prop<string[]>(() => []),
    priceFields: prop<string[]>(() => []),
    pageDetails: prop<PaginatedDetails>(() => defaultPageDetails),
    timeFields: prop<string[]>(() => []),
    isSubscribed: prop<boolean>(false),
    lastUpdated: prop<string>(""),
    latestParam: prop<string>(""),
    countToUpdate: prop<number>(0),
    isLoading: prop<boolean>(false),
  };

  type GenericInterface = Required<PropsToInterface<typeof props>>;

  type ComputedGetters<T> = {
    [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
  };

  @model(`myApp/${slug}Store`)
  class GenericStore extends Model(props) {
    constructor(args: any) {
      super(args);
    }
    onInit() {}

    onAttachedToRootStore() {}

    @computed
    get allItems() {
      const map = new Map<number | string, T>();
      this.items.forEach((item) => map.set(item.id ?? -1, item));
      return map;
    }

    @computed
    get itemsSignature() {
      function computeItemsSignature<T extends { $view: Record<string, any> }>(
        ModelClass: { new (...args: any[]): T },
        items: T[]
      ): string {
        const keys = Object.keys(new ModelClass({}).$view);
        return items
          .map((item) => keys.map((key) => String(item.$view[key])).join("|"))
          .join("::");
      }
      return computeItemsSignature(ModelClass, this.items);
    }

    @modelAction
    setSubscription = function (this: GenericStore, state: boolean) {
      this.isSubscribed = state;
    };

    @modelFlow
    fetchAll = _async(function* (this: GenericStore, params?: string) {
      let result;
      this.isLoading = true;

      this.pageDetails = defaultPageDetails;

      try {
        result = yield* _await(
          fetchItemsRequest<Partial<T>>(baseURL, slug, params)
        );
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Network Error",
        });
        return {
          details: "Network Error",
          ok: false,
          data: null,
          pageDetails: null,
        };
      }

      this.isLoading = false;

      if (!result.ok || !result.data) {
        Swal.fire({
          icon: "error",
          title: "An error has occurred.",
        });
        return {
          details: result.details,
          ok: false,
          data: null,
          pageDetails: null,
        };
      }

      resetOnFetch && this.resetItems();

      result.related?.forEach((s: Related) => {
        const existingRelated = this.related.find(
          (t) => t.field === s.field && t.id === s.id
        );
        if (!existingRelated) {
          this.related.push(s);
        } else {
          existingRelated.name = s.name;
        }
      });

      this.pageDetails = result.pageDetails ?? defaultPageDetails;
      this.dateFields = result.dateFields;
      this.datetimeFields = result.datetimeFields;
      this.timeFields = result.timeFields;
      this.priceFields = result.priceFields;
      this.relatedFields = result.relatedFields;
      this.optionFields = result.optionFields;

      result.data.forEach((s: Partial<T>) => {
        if (!s.id) return;
        if (!this.items.map((i) => i.$view.id).includes(s.id)) {
          this.items.push(new ModelClass(s));
        } else {
          this.items.find((t) => t.$view.id === s.id)?.update(s);
        }
      });
      this.lastUpdated = new Date().toISOString();
      this.latestParam = params ?? "";

      return result;
    });

    @modelFlow
    checkUpdated = _async(function* (this: GenericStore, lastUpdated: string) {
      let result;

      try {
        result = yield* _await(
          fetchItemsRequest<Partial<T>>(
            slug,
            `check_last_updated=1&last_updated=${lastUpdated}`
          )
        );
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Network Error",
        });
        return { details: "Network Error", ok: false, data: null };
      }

      if (!result.ok) {
        Swal.fire({
          icon: "error",
          title: "An error has occurred.",
        });
        return { details: result.details, ok: false, data: null };
      }

      this.countToUpdate = result.pageDetails?.count ?? 0;
    });

    @modelFlow
    fetchUpdated = _async(function* (this: GenericStore) {
      return yield* _await(this.fetchAll(this.latestParam));
    });

    @modelFlow
    addItem = _async(function* (
      this: GenericStore,
      details: NullableProps<Partial<T>>
    ) {
      let result;
      try {
        result = yield* _await(
          postItemRequest<NullableProps<Partial<T>>>(baseURL, slug, details)
        );
      } catch {
        // Swal.fire({ icon: "error", title: "Network Error" });
        return { details: "Network Error", ok: false, data: null };
      }

      if (!result.ok || !result.data) {
        // Swal.fire({ icon: "error", title: "An error has occurred." });
        return { details: result.details, ok: false, data: null };
      }

      const item = new ModelClass(result.data);
      this.items.push(item);

      this.fetchAll(this.latestParam);

      return { details: "", ok: true, data: item };
    });

    @modelFlow
    updateItem = _async(function* (
      this: GenericStore,
      itemId: number | string,
      details: NullableProps<Partial<T>>
    ) {
      let result;
      try {
        result = yield* _await(
          updateItemRequest(baseURL, slug, itemId, details)
        );
      } catch {
        Swal.fire({ icon: "error", title: "Network Error" });
        return { details: "Network Error", ok: false, data: null };
      }

      if (!result.ok || !result.data) {
        // Swal.fire({ icon: "error", title: "An error has occurred." });
        return { details: result.details, ok: false, data: null };
      }

      this.items
        .find((t) => t.$view.id === (result.data?.id ?? -1))
        ?.update(result.data);
      return { details: "", ok: true, data: result.data };
    });

    @modelFlow
    deleteItem = _async(function* (
      this: GenericStore,
      itemId: number | string
    ) {
      let result;
      try {
        result = yield* _await(deleteItemRequest(baseURL, slug, itemId));
      } catch {
        Swal.fire({ icon: "error", title: "Network Error" });
        return { details: "Network Error", ok: false, data: null };
      }

      if (!result.ok) {
        return result;
      }

      const index = this.items.findIndex((s) => s.$view.id === itemId);
      if (index !== -1) {
        this.items.splice(index, 1);
      }

      return result;
    });

    @modelFlow
    authBase = _async(function* (
      this: GenericStore,
      method: "login" | "reauth" | "logout",
      credentials?: LoginInterface
    ) {
      let result;
      try {
        result = yield* _await(
          postItemRequest(baseURL, `${method}`, credentials)
        );
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Network Error",
        });
        error;
        return { details: "Network Error", ok: false, data: null };
      }
      if (!result.ok || !result.data) {
        Swal.fire({
          icon: "error",
          title: "An error has occurred.",
        });
      }
      return { details: "", ok: true, data: null };
    });

    @modelAction
    resetItems = function (this: GenericStore) {
      this.items = [];
    };
  }

  type Methods = EverythingPublic<GenericStore>;

  return GenericStore as unknown as new (args: any) => Methods &
    GenericInterface &
    ComputedGetters<GenericStore>;
}

export type IStore = InstanceType<ReturnType<typeof MyStore<any>>>;

export const functionBinder = (item: any) => {
  for (const key of Object.getOwnPropertyNames(item)) {
    if (typeof (item as any)[key] === "function") {
      (item as any)[key] = (item as any)[key].bind(item);
    }
  }

  const proto = Object.getPrototypeOf(item);
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === "constructor") continue;
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (desc?.value && typeof desc.value === "function") {
      (item as any)[key] = desc.value.bind(item);
    }
  }
};
type CamelCase<S extends string> = S extends `${infer F}${infer R}`
  ? `${Lowercase<F>}${R}`
  : S;

export function storesToProps<
  T extends Record<string, new (...args: any[]) => any>
>(
  classes: T
): {
  [K in keyof T as CamelCase<K & string>]: MaybeOptionalModelProp<
    InstanceType<T[K]>
  >;
} {
  const result = {} as Record<string, MaybeOptionalModelProp<unknown>>;

  for (const key in classes) {
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);

    // Pass a factory to prop() so it's initialized
    result[camelKey] = prop<InstanceType<T[typeof key]>>(
      () => new classes[key]({})
    );
  }

  return result as any;
}

export function instantiateStores<
  T extends Record<string, new (...args: any[]) => any>
>(
  classes: T
): {
  [K in keyof T as CamelCase<K & string>]: InstanceType<T[K]>;
} {
  const result = {} as Record<string, unknown>;

  for (const key in classes) {
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    result[camelKey] = new classes[key]({});
  }

  return result as any; // TS can't infer runtime object shape fully
}
