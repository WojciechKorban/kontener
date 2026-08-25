"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
export function FaqList({ items }: { items: readonly (readonly string[])[] }) { const [open,setOpen]=useState(0); return <div className="border-t border-[#ced0c9]">{items.map((x,i)=><button key={x[0]} onClick={()=>setOpen(open===i?-1:i)} className="block w-full border-b border-[#ced0c9] py-5 text-left"><span className="flex items-center justify-between gap-4 font-bold">{x[0]}<Plus className={`transition ${open===i?"rotate-45":""}`} size={20}/></span>{open===i&&<span className="mt-3 block max-w-2xl text-sm leading-7 text-[#666b63]">{x[1]}</span>}</button>)}</div>; }
