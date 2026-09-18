import { BubbleMenu } from '@tiptap/react/menus'
import type { Editor } from '@tiptap/react'
import Box from '@mui/material/Box';
import AddCommentIcon from '@mui/icons-material/AddComment';
import IconButton from '@mui/material/IconButton';

interface MyBubbleMenuProps {
  editor: Editor
}

function MyBubbleMenu ({ editor }: MyBubbleMenuProps) {
  return (
    <BubbleMenu 
        editor={editor}
        updateDelay={300}
        options={{
          placement: 'bottom',
        }}
    >
        <Box sx={{
            boxShadow: 3,
            borderRadius: '24px', // rounded-[24px]
            bgcolor: 'white', // bg-white
        }}>
            <IconButton size="small">
                <AddCommentIcon />
            </IconButton>
        </Box>
    </BubbleMenu>
  )
}
export default MyBubbleMenu;
