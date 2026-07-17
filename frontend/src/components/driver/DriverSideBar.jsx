function SideBar() {
return ( 
    <aside className="w-60 shrink-0 box-border bg-[#F9F9FA] px-4 py-5 ">
        <nav className="mt-6 flex flex-col gap-2"> 
            <button type="button" className="w-full cursor-pointer rounded-[10px] border-none bg-transparent
                                    px-3 py-3 text-left font-semibold hover:bg-[#dfe8f5]">
                내 문서
            </button>
            <button type="button" className="w-full cursor-pointer rounded-[10px] border-none bg-transparent
                                            px-3 py-3 text-left font-semibold hover:bg-[#dfe8f5]">
                최근 문서
            </button>

            <button type="button" className="w-full cursor-pointer rounded-[10px] border-none bg-transparent
                                            px-3 py-3 text-left font-semibold hover:bg-[#dfe8f5]">
                즐겨찾기
            </button>

            <button type="button" className="w-full cursor-pointer rounded-[10px] border-none bg-transparent
                                            px-3 py-3 text-left font-semibold hover:bg-[#dfe8f5]">
                공유 문서
            </button>

            <button type="button" className="w-full cursor-pointer rounded-[10px] border-none bg-transparent
                                            px-3 py-3 text-left font-semibold hover:bg-[#dfe8f5]">
                휴지통
            </button>
        </nav>
    </aside>
);
}

export default SideBar;
