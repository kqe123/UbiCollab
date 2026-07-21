import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChangeNameMenu from "./ChangeNameMenu.jsx";
function DocumentMenuModal({x, y, document, onClose, openRenameMenu}) {
    const navigate = useNavigate();
    return (
        <>
        <div className="fixed inset-0 z-40" onClick={onClose}>
            <div className="fixed z-50 w-44 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                style={{ left: `${x}px`, top: `${y}px`,}}
                onClick={(e) => e.stopPropagation()}>
                <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => {
                        navigate(`editor/${document.id}`);
                        onClose();
                    }}>
                    열기
                </button>
                <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => {
                        onClose();
                        openRenameMenu();
                    }}>
                    이름 변경
                </button>
                <hr className="my-1 border-gray-200" />
                <button type="button" className=" w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
                    휴지통으로 이동
                </button>
            </div>
        </div>
        </>
    );
}

export default DocumentMenuModal;