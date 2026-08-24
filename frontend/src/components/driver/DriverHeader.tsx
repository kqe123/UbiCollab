import logo from '../../assets/logo.jpg'
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';

function Header() {
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

    return (
        <Box 
            component="header" 
            sx={{ width: '100%', height: '70px', bgcolor: '#104FCD', display: 'flex',
                alignItems: 'center', boxSizing: 'border-box', px: 2,}}
        >
            {/* Logo */}
            <Box 
                component="img"
                src={logo}
                sx={{ width: '15%', maxWidth: 200, height: '60%', mx: 'auto'}}
            />

            {/* Search */}
            <Box sx={{ flex: 1, height : '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <TextField 
                    sx={{
                        width: '60%',
                        bgcolor: 'white',
                        borderRadius: '9px',
                        '& .MuiInputBase-root': {
                            height: '48px', // 원하는 높이는 여기서 지정
                            borderRadius: '9px',
                        },
                    }}
                />
            </Box>

            {/* Buttons */}
            <Box sx={{ width : '20%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap : 2}}>
                <Avatar alt="프로필사진" sx={{ width: 50, height: 50, cursor : 'pointer'}} />
            </Box>
        </Box>
    );
}

export default Header;