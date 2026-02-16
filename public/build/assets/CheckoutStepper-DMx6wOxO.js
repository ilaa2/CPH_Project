import{j as r,R as i}from"./app-BQMKpOmJ.js";function o({currentStep:n=1}){const t=[{number:1,label:"Metode"},{number:2,label:"Alamat"},{number:3,label:"Ongkir"},{number:4,label:"Bayar"}];return r.jsx("div",{className:"flex items-center justify-center mb-8",children:t.map((e,m)=>{const s=e.number<n,l=e.number===n,a=e.number>n;return r.jsxs(i.Fragment,{children:[r.jsxs("div",{className:`flex items-center ${a?"text-gray-400":"text-green-600"}`,children:[r.jsx("div",{className:`
                                rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm
                                ${s?"bg-green-600 text-white":""}
                                ${l?"bg-green-600 text-white":""}
                                ${a?"border-2 border-gray-300 text-gray-400":""}
                            `,children:s?"✓":e.number}),r.jsx("span",{className:`ml-2 text-sm ${l?"font-semibold":"font-medium"} ${m<t.length-1?"hidden sm:inline":""}`,children:e.label})]}),m<t.length-1&&r.jsx("div",{className:`
                                flex-auto border-t-2 mx-3 max-w-[60px]
                                ${e.number<n?"border-green-600":"border-gray-200"}
                            `})]},e.number)})})}export{o as C};
