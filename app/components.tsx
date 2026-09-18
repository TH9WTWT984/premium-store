"use client";
import { useStore } from "./store-provider";

export function AddToCartButton() {
 const { addToCart } = useStore();
 return <button className="btn btn-light" style={{width:"100%",marginTop:"10px"}} onClick={addToCart}>Add to bag</button>;
}