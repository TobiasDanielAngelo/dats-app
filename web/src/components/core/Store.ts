import { model, Model } from "mobx-keystone";
import { createContext, useContext } from "react";
import * as AllStores from "./_AllStores";
import { instantiateStores, storesToProps } from "./_GenericStore";

@model("myApp/Store")
export class Store extends Model(storesToProps(AllStores)) {}
export const createStore = () => new Store(instantiateStores(AllStores));
export const StoreContext = createContext<Store | null>(null);
export const useStore = () => useContext(StoreContext)!;
