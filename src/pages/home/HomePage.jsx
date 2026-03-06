import { Button, Typography } from '@mui/material'
import React from 'react'

const HomePage = () => {
const handleClick = () => {
    localStorage.removeItem("AuthToken");
    window.location.reload();
}
  return (
    <div>
      <Typography>Home page</Typography>
      <Button onClick={handleClick} variant="contained">Log out</Button>
    </div>
  )
}

export  {HomePage}
