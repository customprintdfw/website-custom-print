export const NavbarCart = () => {
  return (
    <div className="caret-transparent table-cell text-right align-middle w-[30px] md:w-3/12">
      <span className="caret-transparent hidden md:inline-block"></span>
      <span className="relative caret-transparent inline-block">
        <a
          href="#"
          className="relative text-transparent text-[0px] font-medium caret-transparent block tracking-[normal] leading-[0px] uppercase pl-0 py-0 font-josefin_sans md:text-black md:text-sm md:tracking-[0.7px] md:leading-[14px] md:pl-5 md:py-2.5 after:accent-auto after:caret-transparent after:text-transparent after:block after:text-[0px] after:not-italic after:normal-nums after:font-medium after:h-px after:tracking-[normal] after:leading-[0px] after:list-outside after:list-disc after:pointer-events-auto after:absolute after:text-right after:indent-[0px] after:uppercase after:visible after:w-0 after:overflow-hidden after:border-separate after:left-[15px] after:bottom-[5px] after:font-josefin_sans after:md:text-black after:md:text-sm after:md:tracking-[0.7px] after:md:leading-[14px]"
        >
          Cart (
          <span className="text-xs bg-zinc-200 caret-transparent inline-block tracking-[normal] leading-3 min-w-[18px] text-center p-1.5 md:text-sm md:bg-transparent md:inline md:tracking-[0.7px] md:leading-[14px] md:min-w-0 md:text-right md:p-0">
            0
          </span>
          )
        </a>
      </span>
    </div>
  );
};
