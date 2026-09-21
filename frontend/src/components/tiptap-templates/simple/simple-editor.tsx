"use client"

import { useEffect, useRef, useState } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

// 사용자 정의 components
import SaveButton from "@/components/editor/toolbar/SaveButton"
import LoadButton from "@/components/editor/toolbar/LoadButton"
import Comment from "@/components/editor/panel/Comment"
import Notice from "@/components/editor/panel/Notice"
import MyBubbleMenu from "@/components/editor/menu/BubbleMenu"
import axios from "axios";
import toast from "react-hot-toast";
import LoadDocumentModal from "@/components/modal/LoadDocumentModal";
import Text from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide'
import DOMPurify from "dompurify";
import { useQueryClient } from "@tanstack/react-query";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  onSave,
  isSaving,
  isMobile,
  canSave,
  canEdit
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  onSave : () => Promise<void>
  isSaving : boolean
  isMobile: boolean
  canSave : boolean
  canEdit : boolean
}) => {
  const [isLoadModalOpen, setIsLoadModalOpen] = useState<boolean>(false);

  const openLoadModal = () => {
        setIsLoadModalOpen(true);
  };

  const closeLoadModal = () => {
        setIsLoadModalOpen(false);
  };
  return (
    <>
      <Spacer size="6px"/>
       {/* 저장 버튼 추가 */}
      <ToolbarGroup>
        <LoadButton onClick={openLoadModal} />
        <SaveButton 
          onSave={onSave}
          isSaving={isSaving}
          canSave={canSave}/>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>
      {!canEdit && (
          <Text 
            variant="body2"
            sx={{color : 'red', ml : 2, fontWeight : 500}}>※ 현재 읽기 모드입니다.</Text>
      )}
      <Spacer />
      {isMobile && <ToolbarSeparator />}
      {/* isLoadModalOpen이 true일때 LoadDocumentModal 컴포넌트 반환 */}
          {isLoadModalOpen && (
             <LoadDocumentModal onClose={closeLoadModal} />
          )}
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor({
  fileName,
  fileId,
  initialContent,
  permission,
  sidePanel,
  setSidePanel,
  } : { 
    fileName: string;
    fileId : string | undefined;
    initialContent: string;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" |"MANAGER" | "OWNER" | null;
    sidePanel : "NONE" | "COMMENT" | "NOTICE";
    setSidePanel : React.Dispatch<React.SetStateAction<"NONE" | "COMMENT" | "NOTICE">>;
  }) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  const [isSaving, setIsSaving] = useState<boolean>(false); // 저장 상태를 나타내는 isSaving 추가
  const [isHaveUpdate, setIsHaveUpdate] = useState<boolean>(false); // 업데이트 유무를 나타내는 true/false
  const toolbarRef = useRef<HTMLDivElement>(null)

  // 마지막 저장 상태의 스냅샷
  // EditorPage에서 file이 isLoading일때는 SimpleEditor 자체를 렌더링 하지 않으므로
  // fileName, initialContent가 확정된 값이다. 그래서 그냥 초기값으로 채운다.
  const savedSnapshot = useRef<{itemName : string, content: string}>({
    itemName: fileName,
    content: DOMPurify.sanitize(initialContent),
  }); 
  const canEdit = permission === "MANAGER" || permission === "EDITOR";
  const canSave = canEdit && isHaveUpdate
  const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
  const queryClient = useQueryClient(); // QueryClient 가져옴

  const editor = useEditor({
    immediatelyRender: false,
    editable : canEdit, // false이면 편집 불가
    // 에디터 내용이 변경되면, 업데이트 유무를 체크하는 checkUpdates() 실행
    onUpdate: ({ editor }) => {
      checkUpdates(fileName, DOMPurify.sanitize(editor.getHTML()));
    },

    // 에디터 선택 영역이 변경될때 발생하는 콜백 함수
    onSelectionUpdate: ({ editor }) => {
        const { from, to } = editor.state.selection
        const text = editor.state.doc.textBetween(from, to, ' ')
    },
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content : DOMPurify.sanitize(initialContent), // 에디터 내용 업데이트
  })

  // handleSave() : fileName, content, extension을 보내서 DB에 Document를 저장하도록
  //                API를 호출하는 함수
  const handleSave = async () => {
    if (!editor) {
      console.error("에디터가 아직 준비되지 않았습니다.");
      return;
    }
  
    // 문서명 앞뒤 공백 제거
    const trimFileName = fileName.trim();
    const sanitizedContent = DOMPurify.sanitize(editor.getHTML());
    
    // 변경사항이 있을시에만 body에 추가
    const fileData = {
      ...((fileName !== savedSnapshot.current.itemName) && {
        itemName: trimFileName === "" ? "제목 없는 문서" : trimFileName,
      }),
      ...((sanitizedContent !== savedSnapshot.current.content) && {
        content: sanitizedContent,
      })
    };
  
    try {
      setIsSaving(true);
        
      // 파일 저장 Backend API 호출
      await axios.patch(
        `http://localhost:8080/api/driveitem/save/${fileId}`,
        fileData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
        
      console.log("알림 : 문서 저장 성공");
      toast.success("성공적으로 저장되었습니다.");
      savedSnapshot.current = { itemName: trimFileName, content: sanitizedContent }; // 스냅샷 교체
      setIsHaveUpdate(false); // 업데이트 유무를 false로 전환
      
      // 변경된 DriveItem 내용을 실시간으로 최신화
      await queryClient.invalidateQueries({
        queryKey: ["driveItems"]
      });
    } catch (error: unknown) {
      console.error("문서 저장 실패:", error);
      
      // axios에서 발생한 오류인 경우
      if (axios.isAxiosError(error)) {
        console.error("백엔드 응답:", error.response?.data);
        toast.error(error.response?.data?.message ?? "문서 저장에 실패했습니다.");
      } 
      // 그 외의 오류인 경우
      else {
        console.error("알 수 없는 오류:", error);
        toast.error("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // checkUpdates() : 현재 fileName, content와 savedSnapshot(마지막 저장 시점 스냅샷)
  //                  을 비교해 변경되었다면 isHaveUpdate를 true로 변환
  const checkUpdates = (currentFileName: string, currentContent: string) => {
    if( currentFileName !== savedSnapshot.current.itemName ||
      currentContent !== savedSnapshot.current.content) {
      setIsHaveUpdate(true);
    }
  };

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  // fileName이 변경됬다면, 업데이트 유무를 체크하는 checkUpdates() 실행
  useEffect(() => {
    checkUpdates(fileName, editor?.getHTML() ?? savedSnapshot.current.content)
  }, [fileName]);

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              onSave={handleSave}   // MainToolbarContent에 onSave 이름으로 저장 로직 전달
              isSaving={isSaving}   // MainToolbarContent에 isSaving도 전달
              isMobile={isMobile}
              canSave={canSave}
              canEdit={canEdit}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />

        <Slide direction="left" in={sidePanel !== "NONE"} mountOnEnter unmountOnExit timeout={400}>
          <Box
            sx={{
              position: "fixed",  // fixed
              top: "70px",        // 헤더 높이만큼 내려서 헤더와 안 겹치게
              right : 0,
              width : '320px',
              height : '100%',
              background: '#fff',
              zIndex: 50,
              boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
            }}
          >
            {sidePanel === "NOTICE" && (
              <Notice 
                sidePanel={sidePanel}
                setSidePanel={setSidePanel}
              />
            )}
            {sidePanel === "COMMENT" && (
              <Comment 
                sidePanel={sidePanel}
                setSidePanel={setSidePanel}
              />
            )}
            
          </Box>
        </Slide>
        {editor && <MyBubbleMenu editor={editor} />}
      </EditorContext.Provider>
    </div>
  )
}
