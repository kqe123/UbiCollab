import { BubbleMenu } from '@tiptap/react/menus'
import type { Editor } from '@tiptap/react'
import Box from '@mui/material/Box';
import AddCommentIcon from '@mui/icons-material/AddComment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

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
            <Tooltip 
              title="Add Comment"
              arrow
              placement="bottom"
              slotProps={{
                popper: {
                  modifiers: [{ name: 'offset', options: { offset: [0, 0] } }],
                },
                tooltip: {
                  sx: {
                  backgroundColor: '#000',
                  color: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)'
                  },
                },
              }}
            >
              <IconButton 
                size="small"
              >
                  <AddCommentIcon />
              </IconButton>
            </Tooltip>
        </Box>
    </BubbleMenu>
  )
}
export default MyBubbleMenu;
