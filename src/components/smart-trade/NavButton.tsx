import React from 'react';
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

interface NavButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
}

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'white',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  position: 'absolute',
  zIndex: 2,
  top: '50%',
  transform: 'translateY(-50%)',
  width: '30px',
  height: '30px',
  minWidth: '30px',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  }
}));

const NavButton: React.FC<NavButtonProps> = ({ direction, onClick }) => {
  return (
    <StyledIconButton
      onClick={onClick}
      sx={{
        left: direction === 'prev' ? '-15px' : 'auto',
        right: direction === 'next' ? '-15px' : 'auto',
      }}
      size="small"
    >
      {direction === 'prev' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="#FF5555"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z" fill="#FF5555"/>
        </svg>
      )}
    </StyledIconButton>
  );
};

export default NavButton;
