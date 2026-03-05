export const CartDropdown = () => {
  return (
    <div className="absolute font-light bg-white shadow-[rgba(0,0,0,0.08)_0px_0px_25px_0px] box-border caret-transparent hidden leading-4 w-full z-[9] mt-[3px] p-[5px] border-0 border-none border-black left-0 top-[45px] md:box-content md:w-[370px] md:z-[10000] md:border md:border-zinc-200 md:border-solid md:left-[891.056px] md:top-[89px] before:accent-auto before:border-b-neutral-400 before:caret-transparent before:text-black before:hidden before:text-base before:not-italic before:normal-nums before:font-light before:h-0 before:tracking-[normal] before:leading-4 before:list-outside before:list-disc before:ml-[-9px] before:pointer-events-none before:absolute before:text-start before:indent-[0px] before:normal-case before:visible before:w-0 before:border-t-transparent before:border-x-transparent before:border-separate before:border-[9px] before:border-solid before:left-[80%] before:bottom-full before:font-helvetica_neue after:accent-auto after:caret-transparent after:text-black after:hidden after:text-base after:not-italic after:normal-nums after:font-light after:h-0 after:tracking-[normal] after:leading-4 after:list-outside after:list-disc after:pointer-events-none after:absolute after:text-start after:indent-[0px] after:normal-case after:visible after:w-0 after:-ml-2 after:border-t-transparent after:border-b-white after:border-x-transparent after:border-separate after:border-8 after:border-solid after:left-[80%] after:bottom-full after:font-helvetica_neue">
      <ul className="border-b-neutral-300 caret-transparent table w-full pl-0 border-b border-collapse">
        <li className="relative caret-transparent table-row list-none">
          <div className="caret-transparent text-center w-full my-[25px]">
            Empty Cart
          </div>
        </li>
      </ul>
      <div className="text-neutral-700 caret-transparent px-[15px] py-2.5">
        <div className="text-black text-sm font-black caret-transparent table-cell leading-[17.5px] align-middle w-full py-2.5">
          <span className="text-[13px] font-normal caret-transparent leading-[16.25px] mr-[5px]">
            Subtotal:
          </span>
          <span className="caret-transparent mr-[5px]">$0.00</span>
        </div>
        <div className="caret-transparent table-cell align-top py-2.5">
          <a
            href="https://www.bigjaysforney.com/store/checkout?cart="
            className="text-white text-sm font-normal bg-black bg-no-repeat caret-transparent block float-right bg-[position:100%_-100px] hover:bg-black/60"
          >
            <span className="text-[11px] font-bold caret-transparent block float-left tracking-[1.65px] leading-[11px] uppercase text-nowrap px-8 py-[15px] font-josefin_sans">
              Checkout
            </span>
            <span className="caret-transparent"></span>
          </a>
        </div>
      </div>
    </div>
  );
};
